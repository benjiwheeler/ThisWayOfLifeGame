# This Way of Life Will Last Forever

A classic Mac-style game with Victorian aesthetics, built with vanilla JavaScript and Canvas.

## Project Structure

```
firstclaude/
├── src/                  # Source files
│   ├── index.html       # HTML template
│   └── game.js          # Game logic
├── dist/                # Build output (generated)
├── webpack.config.js    # Webpack configuration
├── package.json         # Dependencies and scripts
└── .gitignore          # Git ignore rules
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```
   This will open the game in your browser at http://localhost:8080

## Building

To create a production build:
```bash
npm run build
```

The bundled files will be in the `dist/` directory.

## Deployment to GitHub Pages

1. Make sure you have a git repository initialized and connected to GitHub:
   ```bash
   git init
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

This will:
- Build the project (`npm run build`)
- Deploy the `dist/` folder to the `gh-pages` branch
- Your game will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## Game Controls

- **← →** - Move left and right
- **↑** - Open umbrella to deflect falling objects
- Survive by deflecting objects or learning from them!

## How to Play

Navigate through falling obstacles using your ornate Victorian parasol. Make choices that affect your gameplay:
- **Fight**: Gain a larger umbrella and more power
- **Learn**: Touch obstacles to gain knowledge and see mysterious messages
- Additional choices unlock as you progress

Objects pile up on the ground and slow your movement. Push them away with your umbrella when it's open!
