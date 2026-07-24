# Graph Report - HPP-Calculator  (2026-07-24)

## Corpus Check
- 54 files · ~62,825 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 285 nodes · 439 edges · 36 communities (21 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `000413b6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Apple Design System
- Graphify Skill Ecosystem
- Typography & Branding
- Prisma Data Clients
- Agent Rules
- Static Backup
- File Icon Asset
- Globe Icon Asset
- Window Icon Asset
- BEP API Write
- button.jsx
- graphify-ponytail.md
- rules/graphify.md
- workflows/graphify.md
- page.js
- App Layout Rootlayout
- App Page Home
- Generated Client Index D Bepsettingssele
- Generated Client Index D Bepsettingssuma
- Generated Client Index D Bepsettingsupda
- Generated Client Index D Bepsettingsupda
- Generated Client Index D Bepsettingsupda
- Generated Client Index D Datasource
- Generated Client Index D Datasources
- Generated Client Index D Datetimefieldre
- Generated Client Index D Enumquerymodefi
- Generated Client Index D Errorformat
- Generated Client Index D Extends
- Generated Client Index D Floatnullablefi
- Generated Client Index D Floatnullablewi
- Generated Client Index D Floatwithaggreg
- Generated Client Index D Getbepsettingsa

## God Nodes (most connected - your core abstractions)
1. `num()` - 26 edges
2. `fmtRp()` - 22 edges
3. `uid()` - 19 edges
4. `Home()` - 13 edges
5. `roundPrice()` - 12 edges
6. `getPenyusutanBulanan()` - 12 edges
7. `Icon()` - 10 edges
8. `OpexAccumulator()` - 10 edges
9. `FormatInput()` - 9 edges
10. `MenuDatabase()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Logo SVG` --conceptually_related_to--> `Next.js Project Setup`  [INFERRED]
  public/next.svg → README.md
- `Vercel Logo SVG` --conceptually_related_to--> `Next.js Project Setup`  [INFERRED]
  public/vercel.svg → README.md
- `Graphify Integration Config` --references--> `Graphify Skill Definition`  [INFERRED]
  CLAUDE.md → .claude/skills/graphify/SKILL.md
- `Home()` --calls--> `fmtRp()`  [EXTRACTED]
  src/app/page.js → src/utils/hpp.js
- `Home()` --calls--> `num()`  [EXTRACTED]
  src/app/page.js → src/utils/hpp.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify Skill Ecosystem** — claude_skills_graphify_skill, claude_skills_graphify_references_extraction_spec, claude_skills_graphify_references_query, claude_skills_graphify_references_update, claude_skills_graphify_references_exports [EXTRACTED 1.00]

## Communities (36 total, 15 thin omitted)

### Community 0 - "Apple Design System"
Cohesion: 0.50
Nodes (4): Next.js Logo SVG, Vercel Logo SVG, Geist Font Family, Next.js Project Setup

### Community 1 - "Graphify Skill Ecosystem"
Cohesion: 0.33
Nodes (6): Graphify Integration Config, Graph Export Reference, Extraction Specification, Graph Query Reference, Graph Update Reference, Graphify Skill Definition

### Community 2 - "Typography & Branding"
Cohesion: 0.11
Nodes (18): dotenv, eslint, eslint-config-next, devDependencies, dotenv, eslint, eslint-config-next, prisma (+10 more)

### Community 3 - "Prisma Data Clients"
Cohesion: 0.06
Nodes (31): @base-ui/react, class-variance-authority, clsx, lucide-react, next, dependencies, @base-ui/react, class-variance-authority (+23 more)

### Community 5 - "Static Backup"
Cohesion: 0.05
Nodes (37): Border Radius Scale, Brand & Accent, Brand Gradient, Breakpoints, Buttons, Cards & Containers, Collapsing Strategy, Colors (+29 more)

### Community 10 - "BEP API Write"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 13 - "graphify-ponytail.md"
Cohesion: 0.17
Nodes (11): AntiGrafity System Prompt, CODE QUALITY, GRAPHIFY FIRST, IMPLEMENTATION RULES, NEVER, OUTPUT FORMAT, PATCH STRATEGY, PONYTAIL PRINCIPLES (+3 more)

### Community 16 - "page.js"
Cohesion: 0.25
Nodes (19): Home(), ChannelPresetsModal(), MenuMetaModal(), ToastContainer(), DEFAULT_CHANNEL_PRESETS, loadChannelPresets(), loadDB(), loadOpexProfiles() (+11 more)

### Community 24 - "App Page Home"
Cohesion: 0.25
Nodes (21): BepCalculator(), FormatInput(), HppCalculator(), IngredientRow(), PackagingCard(), PackCalcModal(), SectionHeader(), EMOJI_MAP (+13 more)

### Community 86 - "Generated Client Index D Bepsettingssele"
Cohesion: 0.22
Nodes (8): Boundaries, Intensity, Output, Persistence, Ponytail, Rules, The ladder, When NOT to be lazy

### Community 89 - "Generated Client Index D Bepsettingssuma"
Cohesion: 0.25
Nodes (7): Configure Default Mode, Deactivate, Levels, More, Ponytail Help, Skills, Update

### Community 99 - "Generated Client Index D Bepsettingsupda"
Cohesion: 0.40
Nodes (4): Boundaries, Hunt, Output, Tags

### Community 100 - "Generated Client Index D Bepsettingsupda"
Cohesion: 0.40
Nodes (4): Boundaries, Honesty boundary, Ponytail Gain, Scoreboard

### Community 101 - "Generated Client Index D Bepsettingsupda"
Cohesion: 0.40
Nodes (4): Boundaries, Examples, Format, Scoring

### Community 116 - "Generated Client Index D Datasource"
Cohesion: 0.50
Nodes (3): Boundaries, Output, Scan

### Community 117 - "Generated Client Index D Datasources"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 118 - "Generated Client Index D Datetimefieldre"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

## Knowledge Gaps
- **142 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+137 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Prisma Data Clients` to `Typography & Branding`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _142 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Typography & Branding` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Prisma Data Clients` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Static Backup` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `BEP API Read` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `BEP API Write` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._