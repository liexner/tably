# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build (outputs to build/)
npm run preview      # Preview production build
npm run check        # TypeScript + Svelte type checking
npm run lint         # Prettier + ESLint checks
npm run format       # Auto-format with Prettier
```

No test suite exists in this project.

## Architecture

Tably is a SvelteKit 5 app that fetches time entries from the Toggl Track API and renders them as a weekly timetable.

**Single route, form-action pattern**: The only route (`src/routes/+page.svelte` + `+page.server.ts`) uses a SvelteKit form action to accept a Toggl API token. The server fetches data from Toggl and returns it as `form.timetable`. The client also caches the last fetch in `localStorage` (versioned with `CACHE_VERSION`) so the table persists across page loads.

**Data flow**:
1. User submits token via form → `+page.server.ts` action
2. Action calls `fetchProjects` + `fetchTimeEntries` in parallel (`src/lib/server/toggl.ts`)
3. `buildDateRange` + `buildTimeTable` in `src/lib/server/mapper.ts` transform raw Toggl data into `TimeTable`
4. `TimeTable` is returned to the page and rendered as an HTML table

**Key types** (`src/lib/types/`):
- `TogglProject` / `TogglTimeEntry` — shapes from Toggl API v9
- `TimeTable` — `{ dates: string[], rows: ProjectRow[], dailyTotals: number[] }`
- `ProjectRow` — `{ id, name, color, hours: number[] }` where `hours[i]` is hours for `dates[i]`

**Client-side display logic** (all in `+page.svelte`):
- `roundToHalf` — rounds hours to nearest 0.5
- `lunchDeduct` — subtracts 0.5h from the highest-hours project for each day that has any hours

## Key conventions

- **Svelte 5 runes mode is enforced globally** via `svelte.config.js` (`runes: true` for all non-`node_modules` files). Use `$state`, `$derived`, `$props`, etc.
- **Use `Temporal` instead of `Date`** for all date arithmetic. The project uses `Temporal.Now.plainDateISO()`, `Temporal.PlainDate.from()`, etc. — not `new Date()`.
- Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`).
- Deployed via Docker using `adapter-node`; production build runs with `node build` on port 3000.
