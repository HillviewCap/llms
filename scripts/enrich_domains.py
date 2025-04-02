import os
import json
import time
import requests # Use requests directly
from dotenv import load_dotenv # To load .env file

# --- Configuration ---
INPUT_FILENAME = "llms_metadata.json"
OUTPUT_FILENAME = "llms_metadata.json"
API_CALL_DELAY_SECONDS = 1.0 # Delay between Cloudflare API calls

# --- Main Enrichment Logic ---

def enrich_domains():
    """
    Loads metadata, queries Cloudflare API for domain categories,
    and saves the enriched data.
    """
    # 1. Load existing metadata
    try:
        with open(INPUT_FILENAME, 'r') as f:
            metadata_list = json.load(f)
        print(f"Loaded {len(metadata_list)} records from {INPUT_FILENAME}")
    except FileNotFoundError:
        print(f"Error: Input file not found: {INPUT_FILENAME}")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {INPUT_FILENAME}")
        return
    except Exception as e:
        print(f"Error loading {INPUT_FILENAME}: {e}")
        return

    # 2. Extract unique domains
    unique_domains = set()
    for record in metadata_list:
        domain = record.get("domain")
        if domain:
            unique_domains.add(domain)

    if not unique_domains:
        print("No source domains found in the input data.")
        # Optionally save the original data to the output file if needed
        # with open(OUTPUT_FILENAME, 'w') as f:
        #     json.dump(metadata_list, f, indent=4)
        return

    print(f"Found {len(unique_domains)} unique domains to enrich.")

    # 3. Get Cloudflare Credentials from Environment
    api_token = os.environ.get("CLOUDFLARE_API_KEY") # Assuming token is stored here
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")

    if not api_token:
        print("Error: CLOUDFLARE_API_KEY environment variable not set.")
        return
    if not account_id:
        print("Error: CLOUDFLARE_ACCOUNT_ID environment variable not set.")
        return

    # 4. Enrichment Loop
    enrichment_data = {}
    print("Starting domain enrichment process (this may take time)...")
    processed_domains = 0
    total_domains = len(unique_domains)

    for domain in unique_domains:
        processed_domains += 1
        print(f"Processing domain {processed_domains}/{total_domains}: {domain}...")
        categories = [] # Default to empty list

        try:
            # Using requests library directly based on user's working example
            api_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/intel/domain"
            headers = {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json"
            }
            params = {"domain": domain}

            response = requests.get(api_url, headers=headers, params=params, timeout=15) # Increased timeout slightly

            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    result = data.get("result", {})
                    # Extract categories
                    if "content_categories" in result and result["content_categories"]:
                        categories = [cat.get('name', 'Unknown') for cat in result["content_categories"] if isinstance(cat, dict)]
                        print(f"  Found categories: {categories}")
                    else:
                        print(f"  No 'content_categories' field found for {domain} in successful response.")
                else:
                    errors = data.get("errors", [])
                    print(f"  Cloudflare API Error for {domain} (Success=False): {errors}")
                    # Specific check for auth error within the JSON response
                    if any(err.get("code") == 10001 for err in errors if isinstance(err, dict)):
                         print("  Hint: Authentication error reported by API. Double-check token permissions and account ID.")
            else:
                print(f"  HTTP Error for {domain}: Status Code {response.status_code}")
                try:
                    # Try to print error details from response body if available
                    error_details = response.json()
                    print(f"  Error details: {error_details}")
                    if response.status_code == 401 or response.status_code == 403:
                         print("  Hint: HTTP 401/403 suggests an authentication/authorization issue. Verify token and permissions.")
                except json.JSONDecodeError:
                    print(f"  Response body (non-JSON): {response.text[:200]}...") # Print snippet if not JSON

        except requests.exceptions.RequestException as e: # Catch network errors
            print(f"  Network error processing {domain}: {e}")
        except json.JSONDecodeError as e: # Catch errors decoding JSON response
             print(f"  Error decoding JSON response for {domain}: {e}")
        except Exception as e: # Catch any other unexpected errors during the process
            print(f"  Unexpected error processing {domain}: {e}")

        # Store results (even if empty/error)
        enrichment_data[domain] = {
            "cf_categories": categories
            # "cf_org_info": org_info # Add if org info extraction is implemented
        }

        # Respect rate limits
        time.sleep(API_CALL_DELAY_SECONDS)

    print("Domain enrichment loop completed.")

    # 5. Merge Enrichment Data
    enriched_metadata_list = []
    for record in metadata_list:
        enriched_record = record.copy() # Start with original record
        domain = enriched_record.get("domain")

        if domain and domain in enrichment_data:
            # Ensure metadata dict exists
            if "metadata" not in enriched_record:
                 enriched_record["metadata"] = {}
            # Add the enrichment fields
            enriched_record["metadata"].update(enrichment_data[domain])

        enriched_metadata_list.append(enriched_record)

    # 6. Save Enriched Data
    try:
        with open(OUTPUT_FILENAME, 'w') as f:
            json.dump(enriched_metadata_list, f, indent=4)
        print(f"Successfully saved enriched data for {len(enriched_metadata_list)} records to {OUTPUT_FILENAME}")
    except IOError as e:
        print(f"Error writing enriched data to {OUTPUT_FILENAME}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred saving enriched data: {e}")


if __name__ == "__main__":
    # Load environment variables from .env file
    load_dotenv()
    enrich_domains()