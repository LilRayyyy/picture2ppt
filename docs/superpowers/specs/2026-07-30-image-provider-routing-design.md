# Image Provider Routing Design

## Goal

Make `ppt-fidelity-editor` reliably discover and invoke image-generation capabilities across Codex, Gemini, Claude, Kimi, and other agent hosts while keeping Codex as the best-supported path.

The change must prevent agents from inventing unavailable tool names, silently skipping image generation, or replacing complex visuals with low-fidelity substitutes.

## Scope

Modify only:

- `SKILL.md`
- `references/image-provider-routing.md`

Do not change the fidelity contract, semantic decomposition rules, reference-coordinate rules, connector handling, QA gates, validation scripts, example assets, or agent metadata.

## Approach

Use capability-first routing with host-specific examples.

Provider brands are guidance, not proof that a callable image capability exists. The agent must inspect the host's exposed skills, tools, plugins, MCP servers, or connectors; use the host's capability-discovery mechanism when available; read the selected tool's current instructions; and verify the features required for the current task.

The required capability checks are:

1. image generation;
2. image editing;
3. reference-image input;
4. transparent output or removable matte output;
5. accessible output files suitable for presentation assembly.

## Routing Rules

### Codex

Prefer the available `imagegen` skill and its actual image-generation tool. If the tool is not already loaded, use Codex's available tool-discovery mechanism. Supply reference images through the mechanism required by the tool, and use image editing when modifying an existing asset.

Do not replace a callable image workflow with a prompt for the user to run manually.

### Gemini

Use the image capability actually exposed by the host, such as an available Nano Banana integration or the host's current recommended image tool. Do not assume a stable tool name or assume that mentioning Nano Banana enables it.

### Claude

Do not assume that the language model itself can generate images. Invoke image generation only after discovering a callable plugin, MCP server, connector, or external tool that exposes the required capability.

### Kimi

Use only the native tool, plugin, MCP server, or other image capability actually exposed by the current Kimi client. Do not invent a provider-specific command or tool name.

### Other Hosts

Apply the same capability checks and generation contract without guessing provider names.

## Dispatch State Machine

Use this sequence for every complex visual singleton:

1. Discover available image capabilities.
2. Read the selected capability's current instructions.
3. Verify required input and output features.
4. Invoke the capability with one atomic, text-free visual request.
5. Confirm that a real, accessible output asset was produced.
6. Inspect atomicity, text absence, perspective, palette, lighting, edges, and background handling.
7. Accept the asset or retry according to the tool's instructions.

If no suitable capability is immediately available:

1. search for an installable or connectable capability when the host supports discovery;
2. request only the permission, connection, paid action, or source attachment that is actually required;
3. report a capability blocker if the requirement still cannot be satisfied.

Never fall back to Emoji, symbol fonts, clipart, a screenshot crop, a composite source region, or crude primitive geometry for a complex visual.

## Failure Handling

Distinguish these failure classes:

- no tool discovered;
- tool exists but is not connected or authorized;
- tool cannot accept the required reference image;
- invocation failed;
- invocation produced no accessible file;
- output contains text or multiple semantic elements;
- output does not match the reference visual family.

Each class must produce a concrete next action. A claimed successful call without an inspectable output asset is a failure.

## Validation

After implementation:

1. run the Skill structure validator;
2. verify Markdown references;
3. confirm the diff changes only the two in-scope files;
4. review the routing logic against five scenarios: Codex with `imagegen`, Gemini with an available image integration, Claude with an MCP image tool, Kimi without an image tool, and a generic host whose tool lacks reference-image support;
5. confirm that the existing generation contract and no-provider hard gate remain intact.

