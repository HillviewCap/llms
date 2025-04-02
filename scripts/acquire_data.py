import os
import requests
import json
import re
import urllib.parse
import time
import hashlib # Added for SHA256 calculation
import csv # Added for reading domains from CSV
from datetime import datetime, timezone # Added for timestamping
from dotenv import load_dotenv # To load .env file
import asyncio # Added for async processing
import aiohttp # Added for async HTTP requests
from enrich_domains import enrich_domains # Import the domain enrichment function

# --- Configuration ---
BRAVE_API_ENDPOINT = "https://api.search.brave.com/res/v1/web/search" # Brave Search API endpoint
GITHUB_API_ENDPOINT = "https://api.github.com/search/code"
FILENAMES_TO_SEARCH = ["llms.txt", "llms-full.txt"]
# DATA_DIR = "data" # Removed, no longer saving files locally
REQUEST_TIMEOUT = 10 # seconds for network requests
USER_AGENT = "LLMS-Data-Acquisition-Script/1.0" # Be polite to servers
# Removed hardcoded TOP_DOMAINS_TO_CHECK list
# --- Helper Functions ---

def get_api_keys():
    """
    Retrieves API keys from environment variables (BRAVE_API_KEY, GITHUB_TOKEN).
    Exits if keys are not found (currently prints warnings).
    """
    brave_key = os.environ.get("BRAVE_API_KEY")
    github_token = os.environ.get("GITHUB_TOKEN")

    if not brave_key:
        print("Warning: BRAVE_API_KEY environment variable not set. Brave search will be skipped.")
        # Optionally exit or handle differently
        # exit(1)
    if not github_token:
        print("Warning: GITHUB_TOKEN environment variable not set. GitHub search will be skipped.")
        # Optionally exit or handle differently
        # exit(1)

    # Return keys even if None, let API calls handle potential failures
    return brave_key, github_token

# Removed sanitize_filename function as files are no longer saved locally
def load_existing_data():
    """
    Loads existing data from llms_metadata.json.
    Returns an empty list if the file doesn't exist or is empty.
    """
    try:
        with open("llms_metadata.json", 'r') as f:
            content = f.read().strip()
            if not content:  # Handle empty file case explicitly
                print("Empty llms_metadata.json file found. Starting with empty dataset.")
                return []
            data = json.loads(content)
            print(f"Loaded {len(data)} existing entries from llms_metadata.json")
            return data
    except FileNotFoundError:
        print("No existing data file found. Starting with empty dataset.")
        return []
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from llms_metadata.json: {e}. Starting with empty dataset.")
        return []
    except Exception as e:
        print(f"Error loading existing data: {e}")
        return []

async def process_url_async(url, session):
    """
    Asynchronously fetches content from a URL, calculates its SHA256 hash, extracts metadata,
    adds a timestamp, and returns the information without saving the file.
    Handles basic network errors. Returns None on failure.
    """
    try:
        headers = {'User-Agent': USER_AGENT}
        # Use stream=False to get content directly, adjust if memory becomes an issue
        async with session.get(url, timeout=REQUEST_TIMEOUT, headers=headers) as response:
            if response.status != 200:
                print(f"Error processing {url}: HTTP status {response.status}")
                return None
                
            # Check content type - basic check for text-based files
            content_type = response.headers.get('content-type', '').lower()
            if 'text' not in content_type and 'json' not in content_type and 'plain' not in content_type:
                print(f"Warning: Skipping processing for {url} - potentially non-text content type: {content_type}")
                return None # Indicate failure to process
            
            content = await response.read() # Get the raw bytes content
            content_str = content.decode('utf-8', errors='replace')  # Convert bytes to string for storage
            sha256_hash = hashlib.sha256(content).hexdigest()
            
            # Extract metadata (domain)
            parsed_url = urllib.parse.urlparse(url)
            domain = parsed_url.netloc
            metadata = {"source_domain": domain}
            
            # Get current UTC time and format as ISO 8601 string
            current_time = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
            
            print(f"Successfully processed: {url} (Hash: {sha256_hash[:8]}...)")
            return {
                "url": url,
                "domain": domain,
                "status_code": response.status,
                "content": content_str,
                "content_hash": sha256_hash,
                "metadata": metadata,
                "last_checked_utc": current_time
            }

    except asyncio.TimeoutError:
        print(f"Timeout processing {url}")
        return None
    except aiohttp.ClientError as e:
        print(f"Error processing {url}: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred processing {url}: {e}")
        return None

