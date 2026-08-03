---
name: picture2ppt
description: Reconstruct screenshots, raster images, PDFs, or low-editability PowerPoint slides into high-fidelity, semantically editable PPTX decks. Use when every visible text, shape, connector, chart, icon, illustration, and device must remain independently selectable while the reference composition, coordinates, and visual style are preserved.
---

# picture2ppt

`picture2ppt` converts a picture-first reference into an object-first PowerPoint. Treat the reference as a coordinate system and semantic inventory, not as a background image to paste into the deck.

This skill is an orchestration contract: use the host presentation-authoring workflow (`@oai/artifact-tool`) for editable PPTX output and the available image-generation workflow for complex visual singletons. The bundled validators are guardrails; they do not replace re-import, rendering, side-by-side review, overlay review, or pixel-difference review.

## Core Contract

Treat **1:1 visual fidelity** and **full semantic editability** as joint requirements. Never satisfy one by abandoning the other.

> Every visible semantic element must be an independent, selectable PowerPoint object.

Semantic elements include text, icons, cards, shapes, lines, arrows, chart panels, data visuals, devices, people, illustrations, and decorative objects that can be named separately.

Do not place a full-slide image, half-slide image, screenshot region, or multi-semantic crop in the final deck. A pasted screenshot is not editable merely because it can be resized.

Enforce the **single-visual-layer invariant**:

> Every visible element has exactly one final representation and no source pixels remain underneath its replacement.

Enforce the **reference-coordinate invariant**:

> Preserve the reference composition, bounds, spacing, angles, and z-order. A reconstruction is not allowed to become a redesign merely because all objects are editable.

Generation does not make a composite atomic. A text-free generated image containing several separately nameable visual parts is still a forbidden multi-semantic object.

## Autonomy Contract

Treat invocation of this skill with a reference and a requested deliverable as advance authorization to choose and execute the highest-fidelity route.

Use this positive recipe:

1. inspect the reference and available capabilities;
2. choose the best native, generated-sticker, and background treatment per element;
3. execute the reconstruction;
4. render, compare, revise, and deliver.

Do not present multiple production approaches or ask whether to use the recommended one. State important choices as concise progress updates while continuing.

Ask the user only when:

- required source material is missing;
- an external permission, paid action, publication, or other high-impact action needs authorization;
- unresolved ambiguity would materially change the requested deliverable;
- no available capability can satisfy a required element and the scope must change.

Do not pause for ordinary choices about native shapes versus generated stickers, image-provider routing, icon treatment, connector treatment, or background reconstruction.

## Required Companion Workflow

Use the host's presentation-authoring skill or toolchain. On Codex, use the available presentations skill and its required JavaScript/Artifact Tool workflow. Author in an ES module with `@oai/artifact-tool`; do not use `python-pptx` or the legacy Python artifact API.

Use stable Artifact Tool object names that match the ledger `id` values. After export, re-import the PPTX and inspect object names, types, bounds, images, notes, and z-order. Object counts alone are not sufficient evidence of semantic editability.

Read [references/fidelity-decisions.md](references/fidelity-decisions.md) before choosing representations. Read [references/image-provider-routing.md](references/image-provider-routing.md) whenever difficult visual elements need redrawing or generation.

## Representation Contract

| Representation | Allowed content |
|---|---|
| `native` | Text, simple shapes, cards, lines, arrows, tables, and charts that PowerPoint can reproduce faithfully |
| `sticker` | One newly redrawn or generated complex visual singleton without embedded text or separately nameable subcomponents |
| `background` | Non-semantic color, gradient, texture, glow, shadow field, or atmosphere only |

Original raster content is allowed only for an independently supplied photo, logo, or protected brand asset. Isolate it as its own object. Do not use a screenshot crop containing page layout or neighboring elements.

## Complex Icon Gate

Classify every icon, pictogram, device, character, illustration, and 3D illustration before rebuilding it.

Use native shapes only when the icon is flat, simple, has minimal internal detail, lacks perspective/material/gloss/complex shadow, and can match the reference exactly with a few PowerPoint objects.

Classify the icon as complex when it has any of:

- 3D or isometric perspective;
- gradient, glow, gloss, texture, material, or layered shadow;
- multicolor depth or detailed internal structure;
- a person, robot, device, building, scene, or realistic object;
- brand-specific form;
- visible detail that becomes simpler in a native reconstruction.

When an image provider is available, generate every complex icon directly as an independent, text-free sticker. Do not approximate it with Emoji, Unicode symbols, Wingdings/Webdings, clipart, a generic icon library, or a few primitive shapes.

