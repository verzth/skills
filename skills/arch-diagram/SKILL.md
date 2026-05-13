---
name: arch-diagram
description: >
  Generates interactive system diagrams as polished, self-contained HTML files with automatic
  layout, zoom/pan, click-to-explore node details, dark/light theme toggle, and SVG/PNG/PDF export.
  Architecture and flowchart diagrams are fully editable: drag nodes, add/remove nodes and edges,
  rename labels. Supports architecture, sequence, ER, flowchart, state machine, and class diagrams.
  Use this skill whenever the user wants to diagram, visualize, or document a system,
  architecture, API flow, database schema, state machine, or any technical structure —
  even casual requests like "draw this", "show me how these connect", "map out my stack",
  or "make a diagram of my app". Always use this skill in preference to generating raw Mermaid
  code or plain SVG when the user wants a diagram.
---

# arch-diagram

Read `resources/template.html` first — that's the HTML shell you'll fill in. Your job is to produce a complete, self-contained `.html` file by replacing three placeholders: `__DIAGRAM_TITLE__`, `__MERMAID_SOURCE__`, and `__DIAGRAM_DATA_JSON__`.

The template has **two rendering modes** selected by `DIAGRAM_DATA.type`:

| `type` value | Renderer | Editing |
|---|---|---|
| `"flowchart"` | Cytoscape.js | Fully editable (drag, add, delete, rename) |
| `"graph"` | Cytoscape.js | Same as above |
| `"er"`, `"state"`, `"class"` | Mermaid | Read-only |
| `"sequence"` | Standalone SVG HTML | Read-only (see section below — do NOT use template) |

## Built-in features (no setup needed)

Everything below works automatically in every generated HTML file:

| Feature | How |
|---|---|
| Zoom / pan | Scroll wheel + drag (Cytoscape handles it natively) |
| Dark / light theme | ◑ button in toolbar |
| Export | SVG / PNG / PDF buttons |
| Click node → details panel | Slides in from the right; shows title, description, tech stack, links |
| Highlight neighbors | Click a node: direct neighbors stay full color, non-connected nodes dim to 0.35 opacity. Click canvas or press `Esc` to reset |
| **Flowchart only** | |
| Drag nodes | Click + drag any node |
| Add node | `+ Node` button |
| Add edge | `+ Edge` button → click source → click target |
| Rename node / edge | Double-click the node or edge label |
| Bend edges | Single-click an edge → drag the blue handle to curve it |
| Delete | Select + `Del` / `Backspace`, or `✕ Delete` button |
| 💾 Save | Downloads an updated self-contained HTML with current positions baked in (reloads without re-running ELK layout) |
| ⏱ Auto | Autosaves to `localStorage` after 5 s of inactivity; toggle on/off; `Ctrl/Cmd+S` also triggers save |
| ▾ Info | Collapses / expands the summary cards strip; keyboard shortcut `I` |

## Workflow

1. Clarify what the user wants to diagram (or infer it confidently if context is clear)
2. Choose the right diagram type from the table below
3. Build `DIAGRAM_DATA` with the correct format for that type
4. Fill the template placeholders and save as `<descriptive-title>.html`

## Diagram type selection

| User wants | Use |
|---|---|
| System architecture, infrastructure, microservices | `"flowchart"` (Cytoscape, LR direction) |
| Top-down flow, decision trees, process flows | `"flowchart"` (Cytoscape, TD direction) |
| API call sequences, auth flows, request/response | `"sequence"` (standalone SVG HTML) |
| Database schema, data models, entity relationships | `"er"` (Mermaid) |
| State machines, lifecycle, status transitions | `"state"` (Mermaid) |
| Class hierarchies, interfaces, OOP structure | `"class"` (Mermaid) |

## Template placeholders

### `__DIAGRAM_TITLE__`
Plain text title. Appears in the browser `<title>` tag. Also set `DIAGRAM_DATA.title` to the same value.

---

## Architecture / flowchart diagrams (Cytoscape mode)

For `type: "flowchart"` or `type: "graph"`, set `__MERMAID_SOURCE__` to an empty string and put the graph data in `DIAGRAM_DATA.elements`.

### `__MERMAID_SOURCE__` (leave empty)
```
``  ← empty string, Cytoscape doesn't use Mermaid source
```

### `__DIAGRAM_DATA_JSON__` for Cytoscape

