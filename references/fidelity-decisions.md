# Fidelity Decisions

## Contents

1. Atomic decomposition
2. Reference coordinates and mixed aspect ratios
3. Representation selection
4. Complex icon gate
5. Charts and dashboards
6. Connectors
7. Backgrounds and source assets
8. Editability reporting

## Atomic Decomposition

Classify nothing until the reference has been decomposed into semantic units.

A final object is atomic only when:

- it has one semantic role;
- it contains no separately selectable text, icon, chart, connector, or illustration;
- selecting it as one object matches how a user would reasonably edit it.

Split any region containing several labels, icons, chart panels, layers, devices, or connectors. Page halves and composite diagram regions are never atomic.

Before accepting a sticker, write a `visibleSubcomponents` list. A valid sticker has exactly one entry. Generation, transparency, lack of text, and a single broad semantic label do not make a layered scene atomic.

Never classify an entire layered platform, dashboard, factory scene, architecture stack, or security cage as one singleton. Split independently nameable shields, rings, layers, consoles, devices, people, and decorative objects that the user could reasonably select.

## Reference Coordinates and Mixed Aspect Ratios

Record the source width, height, aspect ratio, and content frame before authoring.

- When all references share one ratio, use that exact ratio.
- When a single deck contains mixed ratios, choose one deck canvas and proportionally contain each mismatched reference in a recorded frame.
- Preserve every element's normalized reference coordinates inside that frame.
- Fill unused gutters only with semantic-free background continuation or intentional neutral space.
- Do not widen, stretch, crop, or reflow a reference to fill the canvas unless the user explicitly asked for a redesign or reflow.

“Adapt to 16:9,” “use the empty space,” and “make the layout cleaner” are redesign decisions, not fidelity decisions.

## Representation Selection

Choose in this order:

1. `native` when PowerPoint can reproduce the element faithfully;
2. `sticker` when one complex visual singleton needs richer rendering;
3. `background` only when content is non-semantic atmosphere.

Fidelity does not justify fusing semantic elements together.

### Native

Use for:

- every visible text string;
- simple geometry, cards, borders, dividers, and shadows;
- ordinary lines, brackets, and arrows;
- tables and charts when their audience-visible structure can be matched.

### Sticker

Use for one newly redrawn or generated singleton:

- polished icon;
- 3D object;
- realistic hardware;
- complex pictogram;
- text-free gauge artwork;
- luminous or layered arrow.

Keep it independent, tightly cropped, high-resolution, and text-free. One sticker cannot contain an icon family, several chart panels, a whole process, or half a slide.

### Background

Use only for:

- solid color;
- gradient;
- texture;
- glow;
- broad shadow field;
- non-semantic atmosphere.

Never retain text, icons, charts, connectors, people, devices, or diagrams in the background.

## Complex Icon Gate

Classify `icon`, `pictogram`, `device`, `character`, `illustration`, and `3d-illustration`.

Use `simple + native-shapes` only when all are true:

- flat, single-color or two-color construction;
- no perspective, material, gloss, gradient, glow, or layered shadow;
- minimal internal detail;
- no person, device, brand-specific form, or realistic object;
- a few PowerPoint objects reproduce the reference without visible simplification.

Use `complex + generated-image` when any simple condition fails. Require:

```text
representation=sticker
assetOrigin=generated
constructionMethod=generated-image
containsText=false
```

Never substitute Emoji, Unicode glyphs, Wingdings/Webdings, clipart, generic mismatched icons, or primitive-shape approximations. Permit native Emoji only when the supplied reference itself is Emoji.

## Charts and Dashboards

Decompose a dashboard into cards, headings, chart panels, legends, callouts, and icons.

Rebuild data-bearing charts natively when axes, scales, gridlines, markers, series, labels, and values can be matched. When a decorative chart visual cannot be reproduced natively, use one newly generated text-free chart visual per panel and place all wording and values as native text.

Do not keep an entire dashboard as one image.

## Connectors

Use native PowerPoint for ordinary straight or simple curved connectors. Measure endpoints, bends, control points, tangents, and arrowhead placement independently.

Generate one independent sticker for a complex luminous, perspective, ribbon, or layered arrow. Do not combine several arrows or their endpoint nodes into the same sticker.

Remove old line pixels before adding any replacement and verify curvature, dash behavior, endpoint attachment, and arrowhead direction from a render. A generic dashed line is not an acceptable substitute for a curved or multi-bend reference path.

## Backgrounds and Source Assets

Build a semantic-free background from color, gradients, texture, glow, and shadow fields.

Original raster content may remain only when it is an independently supplied:

- photo;
- logo;
- protected brand asset.

It must be isolated and contain no neighboring page content. A screenshot crop is never a source asset.

## Editability Reporting

Report:

- native text and shape count;
- independent generated sticker count;
- retained photo, logo, or protected brand asset count;
- structure QA result and visual QA result separately;
- mixed-ratio content frames;
- any element blocked by missing capabilities.

Do not describe a screenshot or composite crop as editable because it can be resized.