Allow Emoji only when the reference itself is literally Emoji and preserving it is part of the requested fidelity.

## Workflow

### 1. Establish an Exact Reference

1. Preserve all source files.
2. Render every source slide at full resolution.
3. Record the source dimensions, aspect ratio, and the reference content frame for every slide.
4. When all references share one ratio, match that ratio exactly.
5. When references have mixed ratios in one PowerPoint deck, choose one deck canvas and place each mismatched reference proportionally with `contain`, preserving its internal coordinates. Use side gutters or semantic-free background extension. Do not widen, crop, stretch, or reflow it unless the user explicitly requested reflow.
6. Scan the reference for mouse cursors, highlights, selection handles, browser chrome, watermarks, and screenshot artifacts.
7. Keep the source only as a reference, never as a composite final layer.

### 2. Inventory Every Semantic Element

Build a fidelity ledger before authoring. Create one record for every visible semantic element and every non-semantic background layer.

For each candidate object, ask:

1. Can two visible parts be named separately?
2. Does it contain more than one text block, icon, chart, connector, or illustration?
3. Would a user reasonably expect to select one part without selecting the others?

If any answer is yes, split it again.

For every proposed sticker, list its visible subcomponents in plain language. If more than one can be named, the sticker is not atomic. Split a layered platform, dashboard, factory scene, architecture stack, or security cage into its independently editable shield, rings, layers, console, devices, characters, and other meaningful parts before generation.

Record:

- stable id, slide, type, bounds or connector points;
- one `semanticRole`;
- `semantic`, `atomic`, `editable`, and `containsText`;
- `representation` and `assetOrigin`;
- `visualComplexity` and `constructionMethod`;
- icon substitution flags when the element is icon-like;
- background-removal action;
- visual risks and QA notes.

Start from [assets/fidelity-ledger.example.json](assets/fidelity-ledger.example.json), then run:

```text
node scripts/validate-fidelity-ledger.mjs <ledger.json>
```

Do not author the slide until the ledger passes.

### 3. Rebuild by Element Type

1. Rebuild every visible text string as native text.
2. Rebuild simple containers, dividers, lines, arrows, and faithful chart components natively.
3. Decompose complex regions into the smallest reasonable visual singletons.
4. Apply the complex-icon gate and call the available image provider for every complex icon-like singleton.
5. Redraw or generate each other complex singleton separately as a text-free sticker.
6. Create a semantic-free background.
7. Assemble objects in reference coordinates and reference z-order.

Do not copy the source crop as a shortcut. Do not keep a complex integrated diagram as one image. Do not use editable primitive geometry as a low-detail substitute for reference foliage, dashboards, control panels, 3D architecture, or other complex illustration.

### 4. Remove Old Pixels Before Replacement

If editing an existing flattened deck:

1. Remove the old element pixels from the underlying image.
2. Inspect the cleaned region at full size.
3. Rebuild an entire card or larger coherent region when a local mask would expose a seam.
4. Add the new object only after the old representation is gone.

Never cover source text or lines with a near-color rectangle.

### 5. Use Stable Layer Order

Use this default z-order:

1. non-semantic background;
2. connectors and paths;
3. cards and nodes;
4. independent generated stickers;
5. native text;
6. intentional foreground highlights.

Create connectors before their endpoint nodes so paths remain behind labels and icons.

### 6. Handle Connectors Individually

For each line or arrow:

1. Record every endpoint, bend, control point, tangent, and arrowhead endpoint from the reference.
2. Match curvature, angle, dash phase, width, cap, join, color, opacity, glow, and z-order.
3. Use a native connector only when its complete geometry and visual style can be matched.
4. Generate a complex luminous, perspective, ribbon, layered, or otherwise non-native arrow as its own sticker.
5. Never leave the source line visible under a replacement.
6. Verify arrowhead direction and endpoint attachment from the final render.

Replacing a multi-bend or curved reference path with a generic straight or dashed line is a fidelity failure even when the replacement is editable.

### 7. Generate Difficult Visuals

Use a provider-neutral image task. Route OpenAI/Codex to `imagegen`, Gemini to an available Nano Banana capability, or use an equivalent provider.

Generate one visual singleton per asset. Require:

- reference-matched perspective, palette, material, lighting, and edge quality;
- no text;
- transparent background when reliable;
- high resolution at presentation size;
- no cursor, watermark, border, or neighboring slide content.

Inspect every generated asset before use.

If no image capability is available, redraw only genuinely simple icons natively. If a complex icon cannot be reconstructed faithfully, report the blocker. Do not silently fall back to Emoji, symbol fonts, clipart, primitive approximations, a source screenshot, or a composite crop.

