# Public Release Readiness Design

## Goal

Prepare `LilRayyyy/ppt-fidelity-editor` for a future public launch as a trustworthy, installable, and contribution-ready GitHub open-source project.

The repository must remain private during this work. Changing repository visibility is outside scope.

## Confirmed Decisions

- License: MIT.
- Copyright: `Copyright (c) 2026 LilRayyyy`.
- Primary documentation language: Simplified Chinese.
- Secondary documentation language: English.
- Public project structure: separate repository-level documentation and automation from the installable Skill package.
- Release automation, tags, packaged archives, and automatic publishing are deferred.

## Repository Architecture

Use this target structure:

```text
ppt-fidelity-editor/
├── README.md
├── README.en.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── SUPPORT.md
├── .github/
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── config.yml
│   └── workflows/
│       └── validate.yml
├── docs/
│   └── PUBLIC_RELEASE_CHECKLIST.md
├── tools/
│   └── validate-repository.mjs
└── skills/
    └── ppt-fidelity-editor/
        ├── SKILL.md
        ├── agents/
        ├── assets/
        ├── references/
        └── scripts/
```

Move the current root-level `SKILL.md`, `agents/`, `assets/`, `references/`, and `scripts/` into `skills/ppt-fidelity-editor/` without changing their internal contents or relative relationships.

Remove `docs/superpowers/` from the final public-facing tree. These planning artifacts remain recoverable from Git history but are not product documentation.

## README Design

### Chinese README

Use `README.md` as the canonical project landing page. Include:

1. language switch to `README.en.md`;
2. concise project description;
3. the joint contract of visual fidelity and semantic editability;
4. intended inputs and outputs;
5. differentiators and non-goals;
6. Codex prerequisites and image-generation capability notes;
7. manual installation from the `skills/ppt-fidelity-editor/` package;
8. a minimal invocation example;
9. workflow summary covering inventory, reconstruction, structure QA, and visual QA;
10. repository structure;
11. local validation commands;
12. known limitations;
13. contribution, support, security, and license links.

Use only truthful badges backed by repository files: MIT license and the validation workflow. Do not add star counts, download counts, benchmark claims, screenshots, or unsupported compatibility claims.

### English README

Use `README.en.md` as a complete English counterpart rather than a short summary. Keep its section order, commands, limitations, and links semantically aligned with the Chinese README.

Chinese remains the source language when the two documents need coordinated edits.

## Installation Contract

Document a manual Codex installation path that works after the repository becomes public:

1. clone the repository;
2. copy `skills/ppt-fidelity-editor/` to the user's Codex skills directory as `ppt-fidelity-editor`;
3. restart or reload Codex when required by the host;
4. invoke `$ppt-fidelity-editor` with a reference file and requested PowerPoint output.

Do not claim one-click marketplace or Skill installer support unless a verified mechanism exists.

State that complex reference visuals require an image-generation capability such as Codex `imagegen`; the Skill reports a blocker instead of using a low-fidelity substitute when that capability is unavailable.

## Community Files

### Contribution Guide

`CONTRIBUTING.md` must cover:

- supported change types;
- repository and Skill package boundaries;
- setup with Node.js;
- validation commands;
- Skill-writing constraints;
- pull request scope and review expectations;
- requirement to update both READMEs when public behavior changes.

Use Chinese first with a concise English section in the same file.

### Code of Conduct

`CODE_OF_CONDUCT.md` must contain an original, concise bilingual conduct policy covering respectful participation, unacceptable behavior, enforcement, and reporting. Do not copy a third-party code of conduct without its required attribution.

### Security Policy

`SECURITY.md` must:

- prohibit disclosure of vulnerabilities in public Issues;
- direct reporters to GitHub private vulnerability reporting when available;
- provide a safe fallback through the maintainer's GitHub profile without asking for exploit details in public;
- describe supported versions as the latest commit on `main` until tagged releases exist.

### Support Policy

`SUPPORT.md` must distinguish:

- reproducible bugs;
- feature requests;
- usage questions;
- security reports.

Do not promise Discussions availability before the maintainer enables it. Route usage questions to Issues until Discussions is enabled.

## GitHub Templates

Create:

- `bug_report.yml` for environment, Codex version, input type, expected behavior, actual behavior, reproduction steps, logs, and confidentiality confirmation;
- `feature_request.yml` for use case, proposed behavior, alternatives, and fidelity/editability impact;
- `config.yml` with blank Issues disabled and links only to repository-local support and security guidance;
- `PULL_REQUEST_TEMPLATE.md` for scope, motivation, validation, compatibility, documentation, and checklist items;
- `CODEOWNERS` assigning the repository to `@LilRayyyy`.

Do not reference labels that may not exist yet.

## Repository Validator

Create dependency-free `tools/validate-repository.mjs`.

It must:

1. verify all required public-readiness files exist;
2. verify the canonical Skill package exists at `skills/ppt-fidelity-editor/`;
3. parse `SKILL.md` frontmatter and require `name: ppt-fidelity-editor` plus a non-empty description;
4. reject project-level files such as README, LICENSE, CONTRIBUTING, and CODE_OF_CONDUCT inside the Skill package;
5. verify relative Markdown links in `README.md`, `README.en.md`, and the Skill package;
6. reject unfinished-work markers and identity placeholders such as `your-name` or `example@example.com` in public-facing documentation, while allowing documented command metavariables;
7. print a concise PASS summary or actionable errors;
8. exit nonzero on any failure.

Keep it self-contained and compatible with the Node.js standard library.

## Continuous Integration

Create `.github/workflows/validate.yml` for pushes and pull requests targeting `main`, plus manual dispatch.

Use GitHub-hosted Ubuntu and Node.js 22. Run:

1. `node tools/validate-repository.mjs`;
2. syntax checks for the three Skill scripts;
3. `validate-fidelity-ledger.mjs` against the included example ledger.

Do not install project dependencies because the repository validator and ledger test are dependency-free. The OOXML verifier's optional `jszip` runtime requirement must be documented but is not installed solely for CI syntax checking.

## Public Release Checklist

Create `docs/PUBLIC_RELEASE_CHECKLIST.md` with manual gates:

- review repository history and Actions logs for secrets or private information;
- set repository description and topics;
- verify Issues and Actions are enabled;
- optionally enable Discussions before linking it as a support channel;
- enable private vulnerability reporting;
- review secret scanning, push protection, Dependabot alerts, and code scanning availability;
- add a social preview image only when a real project visual exists;
- review GitHub Community Profile after the repository becomes public;
- verify README rendering and links on GitHub;
- confirm the latest `main` validation workflow passes;
- change visibility to Public only after every required gate is complete.

The checklist must explicitly state that this implementation does not change visibility.

## Validation

Before completion:

1. run the repository validator;
2. run the three script syntax checks;
3. run the example fidelity-ledger validation;
4. run the Codex Skill validator against `skills/ppt-fidelity-editor/`;
5. inspect all Markdown links;
6. confirm the install command targets the canonical package;
7. confirm `git status` is clean after commits;
8. confirm repository visibility was not changed.

## Out of Scope

- changing the repository to Public;
- publishing a GitHub Release;
- automatic semantic versioning;
- package registries or marketplaces;
- a project website;
- fabricated demos, screenshots, metrics, testimonials, or compatibility claims;
- changes to the Skill's fidelity, editability, provider-routing, or QA behavior.
