# Failure Patterns

## Contents

1. Composite source reuse
2. Generated-composite laundering
3. False editability
4. Unrequested reflow
5. Crude simplification
6. Emoji and primitive icon substitution
7. Unnecessary confirmation
8. Duplicate layers and masks
9. Asset and connector errors
10. Dimension and screenshot artifacts
11. Unreviewed comparison
12. False-positive QA

## Composite Source Reuse

**Symptom:** a page half, dashboard, layered diagram, or complex illustration is one large image.

**Cause:** fidelity was used to justify avoiding semantic decomposition.

**Correction:** inventory the fused labels, icons, cards, charts, connectors, and illustrations; rebuild text and simple geometry natively; redraw or generate each difficult singleton separately.

## Generated-Composite Laundering

**Symptom:** a source crop was not reused, but a newly generated text-free image still contains a cage, shield, cloud, rings, layers, console, and other independently nameable parts.

**Cause:** “generated” and “text-free” were mistaken for “atomic.”

**Correction:** list visible subcomponents before generation. If the list has more than one entry, generate or rebuild each part separately and assemble them in PowerPoint.

## False Editability

**Symptom:** a screenshot is described as editable because it can be moved, resized, or cropped.

**Cause:** object-level editing was confused with semantic editing.

**Correction:** require one independently selectable object per semantic role.

## Unrequested Reflow

**Symptom:** a 3:2 reference is widened or rearranged to fill a 16:9 deck, or whitespace is used as permission to redesign the composition.

**Cause:** canvas adaptation was confused with fidelity.

**Correction:** proportionally contain the reference in a recorded content frame, preserve internal coordinates, and use semantic-free gutters or background extension.

## Crude Simplification

**Symptom:** a dashboard, gauge, staircase, 3D platform, or icon has the right concept but much less detail.

**Cause:** native shapes were chosen without checking fidelity.

**Correction:** keep text native, then redraw or generate each complex visual singleton with matched perspective, material, light, and shadow.

## Emoji and Primitive Icon Substitution

**Symptom:** a detailed robot, security shield, device, person, or isometric pictogram becomes an Emoji, symbol-font glyph, clipart asset, or a few circles and rectangles.

**Cause:** construction convenience was mistaken for editability.

**Correction:** classify the icon as complex and invoke the available image provider. Generate one transparent, text-free singleton matching the reference icon family.

## Unnecessary Confirmation

**Symptom:** the workflow presents several production routes and asks whether to use its own recommended route after the reference and output request are already clear.

**Cause:** ordinary implementation judgment was treated as a scope decision.

**Correction:** treat skill invocation as advance authorization, choose the highest-fidelity route, continue working, and reserve questions for genuine blockers.

## Duplicate Layers and Masks

**Symptoms:**

- two lines or arrowheads;
- dark or blurred duplicate edges;
- visible pale rectangles behind replaced text.

**Cause:** source pixels remain under new objects, or a local near-color mask was used.

**Correction:** remove the source element completely, rebuild the full card or coherent region, then add the replacement.

## Asset and Connector Errors

**Symptoms:**

- inconsistent icon perspective, gloss, saturation, or edge quality;
- arrow points backward;
- normalized angles lose reference variation;
- connectors cross labels or icon faces.

**Correction:** generate the entire icon family under one style contract; measure every connector independently; render to verify endpoints and z-order.

Do not replace a curved or multi-bend route with a generic dashed line. Record intermediate points and control geometry, then compare the final path against the reference.

## Dimension and Screenshot Artifacts

**Symptoms:**

- vertical or horizontal drift accumulates across the slide;
- the slide appears slightly stretched;
- cursor, highlight, selection handle, browser frame, or watermark remains.

**Cause:** slide aspect ratio differs from the source, or the source screenshot was reused without artifact inspection.

**Correction:** use the exact source ratio and dimensions; scan every reference and generated asset; remove artifacts before assembly.

## Unreviewed Comparison

**Symptom:** overlay and difference files exist, yet visible double edges, shifted anchors, style mismatch, or wrong connector geometry remain.

**Cause:** comparison generation was treated as the completion step instead of a revise-and-repeat gate.

**Correction:** inspect overlays after the last edit, record critical anchors and connector points, revise every visible critical mismatch, and regenerate the comparison.

## False-Positive QA

**Symptom:** file creation and object counts pass while the deck still looks wrong or remains fused.

**Cause:** structure checks were mistaken for visual and editability checks.

**Correction:** inspect object granularity, hide foreground objects to audit the background, and compare full-size renders with overlays or pixel differences.

## Forbidden Rationalizations

| Rationalization | Required response |
|---|---|
| “The complex region is already visually exact, so keep it as one image.” | Exact appearance does not make a composite image semantically editable. Split it. |
| “The user can resize the screenshot, so it is editable.” | Resizing is object editing, not element editing. |
| “Splitting the left half is too time-consuming.” | Time does not change the deliverable contract. Continue decomposition. |
| “No image tool is available, so source cropping is safest.” | Redraw natively or report the capability blocker. Never copy the composite crop. |
| “The background is nearly the same color.” | Near-color masks still expose seams. Rebuild a coherent region. |
| “The shape count passed.” | Counts do not prove atomicity, fidelity, or editability. |
| “The asset was newly generated and contains no text.” | Generation does not make several visible subcomponents atomic. Split them. |
| “The 3:2 page looks better widened to 16:9.” | Cleaner reflow is a redesign. Preserve the reference frame. |
| “The overlay was generated, so visual QA is complete.” | A comparison artifact is evidence only after it is reviewed and all critical mismatches are revised. |
| “The dashed connector communicates the same idea.” | Semantic similarity does not preserve route geometry, curvature, or arrow direction. |
| “Only decorative foliage was simplified.” | Named complex decorative objects are part of the visible fidelity target. Match their visual family. |
| “Emoji is editable and communicates the same concept.” | Semantic similarity is not visual fidelity. Generate the reference-quality icon. |
| “A few shapes are cleaner than calling an image model.” | Convenience does not satisfy a complex icon reference. Use the provider. |
| “The recommended route still needs user confirmation.” | A clear reference and requested deliverable already authorize ordinary production decisions. |

## Red Flags

Stop immediately when:

- one image contains several labels, icons, charts, or connectors;
- visible text exists inside an image;
- a semantic element is classified as background;
- `source-crop`, screenshot, slide crop, or composite region appears in the final ledger;
- a cursor or screenshot artifact is visible;
- exact source dimensions were not recorded;
- no original-versus-render comparison was performed.
- a generated sticker has several visible subcomponents;
- a mixed-ratio slide was widened, cropped, or reflowed;
- an overlay exists but still shows critical double edges or drift;
- complex connector geometry was reduced to a generic line;
- structure QA passes while visual QA is false;
- a complex icon is represented by Emoji, a symbol font, clipart, a generic icon, or primitive geometry;
- the workflow pauses only to ask whether to follow its recommended route.
