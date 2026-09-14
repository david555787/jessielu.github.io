# Jessie Lu — Personal Website

Website: https://david555787.github.io/jessielu.github.io/

## File organization

- `index.html`: the only HTML file, shared by every view
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

## Editing and rebuilding

With Node.js 22+, open `assets/source/`, run `npm install`, then `npm run build`. Copy the contents of `assets/source/dist/` to the repository root and commit those changes. The build produces `index.html`, `script.js`, and `style.css` directly.

`index.template` is the editable HTML template. The runner creates a temporary HTML entry during development/building and removes it afterward, so the repository retains only one HTML file. For a local development server, run `npm run dev` from `assets/source/`.
