# Image Provider Routing

## Contents

1. Capability detection
2. Provider routes
3. Generation contract
4. Output handling
5. No-provider behavior

## Capability Detection

Before image work:

1. inspect the host's available tools and skills;
2. determine whether generation, editing, reference-image input, and transparent output are supported;
3. read the selected provider's instructions;
4. do not assume that naming a provider enables it.

When the complex-icon gate returns `complex`, invoke the available provider directly. Do not ask the user whether to use it.

## Provider Routes

### OpenAI or Codex

When `imagegen` is available:

1. activate or read its instructions;
2. generate every complex icon-like singleton instead of approximating it natively;
3. generate one complex visual singleton per call or clearly isolated batch;
4. use editing only to remove a named artifact or create a semantic-free background;
5. inspect and save each accepted asset inside the project.

### Gemini

When a Nano Banana capability is available:

1. use the host-recommended current image model;
2. generate every complex icon-like singleton instead of approximating it natively;
3. use reference-guided generation for each visual singleton;
4. use editing for precise artifact removal or semantic-free background cleanup;
5. inspect and save each accepted asset.

The skill cannot create or enable a Nano Banana tool by instruction alone.

### Other Hosts

Use an equivalent image-generation or editing capability with the same atomicity and QA contract.

## Generation Contract

Use:

```text
Use case: PowerPoint visual singleton reconstruction
Subject: <one independently nameable element>
Reference: match the supplied element's perspective, proportions, material, palette, lighting, shadows, and edge quality
Composition: isolated subject only; exclude neighboring labels, icons, connectors, cards, and slide layout
Atomicity: include exactly one independently nameable visible subcomponent; if the requested subject contains multiple named parts, split the request before generation
Text: none
Background: transparent when reliable, otherwise a removable flat matte
Avoid: redesign, watermark, cursor, browser chrome, screenshot border, extra objects, invented labels
Output: high-resolution raster suitable for independent placement and editing as one PowerPoint object
```

For an icon family, add:

```text
Family consistency: match perspective, stroke behavior, material, palette, lighting direction, shadow softness, saturation, and edge quality across every icon
Forbidden substitutes: Emoji, Unicode glyph, symbol font, clipart, flat generic icon, crude primitive geometry
```

For semantic-free background cleanup:

```text
Use case: precise background reconstruction
Primary change: remove all named semantic objects
Preserve: dimensions, color field, gradient, texture, glow, and broad shadows
Remove: text, icons, charts, connectors, devices, people, diagrams, cursor, highlight, selection handles, browser chrome, and watermark
Avoid: new objects, new text, layout redesign, color shift
```

## Output Handling

- Reject assets containing text or neighboring semantic elements.
- Reject generated assets containing several separately nameable visible subcomponents even when they are text-free.
- Reject assets with inconsistent perspective, style, lighting, or edge treatment.
- Preserve generated originals and use versioned filenames.
- Validate transparency or matte edges at presentation size.
- Never crop the reference screenshot and label it as generated.

## No-Provider Behavior

If no image capability is available:

1. reconstruct only simple icons with native PowerPoint objects;
2. report a blocker when a complex icon cannot be generated;
3. request access to a suitable image provider when completion requires it.

Do not use Emoji, symbol fonts, clipart, primitive approximations, a composite source region, or a low-fidelity placeholder.
