# Huy's Portfolio - Source Code

A personal portfolio website built with Next.js, featuring an interactive physics-based UI.

## Live Site

**[https://vhuyngo.github.io/huy-portfolio/](https://vhuyngo.github.io/huy-portfolio/)**

## Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Source code (this branch) |
| `gh-pages` | Built & obfuscated production files (default branch) |

## Tech Stack

- **Framework:** Next.js 13
- **Physics Engine:** Matter.js
- **Styling:** CSS
- **Deployment:** GitHub Pages

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

Deployment is automated via GitHub Actions. When you push to `main`:

1. The project is built as a static export
2. JavaScript files are obfuscated
3. The obfuscated build is deployed to `gh-pages` branch
4. A timestamp is added to the gh-pages README

To manually trigger a deployment, go to **Actions** > **Build, Obfuscate & Deploy to GitHub Pages** > **Run workflow**.

## Project Structure

```
├── components/       # React components
├── pages/           # Next.js pages
├── public/          # Static assets (images)
├── styles/          # CSS stylesheets
├── .github/         # GitHub Actions workflows
└── package.json     # Dependencies
```
