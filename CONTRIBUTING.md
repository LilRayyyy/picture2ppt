# 贡献指南

感谢你帮助改进 picture2ppt。请保持改动聚焦、可验证，并尊重项目的视觉保真与语义可编辑契约。

## 开始之前

- 使用 Node.js 22 或更新版本运行仓库检查；
- 阅读 [README.md](README.md) 和 [`SKILL.md`](skills/picture2ppt/SKILL.md)；
- 安全问题不要提交公开 Issue，请遵循 [SECURITY.md](SECURITY.md)；
- 大范围行为变更建议先提交功能请求，说明使用场景和预期影响。

## 仓库边界

- 项目文档、社区政策和 CI 位于仓库根目录及 `.github/`；
- 可安装 Skill 只位于 `skills/picture2ppt/`；
- 不要在 Skill 包内添加 README、许可证、贡献指南或其他项目级文件；
- 不要在无关改动中重构 fidelity、editability、provider routing 或 QA 规则。

## 开发流程

1. 从最新 `main` 创建功能分支；
2. 只修改当前问题所需文件；
3. 用户可见行为变化必须同步更新 `README.md` 和 `README.en.md`；
4. 新增或修改 JavaScript 行为时先写会失败的测试，再实现最小改动；
5. 提交前运行完整验证；
6. 创建 Pull Request，并说明动机、范围、兼容性与验证结果。

## 本地验证

```bash
node --test tools/validate-repository.test.mjs
node tools/validate-repository.mjs
node --check skills/picture2ppt/scripts/validate-fidelity-ledger.mjs
node --check skills/picture2ppt/scripts/validate-visual-qa.mjs
node --check skills/picture2ppt/scripts/verify-ppt-structure.mjs
node skills/picture2ppt/scripts/validate-fidelity-ledger.mjs \
  skills/picture2ppt/assets/fidelity-ledger.example.json
```

如果本机提供 Codex `skill-creator`，还应对 `skills/picture2ppt/` 运行其 Skill 结构校验。

## Skill 修改要求

- 使用命令式、明确且可执行的说明；
- 保持 `SKILL.md` 精简，把详细判断规则放入 `references/`；
- 保持所有相对链接可用；
- 不把整页截图、复合裁剪或嵌入可见文字的图片作为“可编辑”示例；
- 不使用 Emoji、符号字体、剪贴画或粗糙几何图形替代复杂参考视觉；
- 新增脚本必须包含可重复验证方式；
- 不提交真实客户文件、私密演示文稿、密钥、访问令牌或个人信息。

## Pull Request 要求

Pull Request 应：

- 解决一个清晰问题；
- 列出受影响文件；
- 说明对保真度、可编辑性和兼容性的影响；
- 给出实际运行的验证命令及结果；
- 包含必要的中英文文档更新；
- 避免无关格式化和重构。

维护者可能要求缩小范围、补充测试或拆分独立改动。

---

# Contributing

Thank you for improving picture2ppt. Keep each change focused, verifiable, and consistent with the joint visual-fidelity and semantic-editability contract.

- Use Node.js 22 or newer.
- Keep the installable package inside `skills/picture2ppt/`.
- Update both READMEs for user-visible behavior.
- Write a failing test before changing JavaScript behavior.
- Run the validation commands above before opening a Pull Request.
- Do not commit confidential decks, source material, secrets, tokens, or personal data.
- Do not use screenshots, composite crops, embedded visible text, Emoji, symbol fonts, clipart, or crude geometry as high-fidelity substitutes.
- Report vulnerabilities through [SECURITY.md](SECURITY.md), never through a public Issue.
