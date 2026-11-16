# Theme: KAS

## About

Brand theme for KAS TI26A3, generated with the "Generate a New Theme" workflow from the Default (New York) base. Light values are imported from the app's existing palette (`app/globals.css`, `COLOR_THEME.md`, and the admin dashboard charts). The app has no dark mode yet, so dark values are derived by contrast inversion on the same slate and indigo scales. Variable names and structure match the Default (New York) theme exactly.

## shadCN CSS Variables

Standard shadCN variables that components reference. These follow the `--name` / `--name-foreground` convention and are registered as Tailwind utilities via `@theme inline`.

### Core Variables

| CSS Variable | Light (oklch) | Light (hex) | Dark (oklch) | Dark (hex) |
|-------------|---------------|-------------|--------------|------------|
| `--background` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.129 0.041 264.695)` | `#020617` |
| `--foreground` | `oklch(0.208 0.04 265.755)` | `#0f172a` | `oklch(0.984 0.003 247.858)` | `#f8fafc` |
| `--card` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.208 0.04 265.755)` | `#0f172a` |
| `--card-foreground` | `oklch(0.208 0.04 265.755)` | `#0f172a` | `oklch(0.984 0.003 247.858)` | `#f8fafc` |
| `--popover` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.279 0.037 260.031)` | `#1e293b` |
| `--popover-foreground` | `oklch(0.208 0.04 265.755)` | `#0f172a` | `oklch(0.984 0.003 247.858)` | `#f8fafc` |
| `--primary` | `oklch(0.511 0.23 276.966)` | `#4f46e5` | `oklch(0.68 0.158 276.935)` | `#818cf8` |
| `--primary-foreground` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.129 0.041 264.695)` | `#020617` |
| `--secondary` | `oklch(0.962 0.018 272.314)` | `#eef2ff` | `oklch(0.257 0.086 281.288)` | `#1e1b4b` |
| `--secondary-foreground` | `oklch(0.511 0.23 276.966)` | `#4f46e5` | `oklch(0.87 0.062 274.039)` | `#c7d2fe` |
| `--muted` | `oklch(0.984 0.003 247.858)` | `#f8fafc` | `oklch(0.279 0.037 260.031)` | `#1e293b` |
| `--muted-foreground` | `oklch(0.554 0.041 257.417)` | `#64748b` | `oklch(0.711 0.035 256.788)` | `#94a3b8` |
| `--accent` | `oklch(0.962 0.018 272.314)` | `#eef2ff` | `oklch(0.359 0.135 278.697)` | `#312e81` |
| `--accent-foreground` | `oklch(0.511 0.23 276.966)` | `#4f46e5` | `oklch(0.87 0.062 274.039)` | `#c7d2fe` |
| `--destructive` | `oklch(0.577 0.215 27.325)` | `#dc2626` | `oklch(0.711 0.166 22.216)` | `#f87171` |
| `--destructive-foreground` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.129 0.041 264.695)` | `#020617` |
| `--border` | `oklch(0.929 0.013 255.508)` | `#e2e8f0` | `oklch(1 0 0 / 10%)` | `rgba(255,255,255,0.1)` |
| `--input` | `oklch(0.929 0.013 255.508)` | `#e2e8f0` | `oklch(1 0 0 / 15%)` | `rgba(255,255,255,0.15)` |
| `--ring` | `oklch(0.585 0.204 277.117)` | `#6366f1` | `oklch(0.68 0.158 276.935)` | `#818cf8` |

| CSS Variable | Value |
|-------------|-------|
| `--radius` | `0.625rem` |

### Chart Variables

| CSS Variable | Light (oklch) | Light (hex) | Dark (oklch) | Dark (hex) |
|-------------|---------------|-------------|--------------|------------|
| `--chart-1` | `oklch(0.623 0.188 259.815)` | `#3b82f6` | `oklch(0.623 0.188 259.815)` | `#3b82f6` |
| `--chart-2` | `oklch(0.723 0.192 149.579)` | `#22c55e` | `oklch(0.723 0.192 149.579)` | `#22c55e` |
| `--chart-3` | `oklch(0.769 0.165 69.88)` | `#f59e0b` | `oklch(0.769 0.165 69.88)` | `#f59e0b` |
| `--chart-4` | `oklch(0.637 0.208 25.331)` | `#ef4444` | `oklch(0.637 0.208 25.331)` | `#ef4444` |
| `--chart-5` | `oklch(0.606 0.219 292.717)` | `#8b5cf6` | `oklch(0.606 0.219 292.717)` | `#8b5cf6` |

### Sidebar Variables

| CSS Variable | Light (oklch) | Light (hex) | Dark (oklch) | Dark (hex) |
|-------------|---------------|-------------|--------------|------------|
| `--sidebar` | `oklch(0.985 0 0)` | `#fafafa` | `oklch(0.205 0 0)` | `#171717` <!-- INCOMPLETE: using New York default --> |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | `oklch(0.985 0 0)` | `#fafafa` <!-- INCOMPLETE: using New York default --> |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.488 0.243 264.376)` | `#1447e6` <!-- INCOMPLETE: using New York default --> |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `#fafafa` | `oklch(0.985 0 0)` | `#fafafa` <!-- INCOMPLETE: using New York default --> |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` <!-- INCOMPLETE: using New York default --> |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` <!-- INCOMPLETE: using New York default --> |
| `--sidebar-border` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(1 0 0 / 10%)` | `rgba(255,255,255,0.1)` <!-- INCOMPLETE: using New York default --> |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `#a1a1a1` | `oklch(0.439 0 0)` | `#525252` <!-- INCOMPLETE: using New York default --> |

