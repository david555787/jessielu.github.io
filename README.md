# Jessie Lu — Personal Website

Website: https://david555787.github.io/jessielu.github.io/

## File organization

- `index.html`: the only HTML file; contains the complete readable markup for all five views
- `style.css`: website styles
- `script.js`: website interactions and hash navigation
- `favicon.ico`: favicon
- `.nojekyll`: GitHub Pages configuration
- `assets/images/`: portrait
- `assets/favicon.svg`: vector favicon
- `assets/source/`: editable React/Vite source and component licenses
- `assets/docs/`: prompt log and preserved earlier documentation

## Navigation

Home: `/#/` (the plain site URL also works)
About: `/#/about`
Experience: `/#/experience`
Projects: `/#/projects`
Contact: `/#/contact`

The old `/about/`, `/experience/`, `/projects/`, and `/contact/` URLs have been removed. Use the new hash links above. Page content, styling, and animations are preserved.

## Local development workflow

Important: do not edit the built root files for day-to-day development. The live-editable source lives in `assets/source/`, while the root `index.html`, `style.css`, and `script.js` files are generated static output intended for deployment.

### Start local preview

With Node.js 22+ installed:

```bash
cd assets/source
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

This is the correct local preview for the React/Vite source. It updates automatically as you edit files in `assets/source/`.

### Why not use Live Server on the repo root?

Opening the repository root with Live Server serves the already-built static output, not the editable React source. That is why changes in `assets/source/components/` or `assets/source/app/` do not appear in the browser until the site is rebuilt and the generated files are refreshed.

### Build for deployment

When you are ready to publish:

```bash
cd assets/source
npm run build
```

This generates the static site in `assets/source/dist/`. Then copy the generated files to the repository root and commit them if you are deploying through GitHub Pages.

## Editing and rebuilding

With Node.js 22+, open `assets/source/`, run `npm install`, then `npm run build`. Copy the contents of `assets/source/dist/` to the repository root and commit those changes. The build produces `index.html`, `script.js`, and `style.css` directly.

`index.template` is the editable HTML template. The runner creates a temporary HTML entry during development/building and removes it afterward, so the repository retains only one HTML file. For a local development server, run `npm run dev` from `assets/source/`.

## Complete HTML content

The published HTML now includes every page’s text and structure in clearly indented `data-page` sections. Inactive sections are hidden. JavaScript retains navigation, animations, and theme controls. The build pre-renders the same React page components, so content is not maintained as a separate manual copy. For lasting content edits, update `assets/source/app/` or `assets/source/components/` and rebuild.
