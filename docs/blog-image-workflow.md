# Workflow: Adding Images to Blog Cards

This document outlines the standard procedure for adding featured images to blog post cards in the project.

## 1. Current Structure Overview

- **Blog Content:** Markdown files located in [`src/content/blog/`](src/content/blog/).
- **Blog Cards:** Rendered by the [`src/components/blog/BlogCard.astro`](src/components/blog/BlogCard.astro) component.
- **Image Frontmatter:** Blog posts utilize an `image` field in their frontmatter to specify the card image (e.g., `image: "/assets/blog/my-post-image.jpg"`).
- **Image Storage:** Images are served from the `public` directory.

## 2. Recommended Image Specifications

### a. Standard Image Size & Aspect Ratio

- **Aspect Ratio:** **16:9** is recommended for a consistent and modern look across blog cards.
- **Minimum Resolution:** **1200px width (1200x675px)**. This ensures good quality on various screen sizes, including retina displays, and allows for graceful scaling.
- **Optimization:** Images should be optimized for the web (compressed) to ensure fast loading times. Tools like TinyPNG or Squoosh can be used.
- **Format:** Use common web formats like JPG (for photographs) or PNG (for graphics with transparency or sharp lines). WebP is also a good option for better compression and quality but ensure browser compatibility if used.

### b. Image Directory

- All blog post card images should be stored in the following publicly accessible directory:
  - **`public/assets/blog/`**
- Creating this dedicated subdirectory helps keep blog-specific assets organized.

## 3. Referencing Images in Blog Posts

- Images are referenced in the frontmatter of each blog post's markdown file (e.g., [`src/content/blog/your-post-slug.md`](src/content/blog/your-post-slug.md)).
- The `image` property in the frontmatter should contain the **absolute path from the `public` directory**.

  **Example Frontmatter:**

  ```yaml
  ---
  title: "My Awesome Blog Post"
  description: "A description of my awesome blog post."
  pubDate: 2025-05-17
  tags: ["example", "blogging"]
  image: "/assets/blog/my-awesome-blog-post-card.jpg" # Correct path
  ---
  ```

## 4. Workflow for Adding a New Blog Post with an Image

### a. Image Naming Convention

- To maintain consistency and clarity, image files should be named using the blog post's slug.
- **Convention:** `[slug]-card.[ext]`
  - `[slug]`: The slug of the blog post (e.g., `a-new-web-standard`).
  - `[ext]`: The image file extension (e.g., `jpg`, `png`, `webp`).
- **Example:** For a blog post with the slug `my-cool-feature`, the image should be named `my-cool-feature-card.jpg`.

### b. Step-by-Step Process

1.  **Prepare Your Image:**

    - Choose or create an image relevant to your blog post.
    - Resize the image to the recommended dimensions (1200x675px or a larger 16:9 equivalent).
    - Optimize the image for web delivery (compress its file size).

2.  **Save the Image:**

    - Place the prepared image into the [`public/assets/blog/`](public/assets/blog/) directory.
    - Ensure the image is named according to the convention (e.g., `public/assets/blog/my-cool-feature-card.jpg`).

3.  **Reference the Image in Markdown:**

    - Open the corresponding blog post markdown file (e.g., [`src/content/blog/my-cool-feature.md`](src/content/blog/my-cool-feature.md)).
    - Add or update the `image` property in the frontmatter with the correct path to your new image.

    ```yaml
    ---
    title: "My Cool Feature"
    # ... other frontmatter ...
    image: "/assets/blog/my-cool-feature-card.jpg"
    ---
    # My Cool Feature

    Content of the blog post...
    ```

### c. Fallback Behavior

- The [`src/components/blog/BlogCard.astro`](src/components/blog/BlogCard.astro) component is designed to handle cases where an image is not provided or the path is incorrect.
- If the `image` frontmatter property is missing, empty, or the specified image cannot be found, the component will currently display a fallback image:
  - **Current Fallback:** [`/assets/favicon-32x32.png`](public/assets/favicon-32x32.png)
- While this ensures something is displayed, consider creating a generic blog placeholder image in the future for a more polished look if specific post images are frequently omitted.

## 5. Visual Workflow Diagram

```mermaid
graph TD
    subgraph "Blog Post Creation"
        direction LR
        A[1. Prepare Image (1200x675px, 16:9)] --> B(2. Save Image to<br>`public/assets/blog/slug-card.ext`);
        B --> C(3. Update Markdown Frontmatter<br>`src/content/blog/slug.md`<br>`image: /assets/blog/slug-card.ext`);
    end

    subgraph "Blog Card Rendering (`BlogCard.astro`)"
        direction LR
        C -- reads --> F{`post.data.image` specified?};
        F -- Yes --> G[Display: `public/assets/blog/slug-card.ext`];
        F -- No/Invalid --> H[Display Fallback:<br>`public/assets/favicon-32x32.png`];
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#f9f,stroke:#333,stroke-width:2px
```

This concludes the documentation for the blog card image workflow.
