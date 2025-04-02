# Grid Layout Implementation Plan

## Current Issue

The card view on the main page is not displaying in a 3-column grid layout on desktop/larger screens as expected, despite having the appropriate CSS classes.

## Requirements

- 3 columns on desktop/larger screens
- Responsive layout (fewer columns on smaller screens)
- Maintain existing functionality

## Current Implementation

The card view div in `index.astro` currently has these classes:

```astro
<div id="card-view" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

This should provide:

- 1 column on mobile (smallest screens)
- 2 columns on medium screens (≥768px)
- 3 columns on large screens (≥1024px)
- 4 columns on extra large screens (≥1280px)

## Solution Plan

### 1. Modify the Grid Classes in index.astro

Update the card view div to use a maximum of 3 columns on larger screens:

```diff
- <div id="card-view" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
+ <div id="card-view" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

This ensures:

- 1 column on mobile (smallest screens)
- 2 columns on medium screens (≥768px)
- 3 columns on large screens (≥1024px) and above

### 2. Add CSS Fixes to Enhanced Theme

Add specific styles to `enhanced-theme.css` to reinforce the grid layout:

```css
/* Ensure grid layout is applied correctly */
#card-view {
  display: grid !important;
  width: 100%;
}

/* Ensure cards take up the correct width */
#card-view > div {
  width: 100%;
}

/* Adjust card spacing */
@media (min-width: 768px) {
  #card-view {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 1024px) {
  #card-view {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}
```

### 3. Ensure Toggle Functionality Works Correctly

Verify the JavaScript toggle between table and card view isn't causing issues:

```javascript
// Toggle view function
toggleViewBtn.addEventListener("click", () => {
  if (tableView.classList.contains("hidden")) {
    tableView.classList.remove("hidden");
    cardView.classList.add("hidden");
    toggleViewBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>Switch to Card View';
  } else {
    tableView.classList.add("hidden");
    cardView.classList.remove("hidden");
    toggleViewBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>Switch to Table View';
  }
});
```

### 4. Browser Compatibility Fixes

Add prefixed CSS properties to ensure compatibility across different browsers:

```css
#card-view {
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: 1fr;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  #card-view {
    -ms-grid-columns: 1fr 1fr;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  #card-view {
    -ms-grid-columns: 1fr 1fr 1fr;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

## Implementation Steps

1. Update the card view div classes in `src/pages/index.astro`
2. Add the CSS fixes to `src/styles/enhanced-theme.css`
3. Rebuild the site with `npm run build`
4. Restart the development server with `npm run dev`
5. Clear browser cache and test the layout on different screen sizes

## Expected Outcome

The card view should display in a 3-column grid layout on desktop/larger screens, while maintaining responsiveness on smaller screens.