Elements are a flat array — nodes have only `data.id`; edges have `data.source` and `data.target`.

```json
{
  "type": "flowchart",
  "title": "E-Commerce Microservices",
  "layout": { "direction": "LR" },
  "elements": [
    { "data": { "id": "WebApp",   "label": "Web App\n(React)",    "category": "frontend" } },
    { "data": { "id": "API",      "label": "API Gateway\n(Kong)", "category": "backend"  } },
    { "data": { "id": "AuthSvc",  "label": "Auth Service",        "category": "auth"     } },
    { "data": { "id": "DB",       "label": "PostgreSQL",          "category": "database" } },
    { "data": { "id": "Cache",    "label": "Redis",               "category": "cache"    } },
    { "data": { "id": "Queue",    "label": "RabbitMQ",            "category": "queue"    } },
    { "data": { "id": "CDN",      "label": "CloudFront CDN",      "category": "infra"    } },
    { "data": { "id": "Stripe",   "label": "Stripe Payments",     "category": "external" } },
    { "data": { "id": "e1",  "source": "WebApp",  "target": "API",     "label": "HTTPS" } },
    { "data": { "id": "e2",  "source": "API",     "target": "AuthSvc", "label": "verify" } },
    { "data": { "id": "e3",  "source": "API",     "target": "DB",      "label": "SQL"   } },
    { "data": { "id": "e4",  "source": "API",     "target": "Cache",   "label": "read"  } },
    { "data": { "id": "e5",  "source": "API",     "target": "Queue",   "label": "publish" } },
    { "data": { "id": "e6",  "source": "API",     "target": "Stripe",  "label": "charge" } },
    { "data": { "id": "e7",  "source": "CDN",     "target": "WebApp",  "label": "serve" } }
  ],
  "nodes": {
    "WebApp": {
      "title": "Web Application",
      "description": "React SPA served globally via CloudFront. Handles all user interactions.",
      "tech": ["React 18", "TypeScript", "Vite", "Tailwind CSS"],
      "links": [{"label": "Staging", "url": "https://staging.example.com"}]
    },
    "API": {
      "title": "API Gateway",
      "description": "Kong-based gateway. Routes requests, enforces rate limits, handles auth.",
      "tech": ["Kong", "Lua plugins"],
      "links": []
    }
  },
  "summary": [
    { "title": "Frontend",      "items": ["React 18 SPA", "CDN-delivered globally", "TypeScript"] },
    { "title": "Backend",       "items": ["Kong API Gateway", "PostgreSQL primary DB", "Redis cache"] },
    { "title": "Infrastructure","items": ["AWS ECS Fargate", "RDS Multi-AZ", "CloudWatch"] }
  ]
}
```

### Node categories and colors

| `category` | Color | Use for |
|---|---|---|
| `"frontend"` | Blue `#3B82F6` | Browsers, SPAs, mobile apps, CDN |
| `"backend"` | Green `#10B981` | APIs, microservices, servers |
| `"database"` | Purple `#8B5CF6` | SQL, NoSQL, data stores |
| `"cache"` | Amber `#F59E0B` | Redis, Memcached, in-memory |
| `"queue"` | Red `#EF4444` | RabbitMQ, Kafka, SQS, pubsub |
| `"auth"` | Pink `#EC4899` | Auth servers, OAuth, IAM |
| `"infra"` | Cyan `#06B6D4` | Load balancers, CDN, DNS, cloud services |
| `"external"` | Gray `#64748B` | Third-party APIs, payment gateways |
| *(omit)* | Dark slate | Anything that doesn't fit above |

### Layout direction

- `"LR"` — left-to-right, good for pipelines and microservices
- `"TD"` — top-down, good for hierarchies and decision trees

### Node labels

Use `\n` inside label strings for multi-line text:
```json
{ "data": { "id": "API", "label": "API Server\n(Node.js 20)", "category": "backend" } }
```

### Edge IDs

Edge IDs must be unique — use a short descriptive string or `"e1"`, `"e2"`, etc.:
```json
{ "data": { "id": "web_to_api", "source": "WebApp", "target": "API", "label": "HTTPS" } }
```

---

## Sequence diagrams (standalone SVG HTML)

**Do NOT use the template for sequence diagrams.** Generate a completely standalone `<!DOCTYPE html>` file with an inline `<svg>` sequence diagram. This produces a much richer visual than Mermaid.

