# CardVerse

Premium free-to-play South Asian card gaming platform.

## Features (Current Release)

- Polished home screen with branding
- Responsive navigation (sidebar desktop, bottom bar mobile)
- Dark / Light / System color modes
- 11 original themes (including Durbar Palace) with unlock system
- Local player profile, XP, Gold, Gems
- Fully playable **Call Break** against 3 bots
  - Bidding phase
  - Trick-taking with suit following
  - Spades as trump
  - Scoring (exact bid = points, overtrick 0.1, undertrick -1)
  - Bot AI (legal moves only)
  - Results and replay
- Persistent local storage
- Themes, Settings, Profile, and How to Play pages

## Other Games

Dhumbal, Teen Patti, In Between, Jut Patti, Kitti, Fanash, Gulaam Chor, 29, and Marriage have menu entries and rules outlines. Full engines are planned for subsequent milestones.

## Local Development

```bash
# Install dependencies
yarn install

# Development server
yarn dev

# Run tests
yarn test

# Production build
yarn build

# Preview production build
yarn preview
```

## Publish to GitHub

1. Create a new empty repository on GitHub (e.g. `your-username/cardverse`).
2. Extract this project and push:

```bash
git init
git add .
git commit -m "Initial CardVerse release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. Enable GitHub Pages:
   - Go to the repository **Settings → Pages**
   - Set **Source** to **GitHub Actions**
4. The included `.github/workflows/deploy.yml` will automatically build and deploy on every push to `main`.

### Base Path for GitHub Pages

If your repository name is not `cardverse`, update the base path in `vite.config.ts`:

```ts
base: process.env.GITHUB_PAGES ? '/YOUR_REPO_NAME/' : '/',
```

Then commit and push. The site will be available at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`.

## Virtual Economy

All currencies (Gold, Gems) are virtual and non-redeemable. No real-money gambling, deposits, or cash-outs.

## License

MIT

## Known Limitations

- Only Call Break is fully implemented and playable
- Bot AI is functional but basic
- No online multiplayer (architecture ready for future server-authoritative backend)
- Other 9 games are menu placeholders
- Audio and advanced animations pending

## Recent Improvements (v1.1)

- **Multilingual Support**: English, Nepali (नेपाली), and Hindi (हिंदी) toggle in Settings.
- **Collapsible Scoreboard**: Tap to expand/collapse bidding and tricks tracking.
- **Mobile Orientation Prompt**: Suggests landscape mode for optimal play on phones.
- **Auto-Sort Hand**: One-tap button to refresh card order.
- **Enhanced Reconnection**: Existing localStorage persistence improved with clearer resume flow.
- Cards remain CSS-rendered for fast loads (<2s target).

Game state continues to cache locally so refreshes or brief disconnects resume progress.
