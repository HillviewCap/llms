## How to Use Firecrawl to Create an `llms.txt` for Your Website

Firecrawl offers several convenient methods to generate an `llms.txt` file-a standardized, LLM-friendly summary of your website’s key content. This file helps AI models efficiently understand and interact with your site. Below are the main approaches:

---

**1. Using the Firecrawl Web Generator**

- **Visit the Generator:** Go to [http://llmstxt.firecrawl.dev](http://llmstxt.firecrawl.dev).
- **Enter Your Website URL:** Input the URL of your website.
- **Generate the File:** Click the generate button and wait a few minutes as Firecrawl processes your site.
- **Download Your Files:** Once ready, download the generated `llms.txt` (summary) and `llms-full.txt` (detailed) files.

*No API key is required for basic use, but using a free Firecrawl API key removes usage limits and unlocks full features.*[1]

---

**2. Using the Firecrawl API**

You can automate the process or integrate it into your workflow:

- **Basic GET Request:**
  ```
  http://llmstxt.firecrawl.dev/{YOUR_URL}
  ```
  For the full version:
  ```
  http://llmstxt.firecrawl.dev/{YOUR_URL}/full
  ```
- **With API Key:**
  ```
  http://llmstxt.firecrawl.dev/{YOUR_URL}?FIRECRAWL_API_KEY=YOUR_API_KEY
  ```
  Replace `{YOUR_URL}` with your website’s URL and `YOUR_API_KEY` with your Firecrawl API key.[1][3]

---

**3. Using the Firecrawl Python SDK**

- **Install the SDK:**
  ```python
  pip install firecrawl
  ```
- **Example Usage:**
  ```python
  from firecrawl import FirecrawlApp

  firecrawl = FirecrawlApp(api_key="your_api_key")
  results = firecrawl.generate_llms_text(
      url="https://your-website.com",
      max_urls=10,            # Number of pages to crawl
      show_full_text=True     # Also get llms-full.txt
  )

  if results.success:
      print(results.data['llmstxt'])       # The summary file
      print(results.data['llmsfulltxt'])   # The full content file
  else:
      print(f"Error: {results.error}")
  ```
  *You can also use asynchronous methods for larger sites and monitor job status.*[2][3]

---

**4. Using the NPX CLI Tool**

- **Run via NPX (no install required):**
  ```
  npx generate-llmstxt -k your_api_key -u https://your-website.com -m 20
  ```
  - `-k` or `--api-key`: Your Firecrawl API key (optional if set in `.env`)
  - `-u` or `--url`: Website URL
  - `-m` or `--max-urls`: Number of pages to crawl
  - `-o` or `--output-dir`: Output directory (optional)

  *This will create `llms.txt` and `llms-full.txt` in your specified directory (default: `public`).*[4]

---

**5. Using Firecrawl MCP with Cline (for VS Code users)**

- **Interact with Cline in VS Code:** Ask it to generate an `llms.txt` for your URL.
  ```
  >> generate an llms.txt from your-website.com --short version
  ```
- **Monitor and retrieve the files:** Cline will provide the generated files when complete.[5]

---

## What is `llms.txt`?

The `llms.txt` standard is a markdown file placed at your website’s root, summarizing key content and providing links for LLMs to easily access and process. It typically starts with a title, an optional description, and organized lists of links to deeper content, following a structure that maximizes LLM compatibility.[2]

---

## Summary Table: Firecrawl Methods

| Method                | Ease of Use | Automation | Requires API Key | Output Files         |
|-----------------------|-------------|------------|------------------|----------------------|
| Web Generator         | Easiest     | No         | No (recommended) | llms.txt, llms-full.txt |
| API (GET Request)     | Easy        | Yes        | Optional         | llms.txt, llms-full.txt |
| Python SDK            | Moderate    | Yes        | Yes              | llms.txt, llms-full.txt |
| NPX CLI Tool          | Easy        | Yes        | Optional         | llms.txt, llms-full.txt |
| Firecrawl MCP + Cline | Advanced    | Yes        | Yes              | llms.txt, llms-full.txt |

---

**Choose the method that best fits your workflow. For most users, the web generator or NPX tool offers the fastest path to a ready-to-use `llms.txt`.**

Citations:
[1] https://www.firecrawl.dev/blog/How-to-Create-an-llms-txt-File-for-Any-Website
[2] https://www.firecrawl.dev/blog/website-to-agent-with-firecrawl-openai
[3] https://docs.firecrawl.dev/features/alpha/llmstxt
[4] https://docs.firecrawl.dev/features/alpha/llmstxt-npx
[5] https://apidog.com/blog/firecrawl-mcp-llms-txt
[6] https://www.firecrawl.dev/blog/launch-week-iii-day-4-announcing-llmstxt-new
[7] https://docs.firecrawl.dev/introduction
[8] https://github.com/mendableai/firecrawl
[9] https://apidog.com/blog/firecrawl-mcp-llms-txt/
[10] https://www.blott.studio/blog/post/how-to-build-llm-ready-datasets-with-firecrawl-a-developers-guide
[11] https://x.com/firecrawl_dev/status/1897330789303586839
[12] https://www.firecrawl.dev
[13] https://llmstxt.firecrawl.dev
[14] https://www.reddit.com/r/LLMDevs/comments/1gufa05/llmstxt_directory_a_growing_list_of_sites/
[15] https://www.youtube.com/watch?v=_hboVbUqsjY

---
Answer from Perplexity: pplx.ai/share