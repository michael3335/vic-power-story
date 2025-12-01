## Victoria Power Story

An interactive long-form article that explains how Victorian wholesale electricity prices shifted from being dominated by gas shocks (2015–19) to being shaped by renewables, weather and interconnection (2023 onwards). The site pairs narrative copy with two interactive visuals:

- a rolling beta chart that tracks the pass-through from gas to electricity prices over time, and
- a FEVD (forecast error variance decomposition) chart/table that highlights the contribution of gas, renewables, imports, demand and own-price dynamics in the latest data.

All copy and data live inside the repository, making it straightforward to refresh the story, swap in new datasets, or publish a new state-specific insight piece.

---

## Table of Contents

1. [Project Highlights](#project-highlights)
2. [Stack](#stack)
3. [Project Layout](#project-layout)
4. [Getting Started](#getting-started)
5. [Available Scripts](#available-scripts)
6. [Data Files](#data-files)
7. [Customising the Story](#customising-the-story)
8. [Deployment](#deployment)
9. [Troubleshooting & Notes](#troubleshooting--notes)

---

## Project Highlights

- **Scroll narrative:** `app/page.tsx` is a server component that streams hero text, methodology, three-phase story, FEVD context and policy takeaways, each wrapped with a `RevealSection` for a simple “fade and rise” effect during scrolling.
- **Interactive visuals:** Client components `RollingBetaChartClient` and `FEVDNowChartTableClient` render Recharts-powered visuals fed by local JSON data.
- **Static data dependency:** The page never calls external APIs at runtime. All data resides in `public/data`, so the story is reproducible and easy to share as a static build.
- **Type-safe content:** The JSON shapes are guarded by TypeScript types in `types/results.ts`, helping catch mistakes when data files are updated.

---

## Stack

| Category     | Details                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| Framework    | Next.js 16 (App Router)                                                         |
| Language     | TypeScript                                                                      |
| UI           | React 19 with small custom components and vanilla CSS (see `app/globals.css`)   |
| Charts       | [Recharts](https://recharts.org/en-US)                                          |
| Styling      | Global CSS + inline styles; `Space Grotesk` via `next/font/google`              |

Runtime: Node.js 20.19.5 (see `.nvmrc` / `.node-version`), npm 10. Use `nvm use` in the repo root to align with the enforced engines.

---

## Project Layout

```
vic-power-story/
├── app/
│   ├── components/
│   │   ├── FEVDNowChartTableClient.tsx   # FEVD chart + table toggle (client)
│   │   ├── RevealSection.tsx             # IntersectionObserver reveal wrapper
│   │   └── RollingBetaChartClient.tsx    # Rolling beta line chart (client)
│   ├── globals.css                       # Typography + reveal animation styles
│   ├── layout.tsx                        # Root layout and metadata
│   └── page.tsx                          # Narrative + data loading
├── public/data/                          # JSON backing the visuals
├── types/results.ts                      # Data contracts for the JSON files
├── package.json / tsconfig.json / ...    # Build and tooling config
└── README.md
```

---

## Getting Started

```bash
# 1. Install Node 20 (respects .nvmrc / .node-version)
nvm use

# 2. Install dependencies
npm install

# 3. Launch the dev server
npm run dev
# Visit http://localhost:3000
```

The dev server hot-reloads when files in `app/`, `public/` or `types/` change. If you edit data files while the dev server is running, refresh the page to see the updated charts.

---

## Available Scripts

| Command        | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `npm run dev`  | Starts the Next.js development server on `http://localhost:3000`.           |
| `npm run build`| Creates a production build (runs type-checking and compiles server/client). |
| `npm start`    | Serves the production build (run `npm run build` first).                    |
| `npm run lint` | Executes ESLint using the Next.js config.                                   |

---

## Data Files

All datasets live in `public/data/` so that the site can be statically hosted. `app/page.tsx` reads the files on the server before rendering.

| File                                   | Purpose                                                                           | Shape reference                     |
| -------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| `rolling_beta.json`                    | Rolling estimates of gas → electricity price pass-through over time.             | `RollingBetaPoint` in `types/results.ts` |
| `fevd_full_demand_first.json`          | FEVD shares when demand is ordered first in the VAR.                             | `FEVDFullRow`                       |
| `fevd_full_ren_first.json`             | FEVD shares when renewables are ordered first (used as fallback or comparison).  | `FEVDFullRow`                       |

### Updating the files

1. Export the new results from your modelling pipeline in JSON format that matches the types described above.
2. Replace the existing files under `public/data/`. The filenames are hardcoded in `app/page.tsx`.
3. Restart `npm run dev` (or refresh after saving) to load the new data.

If a file fails to parse, the corresponding chart shows a friendly “No data found” message and the page still renders.

---

## Customising the Story

- **Narrative copy:** Edit `app/page.tsx`. Each major section is plain JSX wrapped in `RevealSection`.
- **Hero CTA:** Update the `href` inside the “Download full working paper” link in `app/page.tsx`.
- **Chart annotations:** Tweak the labels or explanatory text in `RollingBetaChartClient.tsx` and the FEVD components to match new narratives.
- **Styling:** Modify `app/globals.css` for typography, spacing, and the reveal animation. Inline styles are used for some headings to keep the file self-contained.
- **Data schema:** If you introduce new drivers or metrics, update `types/results.ts`, the JSON source files, and the Recharts components accordingly.

---

## Deployment

This is a standard Next.js App Router project. Any platform that supports Node can host it (Vercel, Netlify, Render, self-managed VM, etc.).

```bash
npm run build
npm start   # serves .next/ output on port 3000 by default
```

For static hosting, you can enable Next.js’ [Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports) once all data is preloaded, though the current setup already avoids runtime fetches.

---

## Troubleshooting & Notes

- **Node version errors:** Engines are pinned to Node 20.19.5 / npm 10. Run `nvm use` (or set your PATH to `/opt/homebrew/opt/node@20/bin`) before installing or running scripts.
- **Missing data warnings:** Empty or malformed JSON files will lead to blank charts; check the console output from `safeRead` in `app/page.tsx`.
- **Linting:** Run `npm run lint` to catch unused imports or type issues before committing.
- **Assets:** All public images or favicons go in `public/`. Currently, only `favicon.ico` is present.

Feel free to open issues or PRs with improvements to the narrative, data sourcing, or visual presentation.
