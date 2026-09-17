# Components, Styling & Conventions

## Stylesheet structure

`src/main.js` imports a single entry point, `src/assets/main.css`, which pulls in:

| File                     | Contents                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| `assets/tokens.css`      | `:root` design tokens (colours, radii, transitions). **Add colours here.** |
| `assets/base.css`        | Minimal reset and base typography.                                        |
| `assets/components.css`  | Shared primitives: buttons, containers, list rows, tables, modals, forms, scroll areas, states, utilities. |
| `assets/main.css`        | Animations, typography overrides, responsive tweaks.                      |

Rules of thumb:

- Never hard-code a hex value in a component. Use a token (`var(--amber)`, `var(--text-soft)`, …).
- Reusable styling goes in `components.css`; layout that only makes sense for one
  component stays in that component's `<style scoped>` block.
- The search list and the favorites list share the `.monster-table--monsters` /
  `.monster-table--favorites` variants, which define the column template via the
  `--table-columns` custom property so the header and rows always line up.

## Button variants

All buttons render through the base components and pick a **semantic** variant, so
intent is visible at a glance instead of every button looking the same:

| Variant     | Colour      | Use for                                                  |
| ----------- | ----------- | -------------------------------------------------------- |
| `primary`   | amber       | The single main action of a view (Search, Save, Add).    |
| `secondary` | grey        | Utilities, cancel, filters, import/export.               |
| `danger`    | crimson/red | Destructive actions (Reset combat, Remove).              |
| `ghost`     | outline     | View toggles; `active` adds `.is-active` (amber) when on. |
| `icon`      | transparent | Icon-only actions (see `BaseIconButton`).                |

`BaseButton` also supports `size="sm"`, `toggle` (adds `aria-pressed`) and `class`
fallthrough, so a scoped class can still tweak a single instance.

## Smart vs. presentational components

- **Presentational (dumb)** live in `src/components/base/` and must not import
  composables. They receive props and emit events:
  - `BaseButton`, `BaseIconButton`, `BaseModal`
  - `MonsterListHeader` (sortable columns), `MonsterRow` (table row + `actions` slot)
- **Smart containers** keep the stateful `The*` naming in `src/components/` and
  only wire composables (`useMonsterSearch`, `useFavorites`, `useCombat`, …) into
  the dumb components.
- Cross-cutting state lives in `src/composables/`. Visual feedback uses reactive
  state (`useRowFeedback`) instead of mutating inline styles or DOM classes.

## Shared UI state

`useUiState` is a module-level singleton (like `store.js`) so any component can
read or change the app layout without prop drilling or events:

| Member | Notes |
| ------ | ----- |
| `uiState` | Reactive panel flags (`showMonsterList`, `showFavoriteList`, `showCombatEncounter`) and `hasSeenIntro`. Persisted under the `uiState` localStorage key. |
| `showAbout` | Transient ref for the single `AboutModal` instance, rendered by `App.vue`. Never persisted. |
| `toggle*` / `open*` | Panel visibility, plus `openMonsterList()` which the empty states use as a call to action. |
| `visibleCount`, `hasVisiblePanel`, `mainClass` | Derived layout: `mainClass` drives the 1/2/3-column `main` grid. |

`uiState` is a **local layout preference** and is deliberately excluded from the
exported save file, so the save format version does not change when panels are
added or renamed.

## Interaction rules

- **Clicking a search row adds the monster to the combat list only.** Bookmarking
  is always explicit, so no row click has a hidden side effect.
- **The ☆ button toggles the bookmark** and always reflects the real state
  (`★` = favorited) via `useFavorites().isInFavorites`.
- Adding the same monster to combat twice is intentional (three goblins are three
  entries); only favorites are de-duplicated.
- First-time visitors get the dismissible `IntroBanner` once (`hasSeenIntro`);
  the About dialog is always manual, never auto-opened.


## Adding a new list screen

1. Wrap content in `.container` plus a `.monster-table--*` variant.
2. Render `<MonsterListHeader :columns="…" />` and `<MonsterRow v-for … />`.
3. Pass cell data as `[{ key, value, className }]` and keep the grid template in
   the table variant in `components.css`.
