# 给编码代理的说明

本文件只约束仓库里的自动化和改动边界。画面还原是否忠实，仍然要人看。

## 命令

在仓库根目录使用 Node.js 22：

```bash
npm install
npm test
npm run typecheck
npm run validate
```

- `npm test` 跑 `tools/` 里的行为测试，包括仓库结构校验，以及 `validate-fidelity-ledger`、`validate-visual-qa`、`verify-ppt-structure` 的通过和典型失败。
- `npm run typecheck` 用 `tsc --checkJs` 检查 `tools/` 和 Skill `scripts/` 里的 `.mjs`。
- `npm run validate` 检查当前检出：仓库结构、示例 fidelity ledger、脚本语法，然后做类型检查。
- `jszip` 由 `package.json` 安装。只有把 Skill 目录单独拷走、旁边没有这份 `node_modules` 时，才需要把 `PPT_FIDELITY_NODE_MODULES` 指到含有 `jszip` 的目录。

CI 只跑 `npm ci`、`npm test` 和 `npm run validate`。不要在工作流或 `package.json` 脚本里写死 `skills/<name>/`。

## 目录

- `skills/<name>/` 是可安装 Skill。当前目录是 `skills/picture2ppt`。校验器通过 `SKILL.md` 发现它，目录名必须和 frontmatter 的 `name` 一致。
- 不要把 `README`、`AGENTS.md`、`package.json`、许可证或 CI 放进 Skill 包。
- `tools/` 放仓库校验和脚本测试。通过用例直接读 Skill 包里的 `assets/*.example.json`；失败用例是这些 JSON 的变体。`examples/` 是渲染图库，不是测试夹具目录。
- 视觉 QA 示例引用的比较图不在仓库里。`npm run validate` 因此只跑 fidelity ledger 示例；视觉 QA 的通过路径由测试临时补上比较图。

## 需要人工看的改动

下面这些没有自动的保真评估，改完要人对照参考图复核，不要只看测试变绿：

- [`skills/picture2ppt/SKILL.md`](skills/picture2ppt/SKILL.md) 的工作流、自主权、表示方式和还原规则；
- [`skills/picture2ppt/references/`](skills/picture2ppt/references/) 里的保真、QA、出图路由和失败模式；
- [`examples/`](examples/README.md) 的渲染图，以及 README 里对它们的描述。

校验脚本、CI、`package.json` 和命令说明可以由 `npm test` 与 `npm run validate` 覆盖。改校验器时不要顺手改还原规则。

不要引入付费服务、密钥、令牌或客户演示文稿。

---

# Notes for coding agents

Automated checks cover the repository and the bundled validators. They do not score visual fidelity.

## Commands

From the repository root, on Node.js 22:

```bash
npm install
npm test
npm run typecheck
npm run validate
```

- `npm test` runs the behavior tests in `tools/`: repository structure, plus pass and typical failure cases for `validate-fidelity-ledger`, `validate-visual-qa`, and `verify-ppt-structure`.
- `npm run typecheck` runs `tsc --checkJs` on the `.mjs` files in `tools/` and the Skill `scripts/`.
- `npm run validate` checks this checkout: repository structure, the example fidelity ledger, script syntax, then types.
- `jszip` comes from `package.json`. Set `PPT_FIDELITY_NODE_MODULES` only when a copied Skill directory is no longer next to this install.

CI runs `npm ci`, `npm test`, and `npm run validate`. Do not hardcode `skills/<name>/` in the workflow or in `package.json` scripts.

## Layout

- `skills/<name>/` is the installable Skill. It is currently [`skills/picture2ppt`](skills/picture2ppt/SKILL.md). Validators discover it from `SKILL.md`. The directory name must match the frontmatter `name`.
- Do not put a README, `AGENTS.md`, `package.json`, the license, or CI inside the Skill package.
- `tools/` holds repository checks and script tests. Pass cases read `assets/*.example.json` from the Skill package; failure cases mutate those JSON files. [`examples/`](examples/README.md) is a render gallery, not a fixture directory.
- The visual QA example points at comparison images that are not in the repository. `npm run validate` therefore runs the fidelity ledger example only. The visual QA pass path is covered by tests that create temporary comparison files.

## Changes that need a person

There is no automated fidelity score. Review these against the reference images; a green test run is not enough:

- workflow, autonomy, representation, and reconstruction rules in [`SKILL.md`](skills/picture2ppt/SKILL.md);
- fidelity, QA, image routing, and failure patterns in [`references/`](skills/picture2ppt/references/);
- rendered images under [`examples/`](examples/README.md) and the README claims about them.

Validator, CI, `package.json`, and command-doc changes are covered by `npm test` and `npm run validate`. Do not change reconstruction rules while editing a validator.

Do not add paid services, secrets, tokens, or customer decks.
