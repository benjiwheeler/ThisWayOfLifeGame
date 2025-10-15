# Deployment Guide for GitHub Pages

## Current Project Structure

```
firstclaude/
├── .gitignore              # Excludes node_modules/ and dist/
├── README.md               # Project documentation
├── package.json            # Dependencies and scripts
├── webpack.config.js       # Webpack bundler configuration
├── src/                    # Source files
│   ├── index.html         # HTML template
│   └── game.js            # Game logic (720 lines)
└── dist/                   # Build output (generated, not committed)
```

## Setup Steps (Do Once)

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: game ready for deployment"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., "this-way-of-life")
3. Don't initialize with README (we already have one)

### 3. Connect Local to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 4. Install Dependencies
```bash
npm install
```

This will install:
- `webpack` - Module bundler
- `webpack-cli` - Command line interface for webpack
- `webpack-dev-server` - Development server with live reload
- `html-webpack-plugin` - Generates HTML with bundled scripts
- `gh-pages` - Publishes to GitHub Pages

## Deploy to GitHub Pages

### One-Command Deployment
```bash
npm run deploy
```

This command will:
1. Run `npm run build` (via predeploy script)
   - Bundle `src/game.js` into `dist/bundle.js`
   - Copy `src/index.html` to `dist/index.html` with script tag injected
   - Clean the dist folder before building
2. Deploy the `dist/` folder to `gh-pages` branch
3. Push to GitHub

### Your Game Will Be Live At:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

## Available Scripts

### `npm run build`
Creates production build in `dist/` folder
- Minified JavaScript
- Optimized for performance

### `npm run dev`
Starts development server at http://localhost:8080
- Live reload on file changes
- Useful for testing locally

### `npm run deploy`
Builds and deploys to GitHub Pages
- Runs `npm run build` automatically
- Pushes to `gh-pages` branch

## Troubleshooting

### Issue: "gh-pages not found"
**Solution:** Run `npm install` first

### Issue: "Permission denied"
**Solution:** Make sure you're authenticated with GitHub:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Issue: 404 on GitHub Pages
**Solution:**
1. Go to your repository settings
2. Navigate to "Pages" section
3. Make sure source is set to "gh-pages" branch
4. Wait a few minutes for deployment to complete

### Issue: Changes not showing
**Solution:**
1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Clear browser cache
3. Check that `npm run deploy` completed successfully

## Making Updates

After making changes to your game:

```bash
# 1. Save your changes
git add .
git commit -m "Description of changes"

# 2. Push to main branch
git push

# 3. Deploy to GitHub Pages
npm run deploy
```

## File Explanations

### webpack.config.js
- Entry point: `src/game.js`
- Output: `dist/bundle.js`
- Uses HtmlWebpackPlugin to inject script into HTML
- Cleans dist folder before each build

### package.json
- Lists all dependencies
- Defines npm scripts for build/deploy
- Project metadata

### .gitignore
- Prevents `node_modules/` from being committed (too large)
- Prevents `dist/` from being committed (generated files)
- These are excluded because:
  - `node_modules/` can be recreated with `npm install`
  - `dist/` is built automatically during deployment

## Next Steps After Deployment

1. **Enable GitHub Pages** (if not automatic):
   - Go to repository Settings → Pages
   - Source should be "gh-pages" branch
   - Save and wait for deployment

2. **Share Your Game**:
   - Copy the URL: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
   - Share with friends!

3. **Custom Domain** (optional):
   - In Settings → Pages, you can add a custom domain
   - Follow GitHub's instructions for DNS configuration
