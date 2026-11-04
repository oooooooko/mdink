export const themes = [
  { id:'classic', name:'经典', description:'doocs 经典排版' },
  { id:'minimal', name:'简约', description:'留白与阅读感' },
  { id:'editorial', name:'杂志', description:'层次分明的表达' },
  { id:'nice', name:'Nice', description:'清爽的阅读排版' },
  { id:'paper', name:'纸间', description:'暖纸 · 书卷', color:'#9a7045' },
  { id:'night', name:'夜航', description:'深色 · 科技', color:'#70c9d6' },
  { id:'bloom', name:'花信', description:'柔和 · 轻盈', color:'#ba6581' },
]

// Original compositions: broad reading moods, without copying third-party theme CSS.
export const extraThemeCSS = `
.article.paper { background:#fffcf5; color:#51473b; }
.article.paper h1,.article.paper h2 { display:block; background:none; color:#51473b; border:0; padding:0; text-align:left; font-family:Georgia,"Songti SC",SimSun,serif; }
.article.paper h1 { font-size:1.65em; margin:16px 0 30px; }
.article.paper h2 { font-size:1.3em; border-bottom:1px dashed #cab99e; padding-bottom:12px; margin:34px 0 18px; }
.article.paper h3 { border:0; padding:0; color:var(--md-primary-color); }
.article.paper p { color:#51473b; margin:1.2em 0; letter-spacing:.045em; }
.article.paper blockquote { background:#f6f0e3; border-left:3px solid var(--md-primary-color); border-radius:0 12px 12px 0; padding:18px; }
.article.paper blockquote p { margin:0; }
.article.paper strong,.article.paper a { color:var(--md-primary-color); }
.article.paper th { background:#f3ecdc; }
.article.paper hr { border:0; border-top:1px dashed #cab99e; transform:none; }
.article.night { background:#17232e; color:#dbe5ed; --foreground:207 32% 89%; }
.article.night h1,.article.night h2 { display:block; background:none; color:#f0f6fa; border:0; text-align:left; }
.article.night h1 { padding:0; margin:16px 0 30px; font-size:1.6em; }
.article.night h2 { padding:10px 14px; margin:30px 0 18px; font-size:1.25em; background:#223747; border-left:3px solid var(--md-primary-color); border-radius:0 8px 8px 0; }
.article.night h3 { color:var(--md-primary-color); border:0; padding:0; }
.article.night p,.article.night li { color:#dbe5ed; }
.article.night p { margin:1.1em 0; letter-spacing:.02em; }
.article.night blockquote { border:1px solid #3b5264; border-left:3px solid var(--md-primary-color); background:#1c2e3c; padding:18px; }
.article.night blockquote p { color:#b2c7d6; margin:0; }
.article.night strong,.article.night a { color:var(--md-primary-color); }
.article.night :not(pre)>code { color:#f7ce8d; background:#293c4b; }
.article.night th { color:#edf5fa; background:#293e4f; }
.article.night td { color:#dbe5ed; }
.article.night td,.article.night th { border-color:#405768; }
.article.night hr,.article.night .references { border-color:#405768; }
.article.night figcaption,.article.night .references p { color:#a2b6c6; }
.article.bloom { color:#4f4148; background:#fffdfd; }
.article.bloom h1,.article.bloom h2 { display:block; border:0; text-align:left; color:#4f4148; }
.article.bloom h1 { background:none; padding:0; font-size:1.55em; margin:16px 0 28px; }
.article.bloom h2 { background:#f9edf1; color:var(--md-primary-color); padding:11px 16px; border-radius:16px 16px 16px 3px; margin:30px 0 18px; font-size:1.22em; }
.article.bloom h3 { color:var(--md-primary-color); border:0; padding:0; }
.article.bloom p { color:#4f4148; margin:1.15em 0; letter-spacing:.03em; }
.article.bloom blockquote { border:0; border-left:3px solid var(--md-primary-color); background:#fbf4f6; border-radius:0 14px 14px 0; padding:18px; }
.article.bloom blockquote p { color:#806b75; margin:0; }
.article.bloom strong,.article.bloom a { color:var(--md-primary-color); }
.article.bloom th { background:#f9edf1; }
.article.bloom hr { border:0; border-top:1px solid #e8d4dd; transform:none; }
`

export const styleTargets = [
  ['全文', '.article', '字体、字号、行高、背景、内边距'],
  ['段落', '.article p', '字色、字距、缩进、段间距、对齐'],
  ['标题', '.article h1, .article h2, .article h3', '字号、字重、装饰线、背景、圆角'],
  ['引用', '.article blockquote', '背景、边框、留白、文字颜色'],
  ['强调与链接', '.article strong, .article a', '颜色、字重、下划线'],
  ['列表', '.article ul, .article ol, .article li', '项目符号、缩进、项目间距'],
  ['行内代码', '.article :not(pre) > code', '颜色、背景、圆角、内边距'],
  ['代码块', '.article pre, .article .codehead', '代码字体、背景、边距、行距'],
  ['表格', '.article table, .article th, .article td', '边框、表头背景、单元格间距'],
  ['图片与图注', '.article img, .article figcaption', '最大宽度、圆角、图注字色与对齐'],
  ['分隔线', '.article hr', '粗细、线型、颜色、上下间距'],
]