# Keeping the original function for compatibility
def process_url(url):
    """
    Fetches content from a URL, calculates its SHA256 hash, extracts metadata,
    adds a timestamp, and returns the information without saving the file.
    Handles basic network errors. Returns None on failure.
    """
    try:
        headers = {'User-Agent': USER_AGENT}
        # Use stream=False to get content directly, adjust if memory becomes an issue
        response = requests.get(url, timeout=REQUEST_TIMEOUT, headers=headers)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)

        # Check content type - basic check for text-based files
        content_type = response.headers.get('content-type', '').lower()
        if 'text' not in content_type and 'json' not in content_type and 'plain' not in content_type:
             print(f"Warning: Skipping processing for {url} - potentially non-text content type: {content_type}")
             return None # Indicate failure to process

        content = response.content # Get the raw bytes content
        content_str = content.decode('utf-8', errors='replace')  # Convert bytes to string for storage
        sha256_hash = hashlib.sha256(content).hexdigest()

        # Extract metadata (domain)
        parsed_url = urllib.parse.urlparse(url)
        domain = parsed_url.netloc
        metadata = {"source_domain": domain}

        # Get current UTC time and format as ISO 8601 string
        current_time = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

        print(f"Successfully processed: {url} (Hash: {sha256_hash[:8]}...)")
        return {
            "url": url,
            "domain": domain,
            "status_code": response.status_code,
            "content": content_str,
            "content_hash": sha256_hash,
            "metadata": metadata,
            "last_checked_utc": current_time
        }

    except requests.exceptions.RequestException as e:
        print(f"Error processing {url}: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred processing {url}: {e}")
        return None

# --- API Search Functions ---

