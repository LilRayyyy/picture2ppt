# Image Provider Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `ppt-fidelity-editor` reliably discover and invoke real image-generation capabilities across Codex, Gemini, Claude, Kimi, and other hosts without changing its core reconstruction workflow.

**Architecture:** Keep the core Skill concise and provider-neutral, with the detailed discovery, dispatch, host routing, and failure policy in `references/image-provider-routing.md`. Treat an exposed callable capability—not a provider brand—as the routing source of truth, and require an inspectable output asset before considering a generation call successful.

**Tech Stack:** Markdown Skill instructions, Codex Skill validator, Git diff and text assertions.

## Global Constraints

- Modify only `SKILL.md` and `references/image-provider-routing.md` during implementation.
- Keep Codex as the best-supported route through the available `imagegen` skill and actual image-generation tool.
- Do not change the fidelity contract, semantic decomposition rules, reference-coordinate rules, connector handling, QA gates, validation scripts, example assets, or agent metadata.
- Do not assume that a provider name proves a callable image capability exists.
- Never fall back to Emoji, symbol fonts, clipart, a screenshot crop, a composite source region, or crude primitive geometry for a complex visual.

---

### Task 1: Capability-First Provider Routing Reference

**Files:**
- Modify: `references/image-provider-routing.md:3-48`
- Preserve: `references/image-provider-routing.md:50-100`

**Interfaces:**
- Consumes: the existing complex-icon gate and generation contract defined by `SKILL.md`
- Produces: a host-neutral routing protocol referenced by `SKILL.md`, with explicit Codex, Gemini, Claude, Kimi, generic-host, dispatch, and failure branches

- [ ] **Step 1: Record the pre-change routing gaps**

Run:

```bash
rg -n '^### (OpenAI or Codex|Gemini|Claude|Kimi|Other Hosts)$|tool-discovery|accessible output|reference-image|MCP' references/image-provider-routing.md
```

Expected: OpenAI/Codex, Gemini, and Other Hosts are present; Claude, Kimi, tool-discovery, accessible-output verification, and explicit MCP routing are absent.

- [ ] **Step 2: Expand the contents and capability-detection sections**

Update the contents list to include:

1. capability detection;
2. provider routes;
3. dispatch state machine;
4. generation contract;
5. output handling;
6. failure handling;
7. no-provider behavior.

Require the agent to inspect exposed skills, tools, plugins, MCP servers, and connectors; use a host capability-discovery mechanism when available; read the selected tool's instructions; and check generation, editing, reference-image input, transparency or matte output, and accessible output-file support.

State that provider branding is guidance only and that the complex-icon gate authorizes direct invocation only after a callable capability is found.

- [ ] **Step 3: Replace provider-name assumptions with explicit host routes**

Write these provider branches:

- **Codex:** prefer the available `imagegen` skill and its actual tool; use tool discovery if it is not loaded; pass reference images through the tool's required mechanism; use editing for existing assets; do not hand the user a prompt when a callable tool exists.
- **Gemini:** use the image integration actually exposed by the host, including an available Nano Banana integration or current host-recommended tool; do not assume a stable tool name.
- **Claude:** do not assume built-in generation; require a discovered plugin, MCP server, connector, or external image tool.
- **Kimi:** require a native tool, plugin, MCP server, or other image capability exposed by the current client; do not invent a Kimi-specific command.
- **Other Hosts:** apply the same capability checks without guessing tool names.

- [ ] **Step 4: Add the dispatch state machine**

Add this ordered behavior:

1. discover;
2. read the selected instructions;
3. verify inputs and outputs;
4. invoke one atomic, text-free request;
5. confirm a real accessible asset exists;
6. inspect the output;
7. accept or retry according to the tool's instructions.

When no suitable capability is immediately available, require discovery of connectable capabilities, authorization only when needed, and a blocker when the required capability still cannot be provided.

- [ ] **Step 5: Add typed failure handling**

Cover these exact failure classes and give each a next action:

- no tool discovered;
- tool not connected or authorized;
- required reference-image input unsupported;
- invocation failure;
- no accessible output file;
- text or multiple semantic elements in the output;
- visual-family mismatch.

State explicitly that a claimed successful call without an inspectable output asset is a failure.

- [ ] **Step 6: Verify the routing reference**

Run:

```bash
rg -n '^### (Codex|Gemini|Claude|Kimi|Other Hosts)$|skills, tools, plugins, MCP servers, and connectors|reference-image|accessible output|claimed successful' references/image-provider-routing.md
```

Expected: every host heading and every required capability/failure phrase is present.

Run:

```bash
git diff --check -- references/image-provider-routing.md
```

Expected: no output and exit status 0.

- [ ] **Step 7: Commit the routing reference**

```bash
git add references/image-provider-routing.md
git commit -m "docs: add capability-first image provider routing"
```

