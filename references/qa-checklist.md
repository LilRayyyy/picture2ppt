# Fidelity and Editability QA Checklist

## Reference

- [ ] Original files are preserved.
- [ ] Every slide has a full-resolution reference render.
- [ ] Source dimensions, aspect ratio, and content frame are recorded per slide.
- [ ] Same-ratio references use the exact deck ratio.
- [ ] Mixed-ratio references are proportionally contained without stretch, crop, widening, or unrequested reflow.
- [ ] Every element preserves its normalized reference coordinates inside the recorded content frame.
- [ ] Reference images were scanned for cursor, highlight, selection handles, browser chrome, watermark, and screenshot borders.

## Semantic Inventory

- [ ] Every visible semantic element has one ledger record and one semantic role.
- [ ] Every final object is atomic and independently selectable.
- [ ] No page half, screenshot region, or multi-semantic crop remains.
- [ ] Every visible text string is a native text object.
- [ ] Every sticker contains one visual singleton and no text.
- [ ] Every sticker has a one-entry visible-subcomponents inventory.
- [ ] No layered platform, dashboard, factory scene, architecture stack, or security cage is fused into one generated sticker.
- [ ] Original raster is retained only for an isolated photo, logo, or protected brand asset.

## Background Isolation

- [ ] Background contains only color, gradient, texture, glow, shadow field, or atmosphere.
- [ ] Hiding foreground objects reveals no labels, icons, charts, connectors, people, devices, or diagrams.
- [ ] Old source pixels were removed before replacements.
- [ ] No local near-color mask seam is visible.

## Text, Cards, and Charts

- [ ] Wording matches exactly.
- [ ] Font family, weight, size, alignment, wrapping, and spacing match.
- [ ] Cards match fill, gradient, border, radius, shadow, and padding.
- [ ] Dashboard cards and chart panels are separate objects.
- [ ] Chart axes, scales, gridlines, series, markers, labels, and values match when native.
- [ ] Generated chart visuals are panel-level singletons and keep all wording native.

## Generated Visuals

- [ ] Each complex icon, 3D object, device, person, or decorative singleton is independently selectable.
- [ ] Every complex icon-like element uses a generated sticker when an image provider is available.
- [ ] No complex reference icon is replaced by Emoji, Unicode, Wingdings/Webdings, clipart, a generic icon, or primitive geometry.
- [ ] Native-shape icons are genuinely simple and match the reference without visible loss.
- [ ] Asset family uses consistent perspective, palette, material, lighting, shadow, and edge quality.
- [ ] Stickers are high-resolution, tightly cropped, and text-free.
- [ ] No generated asset contains neighboring slide content, watermark, cursor, or screenshot border.
- [ ] Transparency or matte edges are clean at presentation size.

## Lines and Arrows

- [ ] Every line or arrow is its own editable connector or generated singleton.
- [ ] Endpoints, bends, control points, tangents, and angles were measured independently.
- [ ] Arrowhead direction was verified from a render.
- [ ] Curvature and endpoint attachment match the reference.
- [ ] Width, color, opacity, dash, cap, join, glow, and shadow match.
- [ ] No source line remains under a replacement.
- [ ] Connectors do not cross labels or icon faces.

## Structural Verification

- [ ] Final PPTX re-imports successfully.
- [ ] Expected slide count is correct.
- [ ] Required native objects and sticker names exist.
- [ ] No duplicate visual keys or forbidden composite image objects exist.
- [ ] Large semantic stickers have a verified singleton justification.
- [ ] Speaker notes and provenance are preserved where required.

## Visual and Editability Verification

- [ ] Every final slide was rendered after the last change.
- [ ] Every render was inspected at full size.
- [ ] Original and final renders were compared side-by-side, by overlay, and by pixel difference.
- [ ] Critical anchors were checked for bounds, style, and z-order.
- [ ] Comparison artifacts were reviewed rather than merely generated.
- [ ] Visible double edges, drift, simplified silhouettes, connector mismatch, text collision, and style-family mismatch triggered another revision.
- [ ] No stretch, drift, clipping, overflow, overlap, seam, color shift, or unexpected wrapping remains.
- [ ] Sample objects from every category were selected and moved independently.
- [ ] The deck is not called complete when any semantic content remains fused.
- [ ] The workflow did not pause for confirmation of an ordinary recommended production route.
- [ ] The structure report passes.
- [ ] The visual QA report passes.
- [ ] No unresolved critical visual difference remains.
