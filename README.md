# MDInk · 离线 Markdown 社媒排版

MDInk 是一款轻量的 Markdown 社媒排版工具，支持实时预览、主题自定义和一键复制，让一篇文章轻松适配微信公众号、稀土掘金和头条号。

在线使用：[MDInk](https://oooooooko.github.io/mdink/)

## 直接离线使用

构建产物是 **`dist/index.html` 一个文件**，包含全部 JavaScript、样式、图标和语法高亮。双击即可打开，也可以复制到其他电脑使用；运行时无需 Node.js、网络、账户或后端。

1. 导入或拖入 `.md` / `.markdown` / `.txt` 文件，也可以直接编辑。
2. 含相对路径图片时，选择「文件 → 导入文章文件夹」。文件夹内每篇文章分别建立草稿，PNG / JPEG / GIF / WebP 会内嵌到富文本中。也可以单独导入图片，或使用工具栏插入图片。
3. 选择平台、主题、主题色、字体、字号、行距，查看实时预览。
4. 公众号、头条号点击「复制排版」，粘贴进平台正文编辑器；掘金点击「复制 Markdown」，粘贴进掘金 Markdown 编辑器。

| 平台 | 默认输出 | 处理方式 |
| --- | --- | --- |
| 微信公众号 | 富文本 HTML + 纯文本剪贴板 | 内联 CSS；站外链接可附文末脚注 |
| 稀土掘金 | 原始 Markdown | 去掉 frontmatter；可去掉一级标题；最终样式由平台决定 |
| 头条号 | 富文本 HTML + 纯文本剪贴板 | 内联 CSS；默认 18px 正文和资讯阅读排版 |

还支持导出独立排版 HTML、Markdown，复制 HTML 源码，以及所有草稿的 JSON 备份和恢复（包含图片、正文与样式）。恢复备份会追加草稿，保留现有内容。

内置「经典」「简约」「杂志」「Nice」「纸间」「夜航」「花信」「紫藤」「智序」九种主题，可在右侧「排版设置 → 文章主题」中切换。「纸间」采用暖纸与书卷风格，「夜航」采用深色科技风格，「花信」采用柔和的配色与圆角层次；三款主题均独立设计与编写 CSS，没有复制 mdnice 的主题代码或素材。

「紫藤」根据用户提供的 CSS 模板适配，保留紫色标题、浅黄色引用、图片圆角与阴影、浅色代码块，默认使用 Optima 优先字体、14px 字号和 1.25 倍行距。原模板中的 `#nice`、标题 `.content`、引用 `.multiquote-1` 和脚注选择器已映射到 MDInk 的文章结构，仍可通过排版设置和 CSS 编辑器修改。

「智序」是独立设计的 AI 科技主题，采用白底蓝青配色、分层标题、信息卡片式引用、深蓝代码区和深色表头，适合 AI 项目介绍、工具评测和技术教程。默认使用 16px 无衬线正文与 1.8 倍行距，支持主题色与 CSS 自定义。

### 自定义文章样式

点击主题列表下方的「编辑 CSS 样式」，即可查看当前主题的 CSS 源代码，直接修改并实时预览。也可以从任一内置主题重新开始。点击左侧的可修改项，会在源码末尾添加对应的覆盖规则，方便调整，不必重写整个主题。

| 可修改内容 | 对应选择器 | 常用属性 |
| --- | --- | --- |
| 全文 | `.article` | 字体、字号、行高、背景、内边距 |
| 段落 | `.article p` | 字色、字距、缩进、段间距、对齐 |
| 标题 | `.article h1`、`.article h2`、`.article h3` | 字号、字重、装饰线、背景、圆角 |
| 引用 | `.article blockquote` | 背景、边框、留白、文字颜色 |
| 强调与链接 | `.article strong`、`.article a` | 颜色、字重、下划线 |
| 列表 | `.article ul`、`.article ol`、`.article li` | 项目符号、缩进、项目间距 |
| 行内代码 | `.article :not(pre) > code` | 颜色、背景、圆角、内边距 |
| 代码块 | `.article pre`、`.article .codehead` | 代码字体、背景、边距、行距 |
| 表格 | `.article table`、`.article th`、`.article td` | 边框、表头背景、单元格间距 |
| 图片与图注 | `.article img`、`.article figcaption` | 最大宽度、圆角、图注字色与对齐 |
| 分隔线 | `.article hr` | 粗细、线型、颜色、上下间距 |

例如，在源码末尾添加：

```css
.article {
  --md-primary-color: #8263b5;
}
.article p {
  text-indent: 2em;
  margin: 1.2em 0;
}
.article h2 {
  color: var(--md-primary-color);
  border-bottom: 2px solid var(--md-primary-color);
}
```

- 「保存样式」会将 CSS 和当前文章一起保存在本机，并出现可随时切换的「自定义」主题；不会修改其他草稿或内置主题。切换到内置主题不会删除已保存的 CSS。
- 支持 `Ctrl / ⌘ + F` 查找、`Ctrl / ⌘ + S` 保存，也可以点击「导出 CSS」保存 `.css` 源文件。草稿 JSON 备份与恢复包含自定义 CSS。
- 可使用 `--md-primary-color`（主题色）、`--md-font-size`（字号）、`--article-leading`（行高）、`--article-font`（字体）变量；不自行覆盖变量时，仍可通过排版设置调整。
- 样式仅作用于文章预览，选择器需以 `.article` 开头；不加载 CSS 外部资源，不支持 `@import`、外部字体、转义选择器和嵌套选择器。语法错误会提示并阻止保存，预览保留上一次有效结果。
- 微信和头条号的复制、HTML 导出会包含内联样式；掘金 Markdown 不携带 CSS。伪元素、动画和复杂定位效果不能完整带到平台编辑器。

### 数据与兼容性

- 正文、图片和排版在浏览器本机处理，不调用云端 API，无统计脚本。远程图片默认不加载；启用「允许联网加载远程图片」后，浏览器会请求原图片 URL。
- 草稿自动存入当前浏览器的 IndexedDB。浏览器隐私设置、清理网站数据、更换域名或移动离线文件可能使原草稿无法读取，建议定期备份。禁止本地存储时仍可编辑、复制和导出，但无法保证草稿持久保存。
- 支持标准 Markdown / GFM：标题、引用、代码高亮、任务列表、表格、链接、图片及图注；读取简单 frontmatter 的 `title`，不输出元数据。暂不解析 Obsidian 双链、嵌入语法、公式或 Mermaid 图表。
- 平台可能过滤 CSS、外链和 Base64 图片。这里生成可粘贴的文章内容，不自动发布或上传图片；请在实际平台预览后发布，图片丢失时重新上传。
- 导出 / 复制 Markdown 会保留原有图片路径，便于继续编辑；发布到掘金时请上传本地图片并替换路径。导出 HTML 会内嵌已导入的本地图片。
- 单篇 Markdown 上限 2 MB，单图上限 8 MB，单次文件导入总计上限 60 MB。支持文章相对路径与 `../`，同名图片无法唯一匹配时显示待导入提示。
- 推荐现代 Chrome / Edge。剪贴板会优先使用标准 API，受限制时尝试传统复制；仍失败可导出 HTML，在浏览器打开后选择正文复制。

## 本地开发与构建

需要 Node.js 22.22 或更新版本。

```bash
git clone https://github.com/oooooooko/mdink.git
cd mdink
npm ci
npm run dev
```

开发地址：`http://127.0.0.1:5173/`。生产构建与预览：

```bash
npm run build
npm run preview
```

输出目录为 `dist`，首页为 `dist/index.html`。源码中的依赖仅在开发 / 构建阶段安装，离线使用只需要最终 HTML。

## GitHub Pages 部署

项目通过 [GitHub Actions](https://github.com/oooooooko/mdink/actions/workflows/deploy.yml) 自动构建并发布到 GitHub Pages。

访问地址：[https://oooooooko.github.io/mdink/](https://oooooooko.github.io/mdink/)

推送代码到 `main` 分支后，工作流会安装依赖、运行测试、构建并部署 `dist` 目录。也可以在 Actions 的「Deploy to GitHub Pages」工作流中点击「Run workflow」手动发布。

仓库的 **Settings → Pages → Build and deployment → Source** 使用 **GitHub Actions**。工作流配置位于 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)，无需配置额外密钥。构建使用相对资源路径，兼容 `/mdink/` 项目路径，同时保留单文件离线使用能力。

部署到新域名后，草稿是独立的；从离线版导出备份，再在在线版恢复即可迁移。

## 验证

```bash
npm test
npm run build
npm run test:browser
```

浏览器检查会断网打开 `dist/index.html`，覆盖三平台切换、Markdown 语义、恶意内容过滤、默认不请求远程图片、富文本剪贴板数据、内联样式、文件夹与图片导入、导出、备份恢复、本地持久化及手机布局。结果保存在 `test-results/`。macOS 使用已安装的 Google Chrome；其他平台首次运行前执行 `npx playwright install chromium`。

`vite-plugin-singlefile` 当前对包含单引号的 CSP 存在误报，构建时可能提示内联脚本被阻止；页面的 `script-src` 已允许内联脚本，离线浏览器检查会验证实际加载结果。

## 致谢

感谢以下开源项目，为 MDInk 的界面设计、文章排版和多平台转换提供了参考与灵感：

- [doocs/md](https://github.com/doocs/md)：参考编辑器布局，复用经典排版主题。
- [Markdown Nice](https://github.com/mdnice/markdown-nice)：为「Nice」主题的清爽排版与阅读体验提供灵感；主题样式独立编写。
- [Obsidian Social Formatter](https://github.com/spark-ai-boy/obsidian-social-formatter)：参考富文本复制、内联 CSS、本地图片和多平台预览工作流。

第三方来源与许可详见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