### Task 2: Connect the Core Skill to Deterministic Routing

**Files:**
- Modify: `SKILL.md:179-193`
- Preserve: all other `SKILL.md` sections

**Interfaces:**
- Consumes: the routing protocol from `references/image-provider-routing.md`
- Produces: concise mandatory behavior in the main Skill that sends difficult visuals through discovery, invocation, output verification, and blocker handling

- [ ] **Step 1: Record the existing main-Skill behavior**

Run:

```bash
sed -n '179,193p' SKILL.md
```

Expected: the section names only OpenAI/Codex, Gemini, and an equivalent provider, without explicit capability discovery or output-file verification.

- [ ] **Step 2: Update the difficult-visual routing paragraph**

Replace the provider-name-only sentence with concise requirements to:

1. read `references/image-provider-routing.md`;
2. discover the host's actual callable image capability;
3. use Codex `imagegen` when available;
4. treat Gemini, Claude, Kimi, and other hosts according to exposed capabilities rather than guessed tool names;
5. invoke the capability directly once found.

Keep the existing one-singleton generation requirements unchanged.

- [ ] **Step 3: Strengthen output and no-provider behavior**

Require confirmation that every image call produced a real, accessible asset that was inspected before use.

Keep the current simple-native fallback and complex-visual blocker. Clarify that missing connection or permission should trigger the specific required authorization step, while a genuinely unavailable or insufficient capability remains a blocker.

- [ ] **Step 4: Run Skill validation**

Run:

```bash
python3 '/Users/lilrayyy/.codex/skills/.system/skill-creator/scripts/quick_validate.py' .
```

Expected: `Skill is valid!`

Run:

```bash
node --check scripts/validate-fidelity-ledger.mjs
node --check scripts/validate-visual-qa.mjs
node --check scripts/verify-ppt-structure.mjs
node scripts/validate-fidelity-ledger.mjs assets/fidelity-ledger.example.json
```

Expected: all syntax checks exit 0 and the ledger validator reports `PASS`.

- [ ] **Step 5: Validate five routing scenarios by textual inspection**

Confirm the combined instructions yield these outcomes:

| Scenario | Required outcome |
|---|---|
| Codex exposes `imagegen` | Read its instructions, invoke it with reference input as supported, inspect the saved asset |
| Gemini exposes a Nano Banana integration | Invoke that actual integration without relying on a hard-coded tool name |
| Claude exposes an MCP image tool | Invoke the MCP tool after reading its instructions |
| Kimi exposes no image tool | Search/connect if supported; otherwise report a complex-visual blocker |
| Generic tool lacks reference-image support | Do not pretend reference-guided generation occurred; find a sufficient capability or report the limitation |

- [ ] **Step 6: Enforce the scope boundary**

Run:

```bash
git diff --name-only HEAD~1
```

Expected before the final commit: only `SKILL.md` and `references/image-provider-routing.md` appear as implementation changes beyond the already committed plan/spec documents.

Run:

```bash
git diff --check
rg -n 'Emoji|symbol fonts|clipart|screenshot crop|composite source' SKILL.md references/image-provider-routing.md
```

Expected: no whitespace errors, and the forbidden-fallback policy remains explicit.

- [ ] **Step 7: Commit the core Skill integration**

```bash
git add SKILL.md
git commit -m "docs: make image generation dispatch deterministic"
```

### Task 3: Final Verification

**Files:**
- Verify: `SKILL.md`
- Verify: `references/image-provider-routing.md`
- Verify: `docs/superpowers/specs/2026-07-30-image-provider-routing-design.md`
- Verify: `docs/superpowers/plans/2026-07-30-image-provider-routing.md`

**Interfaces:**
- Consumes: Tasks 1 and 2
- Produces: a clean, reviewable branch ready to push

- [ ] **Step 1: Compare implementation with the approved specification**

Run:

```bash
git diff origin/main...HEAD -- SKILL.md references/image-provider-routing.md
```

Expected: only capability discovery, host routing, dispatch, output verification, and failure-handling instructions changed.

- [ ] **Step 2: Run the complete validation set**

Run:

```bash
python3 '/Users/lilrayyy/.codex/skills/.system/skill-creator/scripts/quick_validate.py' .
node --check scripts/validate-fidelity-ledger.mjs
node --check scripts/validate-visual-qa.mjs
node --check scripts/verify-ppt-structure.mjs
node scripts/validate-fidelity-ledger.mjs assets/fidelity-ledger.example.json
git diff --check origin/main...HEAD
git status --short --branch
```

Expected: the Skill is valid, scripts parse, the example ledger passes, the diff has no whitespace errors, and the branch has no uncommitted changes.

- [ ] **Step 3: Review commit history**

Run:

```bash
git log --oneline --decorate origin/main..HEAD
```

Expected: separate commits exist for the approved design, implementation plan, routing reference, and core Skill integration.

