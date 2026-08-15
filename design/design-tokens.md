# JK Manpower ERP — Design System Tokens

**Source:** Derived from Google Stitch — JK Manpower Enterprise ERP (Executive Precision)  
**Project Reference:** `https://stitch.withgoogle.com/projects/14094181366976603289`  
**Target System:** Next.js 15, Tailwind CSS, CSS Custom Properties, Radix/Base UI, Lucide Icons

---

## 1. Color Palette

### Light Theme Tokens

| Token Name                       | Hex Value | Usage / Description                                  |
| :------------------------------- | :-------- | :--------------------------------------------------- |
| `--jk-surface`                   | `#f7f9fb` | Application background (neutral gray canvas)         |
| `--jk-surface-container-lowest`  | `#ffffff` | Elevated cards, clean containers, dropdown panels    |
| `--jk-surface-container-low`     | `#f2f4f6` | Sidebar background, secondary container backing      |
| `--jk-surface-container`         | `#eceef0` | Table headers, secondary card background             |
| `--jk-surface-container-high`    | `#e6e8ea` | Subtle hover fills, neutral highlight states         |
| `--jk-surface-container-highest` | `#e0e3e5` | Divider borders, active container accents            |
| `--jk-on-surface`                | `#191c1e` | High contrast primary typography                     |
| `--jk-on-surface-variant`        | `#434655` | Secondary text, field labels, metadata               |
| `--jk-primary`                   | `#004ac6` | Brand deep blue action color                         |
| `--jk-primary-container`         | `#2563eb` | Primary interactive buttons, key focus accents       |
| `--jk-on-primary`                | `#ffffff` | Text on primary containers                           |
| `--jk-secondary`                 | `#006c49` | Deep emerald green for success & finance             |
| `--jk-secondary-container`       | `#6cf8bb` | Soft green badge background for Active / Approved    |
| `--jk-on-secondary-container`    | `#00714d` | Text on green badges                                 |
| `--jk-tertiary`                  | `#46566c` | Slate teal accent for navigation & secondary actions |
| `--jk-tertiary-container`        | `#5e6e85` | Muted slate containers                               |
| `--jk-error`                     | `#ba1a1a` | Destructive actions, system alerts, overdue flags    |
| `--jk-error-container`           | `#ffdad6` | Error badge background                               |
| `--jk-on-error-container`        | `#93000a` | Error badge text                                     |
| `--jk-outline`                   | `#737686` | Standard form border outline                         |
| `--jk-outline-variant`           | `#c3c6d7` | Soft card & table borders                            |

### Dark Theme Tokens

| Token Name                      | Hex Value | Usage / Description                   |
| :------------------------------ | :-------- | :------------------------------------ |
| `--jk-surface`                  | `#2d3133` | Dark mode main background             |
| `--jk-surface-container-lowest` | `#191c1e` | Deep background surface               |
| `--jk-surface-container-low`    | `#25282b` | Dark mode sidebar canvas              |
| `--jk-surface-container`        | `#2d3133` | Dark mode card background             |
| `--jk-surface-container-high`   | `#363a3d` | Dark mode hover & elevated surfaces   |
| `--jk-on-surface`               | `#eff1f3` | High contrast light text              |
| `--jk-on-surface-variant`       | `#c3c6d7` | Muted dark mode secondary text        |
| `--jk-primary`                  | `#b4c5ff` | Bright light-blue accent in dark mode |
| `--jk-primary-container`        | `#2563eb` | Primary interactive blue container    |
| `--jk-outline-variant`          | `#434655` | Dark mode subtle borders              |

---

## 2. Typography System

- **Heading Font Family:** `"Plus Jakarta Sans", system-ui, -apple-system, sans-serif`
- **Body Font Family:** `"Inter", system-ui, -apple-system, sans-serif`