### Visual design conventions

Follow these patterns consistently:

**Actors** — rounded rectangles (`rx="12"`) with vertical linear gradients, colored per role. Repeated at the bottom (50% opacity). Suggested palette:
- Browser / client → blue `#3b82f6` → `#1d4ed8`
- App / backend → violet `#8b5cf6` → `#6d28d9`
- Auth / identity server → green `#10b981` → `#059669`
- Resource / data server → amber `#f59e0b` → `#d97706`
- Choose additional colors freely for extra actors

**Lifelines** — dashed vertical lines (`stroke-dasharray="5,4"`, 40% opacity) matching each actor's color, running from the actor box to the bottom.

**Activation boxes** — small solid rectangles (`width="12"`, height ~36px) on the lifeline when an actor is processing, matching that actor's color.

**Phase bands** — translucent grouped background rectangles with a dashed border and a short uppercase label in the top-left (e.g. `"A — USER INITIATES LOGIN"`). Color-code bands by which actor drives each phase.

**Arrows:**
- Solid line = request / call
- Dashed line (`stroke-dasharray="6,3"`) = response / redirect
- Color = source actor's color
- `<marker>` arrowhead at the target end, same color as the line
- Short label centered on the arrow, inside a small `<rect fill="#1e293b" rx="4"/>` background

**Step numbers** — filled `<circle r="9"/>` at the source end of each arrow, actor-colored with `stroke="#1e293b"`, white number text inside.

**viewBox** — calculate based on content: `"0 0 [width] [height]"`. Width = 200 + (actors × 240). Height = 100 + (steps × 75). Minimum `860 × 600`.

### Layout algorithm

1. Compute actor x-centers: space actors evenly across the viewBox width (leave 80px margin each side)
2. Each step occupies a fixed Y band (~70px). Phase bands span the full Y range of their steps
3. Arrow Y = step_index × 70 + 140 (offset below actor boxes)
4. Arrow X1 = source actor x-center ± 6 (account for activation box width); X2 = target actor x-center ± 6

### Page structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>[Diagram Title]</title>
  <style>
    /* dark background, centered layout, legend, footer */
    body { font-family: system-ui, sans-serif; background: #0f1117; color: #e2e8f0;
           min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 20px 60px; }
    .diagram-wrap { width: 100%; max-width: 1200px; overflow-x: auto; }
    svg.sequence { display: block; width: 100%; height: auto; min-width: 860px; }
  </style>
</head>
<body>
  <div class="title-block">…h1 + subtitle + badge…</div>
  <div class="diagram-wrap">
    <svg class="sequence" viewBox="0 0 W H" xmlns="http://www.w3.org/2000/svg">
      <defs>…gradients, arrowhead markers, drop-shadow filter…</defs>
      <!-- background panel, actor boxes, lifelines, phase bands, steps, actor footers, step numbers -->
    </svg>
  </div>
  <!-- legend and footer -->
</body>
</html>
```

### What makes a great sequence diagram

- Group steps into **phases** (3–6 phases) — each phase gets a background band and a letter label
- Use **self-arrows** (curved `<path>`) for internal processing steps
- **Color consistency**: every element for actor X uses actor X's color
- Arrow label rectangles prevent text overlap with lifelines
- Include a **legend** below the SVG explaining line styles
- Add a **footer** with protocol reference if applicable (e.g. "RFC 6749 § 4.1")

## ER / State / Class diagrams (Mermaid mode)

For these types, set `DIAGRAM_DATA.type` to `"er"`, `"state"`, or `"class"` and put Mermaid syntax in `__MERMAID_SOURCE__`. The `elements` field is not used.

**ER diagram example:**
```
erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "included in"

  USER { string id PK; string email; string name }
  ORDER { string id PK; string userId FK; datetime createdAt }
