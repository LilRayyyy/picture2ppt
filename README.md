# PPT Fidelity Editor

[English](README.en.md) | 简体中文

[![Validate](https://github.com/LilRayyyy/ppt-fidelity-editor/actions/workflows/validate.yml/badge.svg)](https://github.com/LilRayyyy/ppt-fidelity-editor/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

面向 Codex 的 PowerPoint 高保真重建与编辑 Skill：在尽量保持参考稿视觉效果的同时，把每个可命名的语义元素重建为可独立选择和编辑的 PowerPoint 对象。

## 为什么需要它

常见的“图片转 PPT”流程会把整页截图、半页区域或复合图表直接贴进幻灯片。页面看起来相似，但文字、图标、卡片、连接线和图表无法分别编辑。

PPT Fidelity Editor 将视觉保真与语义可编辑性视为共同要求：

> 每个可见语义元素都必须拥有唯一的最终表示，并且能够被独立选择。

## 核心原则

- **双重目标**：视觉保真与语义可编辑性缺一不可。
- **原子拆分**：文字、图标、卡片、图表、人物、设备和连接线按可命名元素拆分。
- **参考坐标**：保留原稿的构图、边界、间距、角度、层级和宽高比。
- **单一视觉层**：替换旧元素前先移除旧像素，避免重影和重复图层。
- **证据式 QA**：结构检查不能代替最终渲染、叠加图、差异图和人工视觉复核。

## 适用场景

- 从截图或扁平图片重建可编辑幻灯片；
- 从 PDF 页面还原 PowerPoint；
- 修复由整页图片组成的低可编辑性 PPTX；
- 审计已有演示文稿的保真度和对象可编辑性；
- 重建包含复杂图标、连接线、卡片、设备或分层架构图的页面。

支持的参考输入包括截图、扁平图片、PDF 和低可编辑性 PPTX。最终输出由宿主的演示文稿工具链生成。

## 不适用场景

- 仅需要把图片逐页放入 PPTX；
- 希望自动重新设计、改版或重排原稿；
- 无权使用或修改来源素材；
- 在缺少合适图片生成能力时，仍要求用 Emoji、截图裁剪或粗糙几何图形替代复杂视觉元素。

本项目不会把截图裁剪、Emoji、符号字体或通用剪贴画伪装成高保真重建。

## 前置条件

- 支持 Skills 的 Codex 环境；
- 可创建和渲染 PowerPoint 的演示文稿工具链；
- Node.js 22（运行仓库校验和附带脚本时使用）；
- 对于复杂图标、人物、设备、3D 或材质化视觉元素，可调用的图片生成或编辑能力，例如 Codex `imagegen`。

如果复杂元素需要图片生成能力而当前宿主未提供，Skill 会明确报告阻塞，不会静默降级为低保真替代物。

## 安装

仓库公开后，可手动安装：

```bash
git clone https://github.com/LilRayyyy/ppt-fidelity-editor.git
mkdir -p ~/.codex/skills
cp -R ppt-fidelity-editor/skills/ppt-fidelity-editor ~/.codex/skills/ppt-fidelity-editor
```

根据当前 Codex 宿主的要求重新启动或重新加载 Skills。安装包的入口文件是 [`skills/ppt-fidelity-editor/SKILL.md`](skills/ppt-fidelity-editor/SKILL.md)。

## 快速开始

在 Codex 中附加参考 PDF、图片或 PPTX，然后调用：

```text
$ppt-fidelity-editor 将这个 PDF 重建为高保真、完全可编辑的 PowerPoint，并在交付前完成结构与视觉 QA。
```

Skill 会自行选择原生 PowerPoint 对象、原子化生成素材和无语义背景；只有缺少源文件、必要权限或关键能力时才会暂停。

## 工作流程

1. **建立参考**：记录每页尺寸、宽高比和内容框。
2. **建立 fidelity ledger**：为每个语义元素和背景层记录边界、表示方式、来源和 QA 风险。
3. **逐元素重建**：文字与简单几何使用原生对象，复杂视觉元素拆分后独立生成。
4. **清理旧像素**：确保源像素与替换对象不会同时存在。
5. **结构验证**：检查对象类型、名称、数量、边界和层级。
6. **视觉验证**：最终渲染后进行并排、叠加和差异比较，并修正关键偏差。

## 质量门槛

交付前必须满足：

- 可见文字均为原生文本；
- 每个复杂贴图只包含一个可独立命名的视觉元素；
- 背景不包含文字、图标、图表、设备或连接线；
- 不存在整页、半页或多语义截图区域；
- 连接线的端点、弯折、样式、方向和层级经过最终渲染检查；
- 结构 QA 与视觉 QA 均通过；
- 最后一次修改之后重新生成并检查比较产物。

完整规则见 [`SKILL.md`](skills/ppt-fidelity-editor/SKILL.md) 和 [`references/`](skills/ppt-fidelity-editor/references/)。

## 项目结构

```text
.
├── README.md / README.en.md
├── LICENSE
├── .github/                         # Issue、PR 与 CI 配置
├── docs/                            # 公开发布清单
├── tools/                           # 仓库级验证工具
└── skills/ppt-fidelity-editor/
    ├── SKILL.md
    ├── agents/
    ├── assets/
    ├── references/
    └── scripts/
```

公开项目文档与可安装 Skill 包分离，避免把贡献规范、README 或 CI 配置加载进 Skill 上下文。

## 本地验证

从仓库根目录运行：

```bash
node --test tools/validate-repository.test.mjs
node tools/validate-repository.mjs
node --check skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs
node --check skills/ppt-fidelity-editor/scripts/validate-visual-qa.mjs
node --check skills/ppt-fidelity-editor/scripts/verify-ppt-structure.mjs
node skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs \
  skills/ppt-fidelity-editor/assets/fidelity-ledger.example.json
```

`verify-ppt-structure.mjs` 在实际检查 PPTX 时需要 `jszip`，也可通过 `PPT_FIDELITY_NODE_MODULES` 指向包含 `jszip` 的 `node_modules`。

## 已知限制

- 字体缺失、PowerPoint 渲染器差异和图片生成模型差异可能影响最终视觉结果；
- 混合宽高比页面会按比例放入统一画布，不会在未经授权时自动重排；
- 复杂视觉重建依赖宿主实际暴露的图片生成或编辑能力；
- 像素差异指标只用于诊断，不能替代全尺寸人工视觉复核；
- 使用者需要自行确认对输入素材拥有合法的使用和修改权限。

## 贡献与支持

- 贡献代码或文档前，请阅读 [贡献指南](CONTRIBUTING.md)；
- 使用问题与问题分类见 [支持说明](SUPPORT.md)；
- 安全问题请遵循 [安全政策](SECURITY.md)，不要在公开 Issue 中披露漏洞；
- 所有参与者均须遵守 [社区行为准则](CODE_OF_CONDUCT.md)。

## 许可证

本项目采用 [MIT License](LICENSE)。