### Typography Variables

| CSS Variable | Value |
|-------------|-------|
| `--font-sans` | `ui-sans-serif, system-ui, sans-serif` |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` |

---

## Tailwind Mapping

Tailwind utilities map directly to the shadCN CSS variables above via the `@theme inline` directive in shadCN v4:

| Tailwind Utility Pattern | CSS Variable | Example |
|-------------------------|-------------|---------|
| `bg-{name}` | `--{name}` | `bg-primary` → `var(--primary)` |
| `text-{name}` | `--{name}` (foreground) | `text-primary-foreground` → `var(--primary-foreground)` |
| `border-{name}` | `--{name}` | `border-border` → `var(--border)` |
| `ring-{name}` | `--{name}` | `ring-ring` → `var(--ring)` |

## Global Styles

### Body

- Background: `var(--background)` — `oklch(1 0 0)` / `#ffffff` (light), `oklch(0.129 0.041 264.695)` / `#020617` (dark)
- Text color: `var(--foreground)` — `oklch(0.208 0.04 265.755)` / `#0f172a` (light), `oklch(0.984 0.003 247.858)` / `#f8fafc` (dark)
- Font family: `var(--font-sans)` — system UI stack (the app loads no web fonts)

### Surfaces

- Card: `oklch(1 0 0)` / `#ffffff` (light), `oklch(0.208 0.04 265.755)` / `#0f172a` (dark)
- Popover: `oklch(1 0 0)` / `#ffffff` (light), `oklch(0.279 0.037 260.031)` / `#1e293b` (dark)
- Muted surfaces: `oklch(0.984 0.003 247.858)` / `#f8fafc` (light), `oklch(0.279 0.037 260.031)` / `#1e293b` (dark)
- Sidebar: `oklch(0.985 0 0)` / `#fafafa` (light), `oklch(0.205 0 0)` / `#171717` (dark) <!-- INCOMPLETE: using New York default -->

### Typography

- Font family: system UI sans-serif stack (`ui-sans-serif, system-ui, sans-serif`)
- Font family monospace: system monospace stack (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`)
- Text sizes follow Tailwind scale (`text-xs` through `text-xl`)
- Font weights: `font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700)

## Usage Notes

Brand theme on the Default (New York) structure. It contains only standard shadCN contract variables, no custom extensions. Activate it with the `theme-kas` class on `<html>`, and add `dark` next to it for dark mode. The CSS block lives at the end of `app/globals.css` and only takes effect once shadCN's `@theme inline` mapping exists (added by `npx shadcn@latest init`).

How the app's palette maps to the contract:

- `--primary` uses `--brand-deep` (`#4f46e5`). White text on `--brand` (`#6366f1`) is 4.47:1, just under the 4.5:1 AA minimum, so `--brand` is used for `--ring` instead.
- The app's own `--accent` (pink `#ec4899`) and `--muted` (slate `#64748b`) mean different things in shadCN. shadCN `--accent` is the hover and highlight surface for menus, ghost, and outline controls, so it uses the app's light indigo hover tint (`#eef2ff`). The app's `--muted` is a text color, so it maps to `--muted-foreground`.
- `--muted` uses the app's page background (`--paper`, `#f8fafc`). Slate-100 (`#f1f5f9`) would read more clearly as a surface but drops `--muted-foreground` to 4.34:1.
- `--destructive` uses red-600 (`#dc2626`). The app's overdue red (`#ef4444`) is 3.76:1 with white text.
- `--border` and `--input` use the app's `--line` (`#e2e8f0`). `--radius` matches the app's 10px buttons, inputs, and cards.
- Chart colors are the admin dashboard's current series colors: income, paid, unpaid, overdue/expense, and net. They stay the same in dark mode, where all five are above 3:1 against cards. In light mode `--chart-2` (2.28:1) and `--chart-3` (2.15:1) are under 3:1 against cards, so charts using them should keep labels or legends.
- Not mapped, because the New York structure has no Status, Secondary Accent, or Gradient groups and new variables are not allowed: pink `#ec4899`, purple `#a855f7`, success `#10b981`, warning `#f59e0b`, info `#3b82f6`, and the `--gradient-*` values.
- Dark mode uses a slate-950 background with slate-900 cards and slate-800 popovers, mirroring New York's layering. Primary and ring use `--brand-light` (`#818cf8`). Dark `--border` and `--input` keep New York's translucent white so they work on every dark surface.
- Sidebar values are New York defaults, marked INCOMPLETE, because the app has no sidebar yet.
- Hex values are computed from the oklch values and convert back exactly. For the New York defaults this gives `#1447e6` (dark `--sidebar-primary`) and `#a1a1a1` (light `--sidebar-ring`), where the base theme's hex column lists `#2563eb` and `#a3a3a3`.

Variable hierarchy:
1. shadCN CSS Variables — standard component theming contract
2. Tailwind utilities — mapped from shadCN variables via `@theme inline`

---

## Theme UI Rules

Rules specific to the KAS theme. These apply when this theme is active and supplement the general design guidelines and copy guidelines. If a theme UI rule conflicts with a general guideline, the theme rule takes precedence for this theme.

EMPTY: None recorded.
