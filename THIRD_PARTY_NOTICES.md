# 第三方来源

本项目不是 doocs、Markdown Nice 或 Social Formatter 的官方产品。

## 复用的主题

`src/vendor/doocs-default.css` 来自 [doocs/md](https://github.com/doocs/md)，原始路径为 `packages/shared/src/configs/theme-css/default.css`，取材提交为 `516efead5c5a8a2a49991629533b9a8877924a43`，许可为 WTFPL v2。原许可全文随附于 `src/vendor/DOOCS-LICENSE.txt`，版权声明为 `Copyright (C) 2025 Doocs <admin@doocs.org>`。

本项目在 Shadow DOM 中使用原始主题，并以附加规则实现微信、掘金、头条号的排版。原 CSS 保留不变。

## 参考的设计

「Nice」主题参考 [Markdown Nice](https://github.com/mdnice/markdown-nice) 的清爽阅读与主题排版理念。相关 CSS 在 `src/renderer.js` 中独立编写，未直接复制该项目的源代码或主题文件。

富文本转换工作流参考 [Obsidian Social Formatter](https://github.com/spark-ai-boy/obsidian-social-formatter)，未复制其实现代码。

## 开发与运行依赖

| 依赖 | 许可 | 来源 |
| --- | --- | --- |
| CodeMirror / @codemirror 系列 | MIT | https://github.com/codemirror/dev |
| Marked | MIT | https://github.com/markedjs/marked |
| DOMPurify | Apache-2.0 OR MPL-2.0 | https://github.com/cure53/DOMPurify |
| highlight.js | BSD-3-Clause | https://github.com/highlightjs/highlight.js |
| Lucide 图标 | ISC | https://github.com/lucide-icons/lucide |
| Vite | MIT | https://github.com/vitejs/vite |
| vite-plugin-singlefile | MIT | https://github.com/richardtallent/vite-plugin-singlefile |
| Playwright | Apache-2.0 | https://github.com/microsoft/playwright |

各依赖原始许可包含在安装后的对应 npm 包中。运行时代码内的许可注释由构建工具保留。
