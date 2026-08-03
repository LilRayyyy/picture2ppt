# 公开发布清单

此清单仅用于人工审核，不会自动修改仓库可见性。只有全部必需项目完成后，维护者才应手动把仓库设为 Public。

## 代码与历史

- [ ] 检查完整 Git 历史，不包含密钥、令牌、私密链接、个人信息或受保护素材。
- [ ] 检查已有 GitHub Actions 日志与产物，确认其中没有即将公开的敏感信息。
- [ ] 确认 `main` 是希望公开的默认分支。
- [ ] 确认 `skills/picture2ppt/` 是唯一规范安装包。

## 项目展示

- [ ] 设置准确的仓库描述。
- [ ] 添加与项目实际能力一致的 Topics，例如 `codex`、`powerpoint`、`pptx`、`presentation`、`skill`。
- [ ] 在 GitHub 上检查中文 README 的渲染、目录、徽章和所有链接。
- [ ] 检查英文 README 与中文 README 的功能、命令和限制保持一致。
- [ ] 只有在存在真实、可授权使用的项目视觉时才添加 Social preview。

## 协作功能

- [ ] 确认 Issues 已启用。
- [ ] 确认 GitHub Actions 已启用。
- [ ] 检查 Bug Report、Feature Request 和 Pull Request 模板。
- [ ] 如果准备维护社区问答，再启用 Discussions；启用前不要把它写成正式支持入口。
- [ ] 确认 `CODEOWNERS` 中的维护者拥有写入权限。

## 安全

- [ ] 启用 GitHub private vulnerability reporting。
- [ ] 检查 Secret scanning 是否可用并启用。
- [ ] 检查 Push protection 是否可用并启用。
- [ ] 检查 Dependabot alerts 是否可用并启用。
- [ ] 检查 Code scanning 是否适合当前仓库并配置所需规则。
- [ ] 确认 `SECURITY.md` 的报告渠道在公开后可用。

## 验证

- [ ] 最新 `main` 的 Validate 工作流成功。
- [ ] 本地仓库验证器成功。
- [ ] Codex Skill 结构验证成功。
- [ ] 三个 Skill 脚本通过语法检查。
- [ ] fidelity ledger 示例通过验证。
- [ ] 安装命令在一个干净的 Codex 环境中完成试装。

## 公开操作

- [ ] 阅读 GitHub 关于改变仓库可见性的最新说明及影响。
- [ ] 再次确认代码、提交历史、Actions 日志和产物均可公开。
- [ ] 手动将仓库可见性改为 Public。
- [ ] 公开后检查 Community Profile，并修复 GitHub 指出的缺失项。
- [ ] 公开后从未登录浏览器检查 README、许可证、Issue 模板和安全政策。
