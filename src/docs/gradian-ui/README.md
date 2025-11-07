# Gradian UI

The design system and experience kit behind the Gradian Integrated Graph Platform. Gradian UI translates decision graphs into interfaces that feel intuitive, data-aware, and ready for orchestration across every Gradian-powered app.

## ✨ Philosophy

- **Graph-Native Experiences** – Components speak the language of nodes, edges, and signals. Every card, chart, and control can reference schema metadata directly.
- **Composable Storytelling** – Build dashboards, narratives, and command centers by assembling configuration-driven modules.
- **Trust-Forward Design** – Clarity, accessibility, and explainability come first so teams can act with confidence.
- **Cross-App Harmony** – Shared tokens, motion, and interaction patterns keep satellite apps aligned with the Gradian.me brand.

## 🧭 Library Map

```
src/gradian-ui/
├── analytics/         # KPI cards, graph metrics, narrative widgets
├── data-display/      # Tables, lists, badges, relationship viewers
├── form-builder/      # Schema-aware form engine & inputs
├── layout/            # Shells, navigation, grid builders
├── profile/           # Identity, avatars, persona switchers
├── relation-manager/  # Graph relation explorers and editors
├── schema-manager/    # Schema wizards, inspectors, config helpers
├── shared/            # Tokens, hooks, utilities, theme contracts
└── index.ts           # Barrel exports for the full kit
```

Each domain follows a consistent structure: `components/`, `hooks/`, `types/`, `utils/`, and optional `docs/` to keep code discoverable and extendable.

## 🚀 What You Get

- **Decision Canvas Components** – KPI tiles, sparkline stories, insight timelines, and trend narratives.
- **Graph-Aware Tables** – Auto-format relations, status badges, and nested data in one cohesive grid.
- **Schema-Driven Forms** – Build or edit entities through metadata-only definitions, including validation and layout logic.
- **Experience Primitives** – Headers, sidebars, selectors, toasts, and overlays tuned for multi-app orchestration.
- **Theme System** – Tailwind-first tokens with light/dark palettes and custom brand channels.

## 🔧 Working With Gradian UI

### Install (already part of the monorepo)

Components are local packages—import directly from `@/gradian-ui`:

```tsx
import { KPIIndicator, RelationTable } from '@/gradian-ui';

const kpiConfig = {
  id: 'confidence-score',
  title: 'Decision Confidence',
  format: 'percent',
  trend: { period: '7d' }
};

function ConfidencePanel({ value, previous }) {
  return (
    <KPIIndicator config={kpiConfig} value={value} previousValue={previous} />
  );
}
```

### Configuration-First Patterns

Most components accept a `config` object that maps directly to schema metadata:

```typescript
type ComponentConfig = {
  id: string;
  title?: string;
  description?: string;
  props?: Record<string, unknown>;
  relations?: Array<{ source: string; target: string; type: string }>;
  layout?: {
    span?: number;
    priority?: number;
  };
};
```

Leverage these configs to keep UIs declarative and aligned with the underlying decision graph.

### Hooks & Utilities

- `useFormState` – Schema-driven form state and validation.
- `useComponentData` – Fetch and normalize component data from the graph.
- `useThemeTokens` – Access brand gradients, elevations, and motion presets.

## 🎨 Theming & Tokens

Gradian UI centralizes design tokens under `shared/`:

- **Foundations** – Color ramps, typography scale, spacing, shadows.
- **Modes** – `light`, `dark`, and `command` (high-contrast) palettes.
- **Customization** – Extend tokens via configuration: `setTheme({ primary: '#4F46E5', accent: '#14B8A6' })`.

## 🧠 Building New Components

1. Mirror the domain structure (`components`, `hooks`, `types`, `utils`).
2. Define TypeScript-first configuration models.
3. Wire configuration to runtime behavior—no hardcoded copy or data.
4. Document usage in `docs/` with at least one narrative example.
5. Validate accessibility (focus, semantics, screen readers).
6. Test visuals in light and dark themes at multiple breakpoints.

## 🤝 Contributing to the Vision

- Share new patterns that make decision graphs feel even more tangible.
- Keep the storytelling focus—every component should reinforce trust.
- Align naming, tone, and interaction with the Gradian.me brand guidelines.
- Capture learnings in the docs so satellite teams can move fast with confidence.

## 📄 License

Part of the proprietary Gradian.me applications and platforms. Reach out to the Gradian team for partnership opportunities.