```

### `__DIAGRAM_DATA_JSON__` for Mermaid

For read-only Mermaid diagrams, `elements` is omitted. `nodes` and `connections` can be empty `{}` since click-to-highlight requires manual wiring.

```json
{
  "type": "er",
  "title": "Social Media Schema",
  "nodes": {},
  "connections": {},
  "theme": {
    "dark": {
      "primaryColor": "#3B82F6",
      "primaryTextColor": "#FFFFFF",
      "primaryBorderColor": "#2563EB",
      "secondaryColor": "#10B981",
      "tertiaryColor": "#8B5CF6",
      "lineColor": "#64748B",
      "background": "#0F172A",
      "mainBkg": "#1E293B",
      "nodeBorder": "#334155",
      "clusterBkg": "#1E293B",
      "clusterBorder": "#475569",
      "titleColor": "#F1F5F9",
      "edgeLabelBackground": "#1E293B",
      "attributeBackgroundColorEven": "#1E293B",
      "attributeBackgroundColorOdd": "#0F172A"
    },
    "light": {
      "primaryColor": "#3B82F6",
      "primaryTextColor": "#FFFFFF",
      "primaryBorderColor": "#2563EB",
      "secondaryColor": "#10B981",
      "tertiaryColor": "#8B5CF6",
      "lineColor": "#94A3B8",
      "background": "#F8FAFC",
      "mainBkg": "#FFFFFF",
      "nodeBorder": "#CBD5E1",
      "clusterBkg": "#F1F5F9",
      "clusterBorder": "#CBD5E1",
      "titleColor": "#0F172A",
      "edgeLabelBackground": "#F8FAFC",
      "attributeBackgroundColorEven": "#F1F5F9",
      "attributeBackgroundColorOdd": "#FFFFFF"
    }
  },
  "summary": [
    { "title": "Flow Steps", "items": ["User login redirect", "Token exchange", "API access"] }
  ]
}
```

---

## Summary cards

The `summary` array (2–4 cards) renders below the diagram as a collapsible strip. Use it for context the diagram can't show: key tech choices, performance characteristics, cost notes, deployment strategy, or important caveats. Each card has a `title` and a short `items` list (3–5 bullets max). Omit `summary` or set to `[]` to hide the strip entirely (the `▾ Info` toggle button also won't appear).

## Compound grouping (recommended for 10+ nodes)

For diagrams with more than ~10 nodes, group nodes into semantic compound parents. This dramatically reduces edge crossings and makes the diagram readable.

### How to add parent groups

1. Add parent nodes at the **top** of the `elements` array with `isParent: true`:

```json
{ "data": { "id": "g_clients",  "label": "FRONTEND CLIENTS",  "isParent": true } },
{ "data": { "id": "g_engines",  "label": "MICROSERVICES",     "isParent": true } },
{ "data": { "id": "g_data",     "label": "DATA LAYER",        "isParent": true } },
{ "data": { "id": "g_external", "label": "EXTERNAL SERVICES", "isParent": true } }
```

2. Add a `parent` field to each child node:

```json
{ "data": { "id": "WebApp", "label": "Web App", "category": "frontend", "parent": "g_clients" } }
```

### Common grouping patterns

| Group ID | Contains |
|---|---|
| `g_clients` | Frontends, mobile apps, CLI tools |
| `g_gateways` | API gateways, load balancers, edge routers |
| `g_engines` | Microservices, backend services (usually the largest group) |
| `g_data` | Databases, caches, message queues |
| `g_external` | Third-party APIs — sub-group further if >5 items (`g_pay`, `g_kyc`, `g_analytics`, …) |
| `g_platform` | Observability, secrets, CI/CD, cloud infrastructure |

**Rules of thumb:**
- Aim for 4–9 parent groups; each parent should contain 2–10 children
- Single-child parents add visual clutter — skip them
- Parent labels: ALL CAPS, no abbreviations (letter-spacing is rendered automatically)

## Tips for good diagrams

- Aim for 6–15 nodes per diagram; for larger systems, split into multiple focused diagrams
- Edge labels should be concise: protocol (`HTTPS`, `SQL`, `gRPC`), action (`publish`, `query`), or role (`verify`)
- For flowchart diagrams, `nodes` metadata is optional but highly recommended — it powers the click-to-details panel
- For sequence/ER/state diagrams, `nodes` and `connections` can be `{}` — the highlight feature is Cytoscape-only
- **Layout determinism**: the template uses ELK Layered with deterministic behavior — diagrams render identically on every reload. If you see layout drift, check that every child node has exactly one `parent` (no node can belong to two groups)
- **Edge crossings on dense graphs**: ELK's `LAYER_SWEEP` + `NETWORK_SIMPLEX` placement handles most cases. If crossings remain on graphs with 30+ nodes, consider: (1) splitting into multiple focused diagrams per domain/flow, or (2) removing low-signal edges by representing shared infra as a single edge from a compound parent