def search_brave(query, api_key):
    """
    Performs a search using the Brave Search API.
    Returns a list of URLs found that directly point to 'llms.txt' or 'llms-full.txt'.
    """
    if not api_key:
        print("Skipping Brave search: API key not provided.")
        return []

    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": api_key,
        'User-Agent': USER_AGENT
    }
    # Using 'count' parameter, default might be small. Adjust as needed.
    params = {"q": query, "count": 20} # Brave default count is 20, max might vary
    urls = [] # List to store filtered URLs
    raw_urls_found = 0 # Counter for total URLs returned by API before filtering
    response = None
    try:
        response = requests.get(BRAVE_API_ENDPOINT, headers=headers, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        search_results = response.json()

        # Parse Brave's response structure (adjust if needed based on actual API)
        # Assuming results are within response['web']['results']
        results_list = search_results.get("web", {}).get("results", [])
        if results_list:
            for result in results_list:
                if "url" in result:
                    potential_url = result["url"]
                    raw_urls_found += 1
                    try:
                        parsed_url = urllib.parse.urlparse(potential_url)
                        # Check if the path ends with one of the target filenames
                        if any(parsed_url.path.endswith(f"/{filename}") or parsed_url.path == filename for filename in FILENAMES_TO_SEARCH):
                             urls.append(potential_url)
                        # else:
                        #     print(f"Debug: Skipping Brave URL (path mismatch): {potential_url}") # Optional debug print
                    except Exception as parse_err:
                        print(f"Warning: Could not parse URL from Brave search: {potential_url} - {parse_err}")

        print(f"Brave search for '{query}' found {raw_urls_found} potential URLs, filtered down to {len(urls)} direct file URLs.")

    except requests.exceptions.RequestException as e:
        print(f"Error during Brave search for '{query}': {e}")
        if response is not None:
             print(f"Brave API Response Status: {response.status_code}")
             print(f"Brave API Response Text: {response.text[:200]}...") # Log snippet
    except json.JSONDecodeError:
        print(f"Error decoding Brave API response for '{query}'. Response: {response.text[:200]}...") # Log snippet
    except Exception as e:
        print(f"An unexpected error occurred during Brave search for '{query}': {e}")

    return urls

def search_github(query, api_token):
    """
    Performs a code search using the GitHub API.
    Returns a list of raw content URLs found.
    """
    if not api_token:
        print("Skipping GitHub search: API token not provided.")
        return []

    headers = {
        "Authorization": f"token {api_token}",
        "Accept": "application/vnd.github.v3+json",
        'User-Agent': USER_AGENT
    }
    # GitHub search query syntax: filename:llms.txt
    params = {"q": query, "per_page": 100} # Max results per page
    urls = []
    response = None
    try:
        response = requests.get(GITHUB_API_ENDPOINT, headers=headers, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        search_results = response.json()

        if "items" in search_results:
            for item in search_results["items"]:
                # Prefer the raw content URL if available via html_url -> raw conversion
                # Basic conversion, might need refinement for different GitHub structures
                raw_url = item.get("html_url", "").replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
                if raw_url:
                    urls.append(raw_url)
                # Fallback or alternative: check if 'git_url' or other fields provide direct download links
                # print(f"Debug GitHub Item: {item.get('name')}, HTML: {item.get('html_url')}, Git: {item.get('git_url')}")


        print(f"GitHub search for '{query}' found {len(urls)} potential raw URLs.")
        # Handle pagination if total_count > per_page and more results are needed

    except requests.exceptions.RequestException as e:
        print(f"Error during GitHub search for '{query}': {e}")
        # Check for rate limiting
        if response and response.status_code == 403:
            print("GitHub API rate limit likely exceeded. Check headers:", response.headers)
    except json.JSONDecodeError:
        if response:
            print(f"Error decoding GitHub API response for '{query}'. Response: {response.text[:200]}...") # Log snippet
    except Exception as e:
        print(f"An unexpected error occurred during GitHub search for '{query}': {e}")

    return urls

async def check_domain_async(domain, filename, session):
    """
    Asynchronously checks if a domain has llms.txt/llms-full.txt at its root.
    Returns the URL if found, None otherwise.
    """
    url_to_check = f"https://{domain}/{filename}"
    headers = {'User-Agent': USER_AGENT}
    
    try:
        async with session.head(
            url_to_check, 
            headers=headers, 
            timeout=REQUEST_TIMEOUT / 2, 
            allow_redirects=True
        ) as response:
            if response.status == 200:
                content_type = response.headers.get('content-type', '').lower()
                if 'text' in content_type or 'plain' in content_type:
                    print(f"  Found: {url_to_check}")
                    return url_to_check
    except asyncio.TimeoutError:
        # Silently ignore timeouts
        pass
    except aiohttp.ClientError:
        # Silently ignore connection errors
        pass
    except Exception as e:
        print(f"  Unexpected error checking {url_to_check}: {e}")
    
    return None

async def find_root_llmstxt_urls_async():
    """
    Asynchronously checks a list of domains read from a CSV file for llms.txt/llms-full.txt at their root.
    Uses HEAD requests for efficiency.
    Returns a set of valid URLs found.
    """
    domains_csv_file = "cloudflare-radar_top-10000-domains_20250324-20250331.csv"
    found_urls = set()
    domains_to_check = []
    
    try:
        with open(domains_csv_file, 'r', newline='') as csvfile:
            reader = csv.reader(csvfile)
            header = next(reader) # Skip header row
            if header[0].lower() != 'domain':
                print(f"Warning: Expected 'domain' header in {domains_csv_file}, found '{header[0]}'. Proceeding anyway.")
            for row in reader:
                if row: # Ensure row is not empty
                    domains_to_check.append(row[0].strip())
        print(f"Checking {len(domains_to_check)} domains from '{domains_csv_file}'...")
    except FileNotFoundError:
        print(f"Error: Domains CSV file not found: {domains_csv_file}")
        print("Skipping root domain check.")
        return found_urls # Return empty set if file not found
    except Exception as e:
        print(f"Error reading domains CSV file {domains_csv_file}: {e}")
        print("Skipping root domain check.")
        return found_urls # Return empty set on other read errors

    # Create a list of tasks for all domain/filename combinations
    async with aiohttp.ClientSession() as session:
        tasks = []
        for domain in domains_to_check:
            for filename in FILENAMES_TO_SEARCH:
                # Add a small delay to avoid overwhelming the event loop
                await asyncio.sleep(0.01)
                tasks.append(check_domain_async(domain, filename, session))
        
        # Execute all tasks concurrently and gather results
        results = await asyncio.gather(*tasks, return_exceptions=False)
        
        # Filter out None results and add valid URLs to the set
        for result in results:
            if result:
                found_urls.add(result)
    
    return found_urls

# Keep the original function for compatibility
def find_root_llmstxt_urls():
    """
    Checks a list of domains read from a CSV file for llms.txt/llms-full.txt at their root.
    Uses HEAD requests for efficiency.
    Returns a set of valid URLs found.
    """
    domains_csv_file = "cloudflare-radar_top-500-domains_20250324-20250331.csv"
    found_urls = set()
    headers = {'User-Agent': USER_AGENT}
    domains_to_check = []
    try:
        with open(domains_csv_file, 'r', newline='') as csvfile:
            reader = csv.reader(csvfile)
            header = next(reader) # Skip header row
            if header[0].lower() != 'domain':
                 print(f"Warning: Expected 'domain' header in {domains_csv_file}, found '{header[0]}'. Proceeding anyway.")
            for row in reader:
                if row: # Ensure row is not empty
                    domains_to_check.append(row[0].strip())
        print(f"Checking {len(domains_to_check)} domains from '{domains_csv_file}'...")
    except FileNotFoundError:
        print(f"Error: Domains CSV file not found: {domains_csv_file}")
        print("Skipping root domain check.")
        return found_urls # Return empty set if file not found
    except Exception as e:
        print(f"Error reading domains CSV file {domains_csv_file}: {e}")
        print("Skipping root domain check.")
        return found_urls # Return empty set on other read errors


    for domain in domains_to_check:
        for filename in FILENAMES_TO_SEARCH:
            # Construct URL (assume https, could add http fallback if needed)
            url_to_check = f"https://{domain}/{filename}"
            try:
                response = requests.head(url_to_check, headers=headers, timeout=REQUEST_TIMEOUT / 2, allow_redirects=True) # Shorter timeout for HEAD

                # Check for success and basic content type
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', '').lower()
                    if 'text' in content_type or 'plain' in content_type:
                        print(f"  Found: {url_to_check}")
                        found_urls.add(url_to_check)
                        # Optional: break inner loop if llms.txt found, to avoid checking llms-full.txt?
                        # break
                    # else:
                    #     print(f"  Skipping (Non-text): {url_to_check} ({content_type})") # Debug

                # Handle redirects if needed (allow_redirects=True handles most cases)
                # else:
                #      print(f"  Status {response.status_code}: {url_to_check}") # Debug non-200

            except requests.exceptions.Timeout:
                # print(f"  Timeout checking: {url_to_check}") # Optional: Log timeouts
                pass # Ignore timeouts silently
            except requests.exceptions.ConnectionError:
                # print(f"  Connection error checking: {url_to_check}") # Optional: Log connection errors
                pass # Ignore connection errors silently
            except requests.exceptions.RequestException as e:
                # Log other request errors less silently
                print(f"  Error checking {url_to_check}: {e}")
            except Exception as e:
                 print(f"  Unexpected error checking {url_to_check}: {e}")

            time.sleep(0.1) # Small delay between checks

    return found_urls

async def process_urls_async(urls, existing_data):
    """
    Asynchronously processes a list of URLs and returns metadata for each.
    Checks against existing data to prevent duplicates and update changed content.
    """
    # Create a dictionary of existing entries for faster lookup
    existing_entries = {entry["url"]: entry for entry in existing_data}
    updated_entries = existing_data.copy()  # Start with a copy of existing data
    
    # Track which URLs we've processed in this run
    processed_urls = set()
    new_entries_count = 0
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for url in urls:
            tasks.append(process_url_async(url, session))
        
        # Process all URLs concurrently
        results = await asyncio.gather(*tasks, return_exceptions=False)
        
        # Process results and update/add entries
        for result in results:
            if not result:
                continue
                
            url = result["url"]
            processed_urls.add(url)
            
            if url in existing_entries:
                # Entry exists, check if content has changed
                existing_entry = existing_entries[url]
                
                # Check if hash exists in the old format (sha256) or new format (content_hash)
                old_hash = existing_entry.get("content_hash", existing_entry.get("sha256"))
                new_hash = result["content_hash"]
                
                if old_hash != new_hash:
                    # Content has changed, update the entry
                    print(f"Content changed for {url}, updating entry")
                    
                    # Preserve first_added timestamp if it exists
                    if "first_added" in existing_entry:
                        result["first_added"] = existing_entry["first_added"]
                    else:
                        # Add first_added timestamp using the existing last_checked_utc or other timestamp
                        result["first_added"] = existing_entry.get("last_checked_utc", result["last_checked_utc"])
                    
                    # Set last_updated to current time
                    result["last_updated"] = result["last_checked_utc"]
                    
                    # Update the entry in our working copy
                    for i, entry in enumerate(updated_entries):
                        if entry["url"] == url:
                            updated_entries[i] = result
                            break
                else:
                    # Content hasn't changed, keep the existing entry but update last_checked_utc
                    print(f"No content change for {url}, keeping existing entry")
                    
                    # Optionally update last_checked_utc timestamp
                    for i, entry in enumerate(updated_entries):
                        if entry["url"] == url:
                            entry["last_checked_utc"] = result["last_checked_utc"]
                            break
            else:
                # New entry, add it
                print(f"New entry for {url}, adding to dataset")
                
                # Add timestamps for new entries
                result["first_added"] = result["last_checked_utc"]
                result["last_updated"] = result["last_checked_utc"]
                
                updated_entries.append(result)
                new_entries_count += 1
    
    print(f"Added {new_entries_count} new entries")
    return updated_entries

# --- Main Execution ---
async def main_async():
    """
    Asynchronous main function to coordinate the data acquisition process.
    """
    # Load environment variables from .env file
    load_dotenv()
    print("Starting data acquisition...")

    # 0. Load existing data from llms_metadata.json
    existing_data = load_existing_data()

    # 1. Get API Keys (Now loaded from .env or environment)
    brave_key, github_token = get_api_keys()

    all_urls = set() # Use a set for automatic de-duplication

    # --- Discovery Methods ---

    # 2a. Search APIs for each filename
    print("\n--- Searching APIs ---")
    for filename in FILENAMES_TO_SEARCH:
        print(f"\n--- Searching for {filename} ---")

        # Brave Search (query for the filename, Brave might find pages mentioning it)
        brave_query = filename # Simple query, adjust if Brave supports specific operators
        brave_urls = search_brave(brave_query, brave_key)
        all_urls.update(brave_urls)

        # GitHub Search (query for filenames)
        # Note: GitHub search might find files in forks/copies.
        github_query = f"filename:{filename}"
        github_urls = search_github(github_query, github_token)
        all_urls.update(github_urls)

        # Add a small delay between API calls if needed to respect rate limits
        await asyncio.sleep(1)

    # 2b. Check predefined root domains asynchronously
    print("\n--- Checking Root Domains (Async) ---")
    root_urls = await find_root_llmstxt_urls_async()
    initial_api_count = len(all_urls) # Count before adding root URLs
    all_urls.update(root_urls)
    print(f"Found {len(root_urls)} URLs by checking root domains.")
    print(f"Total unique potential URLs after all checks: {len(all_urls)}")

    # 3. Process URLs and check against existing data
    print("\n--- Processing URLs and Handling Duplicates (Async) ---")
    updated_data = await process_urls_async(all_urls, existing_data)
    
    # Print total entries count
    print(f"Total entries in updated dataset: {len(updated_data)}")

    # 4. Remove content field from each entry before saving
    for entry in updated_data:
        if "content" in entry:
            # Remove content field while preserving content_hash
            entry.pop("content")
    
    print("Removed content field from all entries while preserving content_hash")

    # 5. Save updated metadata to JSON file
    output_filename = "llms_metadata.json"
    try:
        with open(output_filename, 'w') as f:
            json.dump(updated_data, f, indent=4)
        print(f"\nSuccessfully saved updated metadata to '{output_filename}'.")
        
        # Call the domain enrichment function to enrich the data in-place
        print("\n--- Starting Domain Enrichment Process ---")
        enrich_domains()
        print("--- Domain Enrichment Process Completed ---")
    except IOError as e:
        print(f"Error writing metadata to {output_filename}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred saving metadata: {e}")

    print(f"\nFinished data acquisition.")
    print("Remember to set BRAVE_API_KEY and GITHUB_TOKEN environment variables before running.")

# --- Main Execution ---
if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main_async())