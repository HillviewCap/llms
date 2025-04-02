import os
import html
import pathlib
import re
import json # Added json import
from urllib.parse import urlparse # Added for URL parsing

# DATA_DIR = pathlib.Path("data") # Removed DATA_DIR
METADATA_FILE = pathlib.Path("llms_metadata_enriched.json") # Use enriched data
OUTPUT_DIR = pathlib.Path("output")
# DETAILS_DIR removed - no longer generating detail pages

# sanitize_filename_from_url function removed - no longer needed

# generate_detail_page function removed - no longer needed

def generate_dynamic_index_page(metadata_list):
    """Generates a single dynamic index.html page with embedded data and JS."""
    
    # Embed the metadata directly into the JavaScript
    # Use json.dumps for proper escaping and formatting
    embedded_data = json.dumps(metadata_list, indent=2)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LLMS Metadata Explorer</title>
    <style>
        body {{ font-family: sans-serif; margin: 2em; background-color: #f9f9f9; color: #333; }}
        h1 {{ color: #0056b3; }}
        #controls {{ margin-bottom: 1em; padding: 1em; background-color: #eee; border-radius: 4px; }}
        #controls label {{ margin-right: 0.5em; font-weight: bold; }}
        #controls input[type="text"], #controls select {{ padding: 0.5em; border: 1px solid #ccc; border-radius: 3px; margin-right: 1em; }}
        #resultsTable {{ width: 100%; border-collapse: collapse; margin-top: 1em; background-color: #fff; border: 1px solid #ddd; }}
        #resultsTable th, #resultsTable td {{ border: 1px solid #ddd; padding: 0.8em; text-align: left; word-wrap: break-word; }}
        #resultsTable th {{ background-color: #e9ecef; color: #333; }}
        #resultsTable tr:nth-child(even) {{ background-color: #f9f9f9; }}
        #resultsTable a {{ color: #0056b3; text-decoration: none; }}
        #resultsTable a:hover {{ text-decoration: underline; }}
        .metadata-details {{ font-size: 0.9em; color: #555; }}
        .metadata-key {{ font-weight: bold; }}
        #status {{ margin-top: 1em; font-style: italic; color: #666; }}
    </style>
</head>
<body>
    <h1>LLMS Metadata Explorer</h1>
    <p>Data loaded from: {html.escape(str(METADATA_FILE))}</p>

    <div id="controls">
        <label for="searchInput">Search URL:</label>
        <input type="text" id="searchInput" placeholder="Enter URL fragment...">
        
        <label for="categoryFilter">Filter by Category:</label>
        <select id="categoryFilter">
            <option value="">All Categories</option>
            {{/* Options will be populated by JavaScript */}}
        </select>
    </div>

    <div id="status">Loading data...</div>

    <table id="resultsTable">
        <thead>
            <tr>
                <th>URL</th>
                <th>SHA256</th>
                <th>Metadata</th>
            </tr>
        </thead>
        <tbody id="resultsBody">
            {{/* Results will be populated by JavaScript */}}
        </tbody>
    </table>

    <script>
        // Embed the data directly
        const llmsData = {embedded_data};
        
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const resultsBody = document.getElementById('resultsBody');
        const statusDiv = document.getElementById('status');

        function populateCategoryFilter(data) {{
            const categories = new Set();
            data.forEach(item => {{
                if (item.metadata && item.metadata.category) {{
                    categories.add(item.metadata.category);
                }}
            }});
            
            const sortedCategories = Array.from(categories).sort();
            sortedCategories.forEach(category => {{
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            }});
        }}

        function renderTable(data) {{
            resultsBody.innerHTML = ''; // Clear previous results
            
            if (!data || data.length === 0) {{
                statusDiv.textContent = 'No matching entries found.';
                return;
            }}

            statusDiv.textContent = `Displaying ${data.length} entries.`;

            data.forEach(item => {{
                const row = resultsBody.insertRow();
                
                const urlCell = row.insertCell();
                const urlLink = document.createElement('a');
                urlLink.href = item.url;
                urlLink.textContent = item.url;
                urlLink.target = '_blank'; // Open in new tab
                urlCell.appendChild(urlLink);

                const shaCell = row.insertCell();
                shaCell.textContent = item.sha256 || 'N/A';

                const metaCell = row.insertCell();
                if (item.metadata && typeof item.metadata === 'object') {{
                    const metaList = document.createElement('ul');
                    metaList.style.listStyleType = 'none';
                    metaList.style.paddingLeft = '0';
                    metaList.style.margin = '0';
                    
                    for (const [key, value] of Object.entries(item.metadata)) {{
                        const listItem = document.createElement('li');
                        listItem.classList.add('metadata-details');
                        listItem.innerHTML = `<span class="metadata-key">${escapeHtml(key)}:</span> ${escapeHtml(value)}`;
                        metaList.appendChild(listItem);
                    }}
                    metaCell.appendChild(metaList);
                }} else {{
                    metaCell.textContent = 'N/A';
                }}
            }});
        }}
        
        function escapeHtml(unsafe) {{
            if (typeof unsafe !== 'string') {{
                unsafe = String(unsafe);
            }}
            return unsafe
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
        }}

        function filterAndRender() {{
            const searchTerm = searchInput.value.toLowerCase();
            const selectedCategory = categoryFilter.value;

            const filteredData = llmsData.filter(item => {{
                const urlMatch = item.url.toLowerCase().includes(searchTerm);
                const categoryMatch = !selectedCategory || (item.metadata && item.metadata.category === selectedCategory);
                return urlMatch && categoryMatch;
            }});

            renderTable(filteredData);
        }}

        // Initial setup
        document.addEventListener('DOMContentLoaded', () => {{
            if (llmsData && llmsData.length > 0) {{
                populateCategoryFilter(llmsData);
                filterAndRender(); // Initial render
                statusDiv.textContent = `Loaded ${llmsData.length} entries.`;
            }} else {{
                 statusDiv.textContent = 'No data loaded or data is empty.';
                 resultsBody.innerHTML = '<tr><td colspan="3">No data available.</td></tr>';
            }}

            // Add event listeners
            searchInput.addEventListener('input', filterAndRender);
            categoryFilter.addEventListener('change', filterAndRender);
        }});

    </script>
</body>
</html>"""
    
    index_path = OUTPUT_DIR / "index.html"
    try:
        # Ensure the output directory exists before writing
        index_path.parent.mkdir(parents=True, exist_ok=True)
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"Successfully generated dynamic index page: {index_path}")
    except Exception as e:
        print(f"Error generating dynamic index page {index_path}: {e}")

def main():
    """Main function to generate the static site."""
    print("--- Dynamic Site Generator ---")
    print(f"Using enriched metadata file: {METADATA_FILE.resolve()}")
    print(f"Outputting single index file to: {OUTPUT_DIR.resolve()}")

    if not METADATA_FILE.is_file():
        print(f"\nError: Metadata file '{METADATA_FILE}' not found.")
        print("Please ensure 'llms_metadata.json' exists in the current directory.")
        print("You might need to run 'python acquire_data.py' first.")
        # Create an empty index page indicating the error
        OUTPUT_DIR.mkdir(exist_ok=True) # Ensure output dir exists
        # Generate an empty dynamic page if metadata is missing
        generate_dynamic_index_page([])
        print(f"\nGenerated an empty index page as '{METADATA_FILE}' was not found.")
        return

    # Load metadata
    try:
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            metadata_list = json.load(f)
        if not isinstance(metadata_list, list):
             print(f"\nError: Metadata file '{METADATA_FILE}' does not contain a valid JSON list.")
             generate_dynamic_index_page([])
             return
    except json.JSONDecodeError:
        print(f"\nError: Could not decode JSON from '{METADATA_FILE}'.")
        generate_dynamic_index_page([])
        return
    except Exception as e:
        print(f"\nError reading metadata file '{METADATA_FILE}': {e}")
        generate_dynamic_index_page([])
        return

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(exist_ok=True)
    print(f"Ensured output directory exists: {OUTPUT_DIR.resolve()}")

    total_entries = len(metadata_list)
    print(f"\nLoaded {total_entries} entries from {METADATA_FILE}.")

    # --- Removed detail page generation loop ---
    # No longer processing entries individually for detail pages
    # The entire list is passed to the index page generator

    if not total_entries:
        print(f"Warning: No entries found in {METADATA_FILE}. Generating an empty index page.")
    
    print("\nGenerating dynamic index page...")
    generate_dynamic_index_page(metadata_list) # Pass the full list
    
    print("\n--- Dynamic site generation complete. ---")
    print(f"Find the generated index page in: {OUTPUT_DIR.resolve()}")
    print(f"Open '{OUTPUT_DIR / 'index.html'}' in your browser to view the dynamic site.")


if __name__ == "__main__":
    main()