# 5e Encounter Builder – Frontend

A combat and encounter tracker for 5e.
Search a large monster library from the Open5e API, bookmark favorites (or create your own homebrew creatures), and run an initiative order for your table.

Everything is stored locally in your browser and can be moved between machines with a single JSON save file.

## Tech Stack

- Vue 3 (Composition API) · Vite
- Open5e API v2 for creature data (no API key required)
- Browser `localStorage` for persistence · JSON state export/import
- ESLint · Prettier

## Features

- **Monster search** – search by name, filter by challenge rating range, creature type and source book, and sort by name/type/CR/HP/AC
- **Favorites** – bookmark monsters from search, or create and save homebrew monsters
- **Combat tracker** – roll initiative (single or all), sort the order, track rounds and the current turn, mark monsters as done, apply damage and reset a fight
- **Export / import** – download the full app state as one JSON file and restore it with a choice of merge or replace modes

## Getting Started

The app talks directly to the public [Open5e API](https://open5e.com/), so it needs an internet connection but **no backend**.

**1. Install dependencies**

```sh
npm install
```

**2. Run the dev server**

```sh
npm run dev
```

App runs at `http://localhost:3000`

**3. Production build**

```sh
npm run build
npm run preview
```

## Scripts

| Script            | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload |
| `npm run build`   | Build the production bundle into `dist/`  |
| `npm run preview` | Preview the production build locally      |
| `npm run lint`    | Run ESLint (with `--fix`)                 |
| `npm run format`  | Format `src/` with Prettier               |
| `npm run clean`   | Remove `dist/` and the Vite cache         |

## Environment Variables

None. There is no backend URL or API key to configure — creature data comes from the public Open5e API and all state lives in `localStorage`.

## Data & Persistence

State is saved automatically in the browser, so an in-progress fight survives a page refresh:

- `favoriteMonsters` – bookmarked and homebrew monsters
- `combatMonsters` – the current combat list (initiative, HP, done flags)
- `combatSession` – round, current turn and whether combat is active

Use **Export State** to download everything as one versioned JSON save file, and **Import State** to restore it by merging favorites, merging favorites while replacing the rest, or replacing everything.

## Data Source

Creature data is provided by [Open5e](https://open5e.com/) via the [Open5e API v2](https://api.open5e.com/v2/).