| Type Role       | Font Size         | Line Height      | Font Weight                  | Usage                                     |
| :-------------- | :---------------- | :--------------- | :--------------------------- | :---------------------------------------- |
| Display 2XL     | `2.25rem` (36px)  | `2.5rem` (40px)  | Bold (700)                   | Hero totals, key metric emphasis          |
| Heading XL      | `1.875rem` (30px) | `2.25rem` (36px) | Bold (700)                   | Main page titles                          |
| Heading LG      | `1.5rem` (24px)   | `2.0rem` (32px)  | SemiBold (600)               | Section headers, card group titles        |
| Heading MD      | `1.25rem` (20px)  | `1.75rem` (28px) | SemiBold (600)               | Modal headers, sub-sections               |
| Subheading      | `1.0rem` (16px)   | `1.5rem` (24px)  | Medium (500)                 | Card titles, key list items               |
| Body Default    | `0.875rem` (14px) | `1.25rem` (20px) | Regular (400) / Medium (500) | Form inputs, table cells, paragraph body  |
| Caption / Small | `0.75rem` (12px)  | `1.0rem` (16px)  | Regular (400) / Medium (500) | Badges, timestamp metadata, field helpers |

---

## 3. Spacing Grid

Base unit: `8px` (4px for micro-adjustments).

- `spacing-xs`: `4px` (`0.25rem`)
- `spacing-sm`: `8px` (`0.5rem`)
- `spacing-md`: `16px` (`1.0rem`)
- `spacing-lg`: `24px` (`1.5rem`)
- `spacing-xl`: `40px` (`2.5rem`)
- `sidebar-width`: `280px`
- `sidebar-collapsed-width`: `72px`
- `header-height`: `64px`
- `container-max`: `1440px`

---

## 4. Border Radius Scale

- `radius-sm`: `0.25rem` (4px) — Small badges, inline code tags
- `radius-default`: `0.5rem` (8px) — Buttons, form inputs, tooltips
- `radius-md`: `0.75rem` (12px) — Cards, dropdown menus, table containers
- `radius-lg`: `1.0rem` (16px) — Modals, slide-over sheets, key highlight cards
- `radius-xl`: `1.5rem` (24px) — Featured dashboard callout cards
- `radius-full`: `9999px` — Avatar circles, pill status tags

---

## 5. Elevation & Shadow Scale

- **Card Shadow:** `0 4px 12px rgba(0, 0, 0, 0.03)`
- **Dropdown & Popover Shadow:** `0 6px 18px rgba(0, 0, 0, 0.06)`
- **Modal & Sheet Shadow:** `0 12px 32px rgba(0, 0, 0, 0.08)`
- **Hover Elevation:** `0 8px 24px rgba(0, 0, 0, 0.05)`

---

## 6. Icon Style Rules

- **Library:** Lucide Icons (`lucide-react`)
- **Stroke Width:** `1.5px` for standard UI, `2.0px` for active states / small icons
- **Default Sizes:** 16px (small actions), 20px (standard button/menu), 24px (header/hero)
- **Palette Mapping:** Icons adopt their container's text color (`text-muted-foreground` for subtle icons, `text-primary` for active icons)

---

## 7. Component Visual Patterns

- **Buttons:**
  - _Primary:_ Solid primary container fill (`#2563eb`), bold text, subtle scale hover effect (`hover:brightness-105 active:scale-[0.98]`).
  - _Secondary:_ Soft surface fill (`--jk-surface-container`), border outline, subtle text.
  - _Ghost:_ No border/background until hover (`hover:bg-muted`).
  - _Destructive:_ Soft error fill (`--jk-error-container`) or solid red.
- **Form Inputs:**
  - Crisp border outline (`--jk-outline-variant`), 8px radius, explicit focus ring (`ring-2 ring-primary/20 ring-offset-1`).
  - Error state displays red outline with immediate inline helper message.
- **Data Table:**
  - Sticky clean header (`bg-muted/50`), row hover background (`hover:bg-accent/40`), sortable column headers, clear pagination footer.
- **Status Badges:**
  - Pill format with soft background and vibrant dark text (`bg-emerald-500/15 text-emerald-700 dark:text-emerald-300` for Active; `bg-amber-500/15 text-amber-700` for Pending; `bg-rose-500/15 text-rose-700` for Overdue/Rejected).

---

## 8. Documented Assumptions

1. **Kanban Pipeline Board:** Extended Stitch design language into candidate recruitment pipelines using card containers with draggable grips and status column header chips.
2. **Payslip Document Design:** Formatted paper/PDF payslip preview leveraging tabular layout with Sri Lankan statutory breakdowns (EPF 8%, EPF 12%, ETF 3%).
3. **Mobile Companion Preview:** Rendered mobile preview using native iOS/Android shell device wrappers running exact design tokens for field workers.
