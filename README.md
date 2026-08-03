# picture2ppt

把一张参考图片变成可编辑的 PowerPoint，而不是把图片贴到幻灯片上。

`picture2ppt` 是原 `ppt-fidelity-editor` skill 的新名称和新入口。它面向截图、扫描图、PDF 页面和低可编辑性的旧 PPT，重建出视觉上尽量 1:1、结构上可继续编辑的 `.pptx`：文字是文字，卡片是形状，箭头是连接符，复杂插画拆成可独立选择的原子视觉对象。

## 它解决什么问题？

- **保留版式**：把参考图当作坐标系，保留尺寸、间距、角度、层级和视觉风格。
- **保留可编辑性**：每个有语义的文字、图形、图标、表格、连接符、人物和装饰对象都能单独选中、移动和替换。
- **避免截图陷阱**：最终 PPT 不使用整页截图或包含多个语义区域的复合图片作为底层。
- **支持复杂视觉对象**：对 PowerPoint 难以原生复刻的插画、设备和 3D 元素，使用单一语义的 generated sticker，并保持文字和其他可命名部件独立。
- **可验证交付**：通过 fidelity ledger、结构检查、重新导入检查、渲染对比、overlay 和像素差异检查，验证“看起来像”和“改得动”两件事。

## 快速使用

在 Codex 中使用 `$picture2ppt`，例如：

```text
Use $picture2ppt to reconstruct this reference image as a 1:1 high-fidelity PowerPoint.
Keep every visible semantic element independently editable and preserve the reference coordinate system.
```

推荐把原图和期望输出一起提供；skill 会先盘点视觉元素，再选择原生形状、文字、连接符、原子 sticker 或纯背景处理，最后进行结构和视觉 QA。

## 工作流

1. **Inspect**：读取参考图、尺寸、版式和可用的视觉能力。
2. **Ledger**：为每个视觉元素建立唯一 ID、边界框、表示方式、语义和 z-order 记录。
3. **Author**：使用 `@oai/artifact-tool` 生成对象优先的 PPTX；不要用整页截图替代对象。
4. **Refine**：必要时使用 imagegen 重绘复杂单体或清理独立图片资产；不能把生成图当成多语义复合对象。
5. **Validate**：重新导入 PPTX，检查对象名称、类型、坐标、图片、备注和层级，并做渲染/并排/overlay/像素差异复核。

## 示例图库

[`examples/README.md`](examples/README.md) 展示了四个成功重建的页面：OSI 七层模型、多级页表、进程与资源边界、线程共享与私有内容。

其中多级页表和线程示例各保留了一组对比图：

| 原始渲染 | imagegen 清理后 |
| --- | --- |
| 保留右下角公众号广告字样的原图 | 移除指定广告字样、其余内容尽量保持不变的版本 |

这样可以直观看到 picture2ppt 的完整用处：先把图片重建成可编辑 PPT，再对独立视觉资产做有边界的后处理，而不是直接破坏整页版式。

## 仓库结构

| 路径 | 用途 |
| --- | --- |
| [`SKILL.md`](SKILL.md) | picture2ppt 的完整工作契约和重建规则 |
| [`agents/openai.yaml`](agents/openai.yaml) | Codex 中显示名称、简介和默认调用提示 |
| [`references/`](references/) | fidelity、视觉决策、图片路由和 QA 参考 |
| [`scripts/`](scripts/) | ledger、视觉 QA 和 PPT 结构验证器 |
| [`examples/`](examples/) | 成功重建与原图/清理图对比图库 |

## 验证器

三个验证器都只负责结构化护栏，不能替代真实渲染审阅：

```text
node scripts/validate-fidelity-ledger.mjs <ledger.json>
node scripts/validate-visual-qa.mjs <visual-qa-report.json>
node scripts/verify-ppt-structure.mjs <deck.pptx> <expectations.json> <report-directory>
```

完整检查清单见 [`references/qa-checklist.md`](references/qa-checklist.md)；表示方式决策见 [`references/fidelity-decisions.md`](references/fidelity-decisions.md)。

## 设计原则

> 每个可见的语义元素都必须是一个独立、可选择的 PowerPoint 对象。

视觉保真度和语义可编辑性是同时成立的约束。任何“看起来很像但只有一张大图”的结果，都不符合 picture2ppt 的交付标准。

