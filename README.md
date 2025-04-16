# LLMS.txt Explorer

A web application to discover, explore, and analyze `llms.txt` files from across the web. This project supports the [llmstxt.org](https://llmstxt.org/) initiative, which aims to standardize how websites communicate instructions and permissions to Large Language Models (LLMs).

## Project Overview

The LLMS.txt Explorer provides a comprehensive, searchable database of `llms.txt` and `llms-full.txt` files found on the internet. The `llmstxt` standard allows website owners to specify preferences for AI interactions, data usage policies, and more, complementing standards like `robots.txt`.

This explorer helps developers, researchers, and website owners understand the adoption and implementation patterns of the `llmstxt` standard.

## Data Collection and Processing

- **Crawling:** We regularly crawl the top 1 million websites to discover `llms.txt` and `llms-full.txt` files.
- **Enrichment:** The collected data (`src/data/llms_metadata.json`) is enriched with additional metadata, including website category (domain purpose/topics) and LLMS.txt-specific topics.
- **Quality Score:** Each discovered file is validated against the official `llmstxt.org` specification using the `llms_text` module. Based on this validation, a quality score (High, Medium, Low) is assigned.

*Note: The data acquisition and processing happen in a separate backend process. The updated data is periodically integrated into this repository.*

## Features

- **Comprehensive Database:** Explore `llms.txt` data from a large number of domains.
- **Search:** Find entries by title, domain, or summary content.
- **Filtering:**
    - Filter by Source Domain.
    - Filter by topics extracted from the `llms.txt` file (`LLMs.txt Topics`).
    - Filter by general topics associated with the domain (`Domain Topics`).
    - Option to include or exclude low-quality entries.
- **Detailed View:** See the `llms.txt` URL, last checked date, quality score, and extracted metadata (topics, domain purposes).
- **Regular Updates:** The database is kept current through periodic crawling and processing.
- **Responsive Design:** Accessible on various devices.
- **Built with Astro:** Modern and performant web framework.

## Project Structure

```
.
├── public/                 # Static assets (favicon, headers, etc.)
├── src/
│   ├── assets/             # Project assets (images, fonts, etc.)
│   ├── components/         # Reusable Astro components (Navigation, StructuredData, etc.)
│   ├── content/            # Content collections (e.g., blog posts)
│   ├── data/               # Data files
│   │   └── llms_metadata.json # Core LLMS.txt data
│   ├── layouts/            # Page layouts (Layout.astro, BlogPostLayout.astro)
│   ├── pages/              # Site pages (index.astro, about.astro, etc.)
│   └── styles/             # Global styles and themes
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```
*(Note: Structure simplified for brevity)*

## Technologies Used

- **[Astro](https://astro.build/)**: Web framework for building fast content sites.
- **[TailwindCSS](https://tailwindcss.com/)**: Utility-first CSS framework.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset of JavaScript adding static types.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm (or pnpm, yarn)

### Installation

1.  Clone the repository:
    ```bash
    # git clone <repository-url> # Add repository URL if known
    cd <repository-directory>
    ```

2.  Install dependencies (using your preferred package manager):
    ```bash
    npm install # or pnpm install / yarn install / uv pip install -r requirements.txt (if applicable)
    ```

3.  Start the development server:
    ```bash
    npm run dev # or pnpm dev / yarn dev
    ```

4.  Open your browser and navigate to `http://localhost:4321` (or the port specified by Astro).

## Deployment

This Astro project can be deployed to various static hosting platforms like Netlify, Vercel, Cloudflare Pages, or GitHub Pages.

1.  **Build the site:**
    ```bash
    npm run build # or pnpm build / yarn build
    ```
2.  **Deploy:** Follow the instructions for your chosen hosting provider, typically pointing it to the `dist/` directory created by the build command.

Refer to the `DEPLOYMENT.md` file for more detailed platform-specific instructions.

## Maintenance

Refer to the `MAINTENANCE.md` file for guidance on updating dependencies, modifying the site, and troubleshooting. Data updates are handled automatically by the backend process.

## Contributing

Contributions are welcome! Please follow standard Git workflow practices (fork, branch, commit, pull request).

## License

This project is licensed under the MIT License. (Assuming MIT, update if different).
