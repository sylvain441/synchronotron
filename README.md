# Synchronotron 441

**Live demo:** https://sylvain441.github.io/synchronotron/

A Vue 3 web application for exploring synchronization patterns based on the 13-Moon/Tzolkin calendar system and the 441 synchronization matrix.

## What it does

Enter any Gregorian date to compute its position within the **Natural Time** calendar system. The app calculates:

- **Kin number** — position within the 260-day Tzolkin cycle, with glyph and tone
- **13-Moon date** — Moon, Day, and Year equivalent
- **441 grid position** — cell within the 21×21 synchronization matrix
- **Heptad & Plasma** — 7-day cycle and daily plasma type
- **TFI, BMU, and dimensional overlays** — advanced synchronization metrics

The 441-cell SVG grid highlights relevant cells and shows dimensional connections for the selected date.

## Stack

- **Vue 3** + TypeScript (strict mode)
- **Vite** for development and builds
- All calculations are client-side — no backend required

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173/synchronotron/`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type check |

## Deployment

The app is configured with base path `/synchronotron/`. Deploy the contents of `dist/` to any static host under that path, or adjust `base` in `vite.config.ts` for a different path.

## Project structure

```
src/
├── engine/          # Calculation engine (date conversion, Kin math, grid logic)
│   ├── data/        # Lookup tables (Tzolkin, glyphs, tones, 441 grid, etc.)
│   └── *.ts         # Calculators and converters
├── composables/     # Vue composables (useCalculator, useGrid)
└── components/
    ├── form/        # Date input controls
    ├── grid/        # SyncGrid SVG visualization
    └── results/     # KinCard, KinDetail, HeptadView panels
```

The engine is a TypeScript port of a legacy PHP implementation. The core data pipeline is: `DatePicker → useCalculator → kinCalculator → useGrid → SyncGrid + KinDetail`.
