# Jessie Lu portfolio — GitHub Pages edition

This portable React website includes every portfolio page, the supplied photo, React Bits animations, dark mode by default, and the repaired native page links. It needs no paid hosting, server, database, or secrets.

## Replace an existing GitHub Pages site
1. Back up the old repository or keep its Git history.
2. Put the CONTENTS of this folder in the repository root, including the hidden `.github` directory. Replace the old site files; retain an existing CNAME file if using a custom domain.
3. In repository Settings → Pages, select GitHub Actions as the source.
4. Commit to main or master. The included workflow builds and publishes the website.

The workflow supports both username.github.io sites and project sites under /repository-name/. Do not upload the original Sites source ZIP as your GitHub Pages website: use this edition.

## Local preview
Use Node.js 22 or newer, then `npm install` and `npm run dev`.
Run `npm run build` to create `dist/`. For a manual project-site build, set BASE_PATH=/repository-name/.

## Editing
Page content is in app/, shared interactions are in components/, and colors/layout are in app/globals.css. Your image and favicon are in public/. React Bits licensing is retained in components/reactbits/LICENSE.md.
