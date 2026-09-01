# Talk CMS — Design Overhaul: MUI → Tailwind v4 + Radix UI

**Branch:** `feat/design-overhaul` (worktree: `.worktrees/design-overhaul`)
**Goal:** Fully remove MUI/Emotion. Modern developer-tool SaaS look.

## Design System (from ui-ux-pro-max, persisted at design-system/talk-cms/MASTER.md)

- **Style:** Vibrant block-based, developer-tool SaaS (Linear/Vercel feel)
- **Colors:** bg `#0F172A` (slate-900), primary `#1E293B`, secondary `#334155`, accent/CTA `#22C55E` (green-500), text `#F8FAFC`
- **Typography:** Space Grotesk (display) / DM Sans (body)
- **Effects:** large section gaps, bold hover color shifts, 200–300ms transitions
- **Dark mode:** class strategy; dark-first design with light mode support
- **Icons:** lucide-react (replaces all @mui/icons-material)
- **Anti-patterns to avoid:** flat design without depth, text-heavy pages, emoji icons

## New Stack

- Tailwind CSS v4 (Vite plugin, `@import "tailwindcss"`, `@custom-variant dark` class strategy)
- Radix UI primitives (React 19 compatible) wrapped shadcn-style in `src/components/ui/*` with CVA + clsx + tailwind-merge
- lucide-react icons
- CSS design tokens mapped to slate palette + green accent
- Keep: react-resizable-panels, react-dnd, redux (theme slice drives `.dark` class instead of MUI ThemeProvider)

## Component library (Storybook-ready)

All design-system primitives live in **`src/ui/`** — a self-contained component library,
isolated from app code. No imports from `src/components`, `src/store`, or routes allowed
inside `src/ui/`. Imported elsewhere as `@/ui/*`. Storybook will be added later (not now);
structure every primitive as a standalone, props-driven component with co-located types so
stories can be added without refactors.

## UI primitives to build (`src/ui/`)

button, icon-button, input, textarea, select (Radix), dialog (Radix), dropdown-menu (Radix),
tooltip (Radix), tabs (Radix), switch (Radix), scroll-area (Radix), separator (Radix),
popover (Radix), alert, badge, card, skeleton/spinner, tree-view (Radix Accordion-based,
replaces @mui/x-tree-view), fab, snackbar/sonner-style toast, breadcrumb, typography helpers.

## Migration units (incremental, app runnable at every step)

1. **Foundation** — install deps, vite/tailwind config, tokens CSS, fonts, dark-mode via redux
   theme slice → `<html class="dark">`; `cn()` util; ui/* primitives. MUI still present.
2. **Shell** — `Layout.tsx` (drop ThemeProvider/CssBaseline), `DashboardShell` (sidebar nav),
   `DashboardNavigationLink`, `IconButtonLink`, `AppBar`, `UrlAppBar`, `Breadcrumb`.
3. **Dashboard + Pages routes** — `(app)/index.tsx`, `content/pages/index.tsx`, `blocks/index.tsx`.
4. **Block management** — `BlockDefinitionsPage`, `BlockDefinitionForm` (forms: TextField→Input,
   switches, selects, dialogs).
5. **Composer** — `VisualComposer`, `SidebarRight`, `BlockTreeView`, `BlockTree`, `TabConfig`,
   `StyledTreeItem`, `BlockEditor`, `DraggableListItem`, `BlockField`, `GenericBlockEditor`.
6. **Chat** — `ChatBox`, `ChatHistory`, `FloatingChatButton` (Fab, Slide, Snackbar replacements).
7. **MUI removal** — delete theme.ts, uninstall @mui/* + @emotion/*, verify zero imports,
   run lint/typecheck/tests/build + playwright smoke.

## Current MUI surface (25 files)

| File | MUI used |
|---|---|
| theme.ts | createTheme |
| Layout.tsx | ThemeProvider, CssBaseline, Box |
| DashboardShell.tsx | Drawer, List, IconButton, Typography, Box |
| AppBar.tsx | AppBar/Toolbar/Button/Menu etc. |
| UrlAppBar.tsx | Box, IconButton, Typography |
| Breadcrumb.tsx | Breadcrumbs, Link, Typography |
| VisualComposer.tsx | Alert, Box, Button, CircularProgress, useTheme |
| SidebarRight.tsx | Box, Tabs/Tab etc. |
| tabs/TabConfig.tsx | Tabs, Tab, Box, Typography |
| tabs/BlockTree.tsx | TreeView items, Box |
| BlockTreeView.tsx | @mui/x-tree-view SimpleTreeView/TreeItem |
| StyledTreeItem.tsx | styled(TreeItem), alpha |
| BlockEditor.tsx | Box, Typography |
| blocks/core/editor/* | TextField, Switch, Select, Box |
| blocks/management/* | form fields, dialogs, buttons, icons |
| ChatBox/ChatHistory/FloatingChatButton | Fab, Slide, Snackbar, Alert, TextField, icons |
| routes (app)/* | Container, Typography, Box, buttons, lists |
