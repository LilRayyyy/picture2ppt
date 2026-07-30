# Image Provider Routing

## Contents

1. Capability detection
2. Provider routes
3. Dispatch state machine
4. Generation contract
5. Output handling
6. Failure handling
7. No-provider behavior

## Capability Detection

Before image work:

1. inspect the host's exposed skills, tools, plugins, MCP servers, and connectors;
2. use the host's capability-discovery mechanism when available before concluding that no image capability exists;
3. identify a callable capability and read its current instructions;
4. determine whether it supports generation, editing, reference-image input, transparent or removable-matte output, and an accessible output file;
5. supply reference images through the exact input mechanism required by the selected capability;
6. do not assume that naming a model, provider, or product enables a callable tool.

Provider branding is routing guidance, not evidence of capability. When the complex-icon gate returns `complex`, invoke the discovered capability directly. Do not ask the user whether to use it.

## Provider Routes

### Codex

Prefer the available `imagegen` skill and its actual image-generation tool.

1. If `imagegen` is not already callable, use Codex's available tool-discovery mechanism to find it.
2. Read the current `imagegen` instructions before calling the tool.
3. Pass every required reference image using the tool's specified local-path or conversation-image mechanism.
4. Use generation for a new singleton and image editing for a named change to an existing asset or semantic-free background.
5. Generate one complex visual singleton per call or clearly isolated batch.
6. Save and inspect each accepted asset inside the project.

Do not give the user a prompt to run manually when a suitable image tool is callable.

### Gemini

Use the image capability actually exposed by the current host, such as an available Nano Banana integration or the host's current recommended image tool.

1. Discover the callable integration instead of assuming a stable tool name.
2. Read its current instructions and verify reference-image input support.
3. Generate every complex icon-like singleton instead of approximating it natively.
4. Use reference-guided generation for each visual singleton.
5. Use editing for precise artifact removal or semantic-free background cleanup.
6. Inspect and save each accepted asset.

Mentioning Nano Banana cannot create or enable an integration that the host has not exposed.

### Claude

Do not assume that the Claude language model itself can generate images.

1. Discover a callable image plugin, MCP server, connector, or external tool.
2. Read its current instructions and verify the required input and output capabilities.
3. Invoke it only after confirming that the host exposes it to the agent.

### Kimi

Use only an image capability exposed by the current Kimi client.

1. Inspect native tools, plugins, MCP servers, and other callable integrations.
2. Read the selected capability's instructions and verify the required input and output features.
3. Do not invent a Kimi-specific command or tool name.

### Other Hosts

Discover and use an equivalent callable image-generation or editing capability with the same atomicity and QA contract. Do not guess tool names from the host or model brand.

## Dispatch State Machine

For every complex visual singleton:

1. discover the available image capabilities;
2. read the selected capability's current instructions;
3. verify the required reference inputs, editing mode, background handling, and file output;
4. invoke one atomic, text-free visual request;
5. confirm that the call produced a real, accessible output asset;
6. inspect the asset against the atomicity and visual-family requirements;
7. accept it or retry according to the selected tool's instructions.

If no suitable capability is immediately available:

1. search for an installable or connectable capability when the host supports discovery;
2. request the specific connection, permission, paid action, or source attachment only when it is required;
3. report a capability blocker when the required capability remains unavailable or insufficient.

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

## Failure Handling

| Failure | Required next action |
|---|---|
| No tool discovered | Use the host's capability discovery. If no suitable capability can be found, report a blocker. |
| Tool is not connected or authorized | Request the specific connection or authorization required by that tool, then resume after access is available. |
| Required reference-image input is unsupported | Find a capability that accepts the reference input or report that reference-guided fidelity cannot be completed. Do not claim that reference guidance occurred. |
| Invocation failed | Follow the selected tool's troubleshooting or retry instructions. If the failure persists, report the capability blocker. |
| No accessible output file was produced | Treat the call as failed. Retrieve or save the asset through the documented output mechanism, or invoke the tool again. |
| Output contains text or multiple semantic elements | Reject it, split the subject when necessary, and regenerate an atomic text-free singleton. |
| Output does not match the reference visual family | Reject it and refine or regenerate for perspective, proportion, material, palette, lighting, shadow, and edge consistency. |

A claimed successful call without an inspectable output asset is a failure.

## No-Provider Behavior

If no image capability is available:

1. reconstruct only simple icons with native PowerPoint objects;
2. report a blocker when a complex icon cannot be generated;
3. request access to a suitable image provider when completion requires it.

Do not use Emoji, symbol fonts, clipart, primitive approximations, a composite source region, or a low-fidelity placeholder.
