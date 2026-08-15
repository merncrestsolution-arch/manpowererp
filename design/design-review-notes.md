# JK Manpower ERP — Design System & UI Review Notes

**Author:** Senior Product Designer & Frontend Architect  
**Project:** JK Manpower ERP  
**Scope:** Design System Extraction, Reusable Component Library, and Complete Screen Mockup Inventory

---

## 1. Extracted vs Assumed Values

### Directly Extracted from Google Stitch Reference

- **Core Color System:** Primary Blue (`#004ac6` / `#2563eb`), Secondary Emerald (`#006c49`), Tertiary Slate (`#46566c`), Error Crimson (`#ba1a1a`).
- **Surface Elevation Hierarchy:** Surface levels (`lowest`, `low`, `container`, `high`, `highest`) reflecting Google Material You container tokens.
- **Typography Pairings:** `Plus Jakarta Sans` for titles and KPI headings; `Inter` for data tables, form controls, and body UI text.
- **Spacing Grid:** Standardized 8px grid (`4px`, `8px`, `16px`, `24px`, `40px`).

### Reasonable Assumptions & Extensions Made

1. **Recruitment Kanban View:** Stitch provides basic list/table references. For Manpower recruitment, we extended this into a candidate pipeline board featuring candidate cards, resume quick-views, stage counts, and interview triggers.
2. **Dynamic Invoice Builder:** Designed a responsive line-item builder supporting unit calculation for manpower hours/days, OT rates, and Sri Lankan Tax / VAT adjustments.
3. **Official Payslip Document View:** Extracted standard Sri Lankan payroll rules (EPF Employee 8%, EPF Employer 12%, ETF Employer 3%) into a clean printable payslip container.
4. **Mobile Companion Preview:** Built a dedicated mobile emulator view (`/mobile-preview`) that showcases how the design system translates into native Flutter mobile screens for field supervisors.

---

## 2. Key Design Decisions

- **Data Density Management:** Applied clean hierarchy using `Inter` 14px body fonts, 8px padding cell padding, and high-contrast numerical styling for financial figures (e.g. `LKR 1,250,000.00`).
- **Real Sri Lankan Enterprise Context:** Replaced all placeholder content with realistic Sri Lankan business names (e.g., _Ceylon Beverage Corp_, _Lanka Logistics Ltd_, _Colombo Apparel Mills_), Sri Lankan employee names (_Kavinda Perera_, _Dilshan Silva_, _Nirmala Fernando_), and local currency formatting.
- **Accessibility & Contrast:** All text pairings maintain WCAG AA contrast standards in both light and dark mode toggles. Focus rings (`ring-2 ring-primary/20`) ensure full keyboard accessibility across all interactive controls.