### 8. Verify Editability and Appearance

Read [references/qa-checklist.md](references/qa-checklist.md) before delivery.

Always:

1. re-import the final PPTX;
2. inspect object types, names, bounds, and z-order;
3. verify all visible text is native;
4. hide foreground objects and confirm the background contains no semantic content;
5. scan for large or multi-semantic image objects;
6. render every slide at full size after the last change;
7. compare the final render with the original using side-by-side review, overlay, and pixel difference;
8. inspect critical anchors such as titles, hero visuals, panels, cards, and connector endpoints for bounds, style, and z-order;
9. treat pixel metrics as diagnostic evidence, not as a substitute for visual review;
10. revise whenever an overlay shows visible double edges, positional drift, simplified silhouettes, wrong connector geometry, text collision, style-family mismatch, or incorrect layering;
11. fix dimensions, clipping, wrapping, seams, drift, doubled elements, and screenshot artifacts;
12. preserve earlier versions and export a new filename.

Run the OOXML structure check:

```text
node scripts/verify-ppt-structure.mjs <deck.pptx> <expectations.json> <report-directory>
```

Structural checks never replace visual and editability inspection.

Create a visual QA report from [assets/visual-qa-report.example.json](assets/visual-qa-report.example.json), then run:

```text
node scripts/validate-visual-qa.mjs <visual-qa-report.json>
```

Do not deliver until both the structure report and visual QA report pass. Generating an overlay without reviewing and acting on it does not satisfy QA.

When producing comparison reports in code, compute the reference/final dimensions, overlay, pixel difference, and diagnostic metrics from the rendered files. Treat report booleans such as `styleMatch`, `sourcePixelsRemoved`, and `visualQaPassed` as claims that must be backed by the reviewed artifacts, not as a substitute for the review.

## Hard Gates

Stop and revise if any condition is true:

- a full-slide, half-slide, screenshot, or composite source crop remains;
- a sticker contains multiple separately nameable semantic elements;
- a generated sticker lists more than one visible subcomponent;
- visible text is embedded in a sticker or background;
- a semantic element is fused into the background;
- a difficult region was retained because it was already visually exact;
- a screenshot is called editable because it can be moved or resized;
- a source crop was used because splitting was slow;
- a source crop was used because no image provider was available;
- a complex icon was approximated with Emoji, Unicode, symbol fonts, clipart, generic icons, or primitive shapes;
- an available image provider was not used for a complex icon;
- the workflow paused only to ask whether to use its recommended production route;
- a reference was stretched, widened, cropped, or reflowed to fill a different deck ratio without an explicit user request;
- a mixed-ratio reference was not proportionally contained in a recorded content frame;
- cursor, highlight, browser chrome, selection handle, or watermark remains;
- source and replacement are both visible;
- only object counts or file generation were tested;
- the final deck was not rendered and compared with the original.
- overlay or difference images were generated but not reviewed after the last edit;
- a critical anchor still shows visible drift, style mismatch, wrong z-order, or double edges;
- a curved or multi-bend connector was simplified into a generic line;
- unresolved critical visual differences remain;
- structure QA passes while visual QA fails.

## Example: OSI Seven-Layer Diagram

Do not preserve the left half as one image.

1. Rebuild every English and protocol label as native text.
2. Rebuild simple layer slabs, borders, and connectors natively when faithful.
3. Generate each complex layer/device illustration separately when native shapes lose fidelity.
4. Keep each generated illustration text-free and independently selectable.
5. Use only ambient color or gradient as the background.
6. Confirm that hiding the foreground leaves no layer diagram, label, device, or connector behind.

## Resources

- Read [references/fidelity-decisions.md](references/fidelity-decisions.md) for atomic decomposition and representation selection.
- Read [references/image-provider-routing.md](references/image-provider-routing.md) for cross-provider visual generation.
- Read [references/failure-patterns.md](references/failure-patterns.md) when diagnosing an incorrect reconstruction.
- Read [references/visual-fidelity-gates.md](references/visual-fidelity-gates.md) before comparison and delivery.
- Read [references/qa-checklist.md](references/qa-checklist.md) before final delivery.
- Use [scripts/validate-fidelity-ledger.mjs](scripts/validate-fidelity-ledger.mjs) before authoring.
- Use [scripts/validate-visual-qa.mjs](scripts/validate-visual-qa.mjs) after the final render.
- Use [scripts/verify-ppt-structure.mjs](scripts/verify-ppt-structure.mjs) for portable OOXML checks.

## Successful reconstructions

See [examples/README.md](examples/README.md) for rendered examples of editable reconstructions built with this workflow.
