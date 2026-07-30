# Visual Fidelity Gates

## Purpose

Use this gate after the final editable objects are assembled. Structure QA proves the file is valid; visual QA proves the reconstruction still matches the reference.

## Canvas and Reference Frame

For each slide, record:

- source width and height;
- deck width and height;
- the reference content frame inside the deck;
- `fitMode=exact` when ratios match;
- `fitMode=contain` when a mixed-ratio reference is proportionally placed inside one deck canvas.

Keep the content-frame aspect ratio within 0.2% of the source ratio. Do not use `reflow`, `stretch`, or `crop` unless the user explicitly requested that layout change.

## Critical Anchors

Choose the objects whose mismatch would be immediately visible:

- title and subtitle blocks;
- hero illustration or central diagram;
- major cards, dashboards, and control panels;
- repeated rows or columns that establish rhythm;
- key labels and callouts;
- connector endpoints and junctions.

Record a reference box and final box for each anchor. Check position, size, style family, and z-order. Treat visible double edges in an overlay as a failure even when numeric drift is small.

The bundled validator uses conservative normalized limits:

- critical-anchor center drift: at most 1.2% of the slide diagonal;
- critical-anchor width or height drift: at most 2.5% of the slide dimension;
- connector point drift: at most 1.2% of the slide diagonal.

These are rejection limits, not design targets. Match more closely whenever the reference permits.

## Connector Gate

For every connector, compare corresponding:

- endpoints;
- bends and junctions;
- curve control points or visual tangents;
- arrowhead endpoint and direction;
- dash, width, cap, join, opacity, glow, and layer order.

Reject a straight or generic dashed substitute for a visibly curved, routed, ribbon, luminous, or multi-bend reference path.

## Review Loop

After the last edit:

1. render at full size;
2. inspect side by side;
3. inspect a 50% overlay;
4. inspect a pixel difference image;
5. record critical-anchor and connector results;
6. revise every critical mismatch;
7. regenerate all comparison artifacts;
8. validate the visual QA report.

Pixel MAE, SSIM, or other global scores are diagnostic only. Large white backgrounds can hide serious local errors, while newly generated but faithful textures can inflate a global difference. Never use one global score as the sole pass condition.

## Delivery Verdict

Deliver only when:

- the final render was produced after the last change;
- all comparison artifacts exist and were reviewed at full size;
- all critical anchors pass position, style, and z-order checks;
- all connector routes and arrowhead directions pass;
- no unresolved critical difference remains;
- structure QA and visual QA both pass.
