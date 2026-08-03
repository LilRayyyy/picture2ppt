# picture2ppt

English | [简体中文](README.md)

[![Validate](https://github.com/LilRayyyy/picture2ppt/actions/workflows/validate.yml/badge.svg)](https://github.com/LilRayyyy/picture2ppt/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A Codex Skill for high-fidelity PowerPoint reconstruction and editing. It turns a reference picture into an editable PowerPoint instead of pasting the picture into a slide, preserving the reference composition while rebuilding every nameable semantic element as an independently selectable and editable object.

This repository was renamed from `ppt-fidelity-editor` to `picture2ppt`; the install path, invocation, and Skill metadata are updated together.

## Why this exists

Many image-to-PowerPoint workflows paste a full slide, a large screenshot region, or a composite diagram into the deck. The result may look similar, but its text, icons, cards, connectors, and charts cannot be edited independently.

picture2ppt treats visual fidelity and semantic editability as joint requirements:

> Every visible semantic element must have exactly one final representation and remain independently selectable.

## Core principles

- **Two inseparable goals**: visual fidelity and semantic editability.
- **Atomic decomposition**: split text, icons, cards, charts, people, devices, and connectors into nameable elements.
- **Reference coordinates**: preserve composition, bounds, spacing, angles, z-order, and aspect ratio.
- **One visual layer**: remove old source pixels before adding a replacement.
- **Evidence-based QA**: structural checks do not replace final rendering, overlays, difference images, and full-size visual review.

## Use cases

- Rebuild editable slides from screenshots or flattened images;
- reconstruct PowerPoint slides from PDF pages;
- repair low-editability PPTX files made from full-slide images;
- audit an existing presentation for fidelity and object editability;
- reconstruct slides with complex icons, connectors, cards, devices, or layered architecture diagrams.

Supported references include screenshots, flattened images, PDFs, and low-editability PPTX files. The final deck is produced through the presentation-authoring toolchain exposed by the host.

## Non-goals

- Placing one image per slide;
- automatically redesigning or reflowing the reference;
- using source material without the required rights;
- replacing complex reference visuals with Emoji, screenshot crops, or crude geometry when no suitable image capability exists.

This project does not present screenshot crops, Emoji, symbol fonts, or generic clipart as high-fidelity reconstruction.

## Prerequisites

- A Codex environment with Skill support;
- a presentation-authoring toolchain that can create and render PowerPoint files;
- Node.js 22 for repository validation and bundled scripts;
- a callable image-generation or editing capability, such as Codex `imagegen`, for complex icons, people, devices, 3D objects, or material-rich visuals.

When a complex element requires image generation and the host does not expose a sufficient capability, the Skill reports a blocker instead of silently using a low-fidelity substitute.

## Installation

After the repository becomes public, install it manually:

```bash
git clone https://github.com/LilRayyyy/picture2ppt.git
mkdir -p ~/.codex/skills
cp -R picture2ppt/skills/picture2ppt ~/.codex/skills/picture2ppt
```

Restart or reload Skills when required by the current Codex host. The package entry point is [`skills/picture2ppt/SKILL.md`](skills/picture2ppt/SKILL.md).

## Quick start

Attach a reference PDF, image, or PPTX in Codex, then invoke:

```text
$picture2ppt Reconstruct this PDF as a high-fidelity, fully editable PowerPoint and complete structure and visual QA before delivery.
```

The Skill chooses among native PowerPoint objects, atomic generated assets, and semantic-free backgrounds. It pauses only when required source material, permission, or capability is missing.

## Workflow

1. **Establish the reference**: record slide dimensions, aspect ratio, and content frame.
2. **Build a fidelity ledger**: record bounds, representation, provenance, and QA risks for every semantic element and background layer.
3. **Rebuild element by element**: use native objects for text and simple geometry; decompose and independently generate complex visual singletons.
4. **Remove old pixels**: ensure that source pixels and replacement objects never remain visible together.
5. **Run structural verification**: inspect object types, names, counts, bounds, and z-order.
6. **Run visual verification**: render the final deck, compare side by side, inspect overlays and differences, and revise critical drift.

## Quality gates

Before delivery:

- all visible text is native text;
- each complex sticker contains one independently nameable visual element;
- backgrounds contain no text, icons, charts, devices, or connectors;
- no full-slide, half-slide, or multi-semantic screenshot region remains;
- connector endpoints, bends, styling, direction, and z-order are checked in the final render;
- both structure QA and visual QA pass;
- comparison artifacts are regenerated and inspected after the last edit.

See [`SKILL.md`](skills/picture2ppt/SKILL.md) and [`references/`](skills/picture2ppt/references/) for the complete contract.

## Successful examples and image-cleanup comparisons

The images below are embedded directly so the repository home page shows the successful reconstructions without requiring a separate folder click. Each example was rebuilt as independently editable text, shapes, connectors, tables, and/or atomic generated stickers; the final deck does not use a composite full-slide screenshot as its background.

The page-table and thread examples preserve an “original render / imagegen cleaned render” pair. The original keeps the footer promotion text; the cleaned version removes only the specified footer text, illustrating how picture2ppt can refine an isolated visual asset without flattening or redesigning the slide.

### Multi-level page tables: original / cleaned

| Original render | Imagegen cleaned render |
| --- | --- |
| ![Original multi-level page tables](examples/pagetable-multilevel.png) | ![Cleaned multi-level page tables](examples/pagetable-multilevel-clean.png) |

### OSI seven-layer model

![OSI seven-layer model](examples/osi-seven-layer.png)

### Process and resource boundaries

![Process and resource boundaries](examples/process-resource-boundary.png)

### Thread shared and private content: original / cleaned

| Original render | Imagegen cleaned render |
| --- | --- |
| ![Original thread shared and private content](examples/thread-shared-private.png) | ![Cleaned thread shared and private content](examples/thread-shared-private-clean.png) |

[`examples/README.md`](examples/README.md) remains as a standalone gallery index for direct image browsing and reuse.

## Repository structure

```text
.
├── README.md / README.en.md
├── LICENSE
├── .github/                         # Issue, PR, and CI configuration
├── docs/                            # Public release checklist
├── tools/                           # Repository-level validators
├── examples/                       # Successful reconstructions and cleanup comparisons
└── skills/picture2ppt/
    ├── SKILL.md
    ├── agents/
    ├── assets/
    ├── references/
    └── scripts/
```

Project documentation is separated from the installable Skill package so repository policies, README files, and CI configuration do not enter the Skill context.

## Local validation

Run from the repository root:

```bash
node --test tools/validate-repository.test.mjs
node tools/validate-repository.mjs
node --check skills/picture2ppt/scripts/validate-fidelity-ledger.mjs
node --check skills/picture2ppt/scripts/validate-visual-qa.mjs
node --check skills/picture2ppt/scripts/verify-ppt-structure.mjs
node skills/picture2ppt/scripts/validate-fidelity-ledger.mjs \
  skills/picture2ppt/assets/fidelity-ledger.example.json
```

When it is used on a real PPTX, `verify-ppt-structure.mjs` requires `jszip`. Alternatively, set `PPT_FIDELITY_NODE_MODULES` to a `node_modules` directory that contains `jszip`.

## Known limitations

- Missing fonts, differences between PowerPoint renderers, and image-model variation can affect the final appearance;
- mixed-aspect-ratio references are proportionally contained on one deck canvas and are not reflowed without authorization;
- complex visual reconstruction depends on image-generation or editing capabilities actually exposed by the host;
- pixel-difference metrics are diagnostic evidence, not a substitute for full-size visual review;
- users are responsible for confirming that they have the rights to use and modify source material.

## Contributing and support

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing code or documentation;
- see [SUPPORT.md](SUPPORT.md) for support and issue routing;
- follow [SECURITY.md](SECURITY.md) for vulnerabilities and never disclose them in a public Issue;
- all participants must follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](LICENSE).
