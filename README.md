# Jessie Lu — Personal Website

Website: https://david555787.github.io/jessielu.github.io/

## File organization

- `index.html`: homepage entry
- `style.css`: published stylesheet (unchanged styles)
- `script.js`: published JavaScript (same behavior, updated image path)
- `favicon.ico`: ICO version of the existing favicon
- `.nojekyll`: GitHub Pages configuration
- `assets/images/`: website portrait
- `assets/favicon.svg`: original vector favicon used by the pages
- `assets/source/`: editable React/Vite source and original component licenses
- `assets/docs/`: prompt log, previous guide, and preserved original README
- `about/`, `experience/`, `projects/`, `contact/`: existing page entrypoints; retained so URLs keep working

This change reorganizes files only. Page text, layout, colors, animations, and interactions are preserved. GitHub Pages continues publishing from the main branch, root directory.

The previous README, including the local edits that existed before this reorganization, is preserved in `assets/docs/README-before-organization.md`.

## Editing

Editable files are under `assets/source/`. Published output is at the repository root. If rebuilding, preserve the published names `style.css` and `script.js` and update the page asset references accordingly. The older guide in `assets/docs/` records the previous folder layout.
