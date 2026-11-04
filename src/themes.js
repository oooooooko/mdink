export const themes = [
  { id:'classic', name:'经典', description:'doocs 经典排版' },
  { id:'minimal', name:'简约', description:'留白与阅读感' },
  { id:'editorial', name:'杂志', description:'层次分明的表达' },
  { id:'nice', name:'Nice', description:'清爽的阅读排版' },
  { id:'paper', name:'纸间', description:'暖纸 · 书卷', color:'#9a7045' },
  { id:'night', name:'夜航', description:'深色 · 科技', color:'#70c9d6' },
  { id:'bloom', name:'花信', description:'柔和 · 轻盈', color:'#ba6581' },
  { id:'wisteria', name:'紫藤', description:'紫色 · 暖黄引用', color:'#916dd5', fontSize:14, lineHeight:1.25, font:'optima' },
  { id:'neural', name:'智序', description:'AI · 蓝青科技', color:'#2864ec', fontSize:16, lineHeight:1.8, font:'sans' },
]

// Paper, night, bloom, and neural are original compositions. Wisteria adapts user-provided CSS.
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
/* User-provided #nice selectors mapped to MDInk's semantic article elements. */
.article.wisteria { letter-spacing:2px; background-size:20px 20px; background-position:center; }
.article.wisteria p { margin:10px 0; letter-spacing:2px; font-size:var(--md-font-size); word-spacing:2px; }
.article.wisteria h1 { display:block; padding:0; border:0; background:none; font-size:calc(var(--md-font-size) * 25 / 14); font-weight:bold; color:#773098; text-align:left; }
.article.wisteria h2 { display:table; padding:0; border:0; border-bottom:2px solid #d89cf6; margin:28px auto 16px; background:none; color:#333; font-size:calc(var(--md-font-size) * 8 / 7); font-weight:bold; text-align:center; }
.article.wisteria h3 { display:table; padding-left:10px; border-left:5px solid var(--md-primary-color); margin:20px 10px 10px 0; font-size:calc(var(--md-font-size) * 15 / 14); font-weight:normal; text-align:left; color:#333; }
.article.wisteria h4 { font-size:var(--md-font-size); font-weight:bold; }
.article.wisteria ul,.article.wisteria ol { font-size:calc(var(--md-font-size) * 15 / 14); }
.article.wisteria ul { list-style:circle; }
.article.wisteria li { font-size:var(--md-font-size); font-weight:normal; }
.article.wisteria li p { margin:4px 0; }
.article.wisteria blockquote { border-left:4px solid #ffcb49; background:#fff5db; }
.article.wisteria blockquote p { margin:0; }
.article.wisteria a { color:var(--md-primary-color); font-weight:bolder; border-bottom:1px solid var(--md-primary-color); }
.article.wisteria strong { color:#000; font-weight:bold; }
.article.wisteria em { font-style:normal; color:var(--md-primary-color); }
.article.wisteria em strong,.article.wisteria del { color:var(--md-primary-color); }
.article.wisteria hr { height:1px; padding:0; border:0; border-top:2px solid #d9b8fa; transform:none; }
.article.wisteria img { border-radius:6px; display:block; margin:auto; object-fit:contain; box-shadow:2px 4px 7px #999; }
.article.wisteria figcaption { display:block; font-size:13px; }
.article.wisteria :not(pre)>code { color:rgb(239,112,96); background:#eff1f3; }
.article.wisteria .codebox,.article.wisteria pre,.article.wisteria .codehead { background:#f7f7f7; border-radius:2px; }
.article.wisteria pre code { color:#383a42; }
.article.wisteria .codehead { color:#858b93; }
.article.wisteria .hljs-keyword,.article.wisteria .hljs-selector-tag { color:#a626a4; }
.article.wisteria .hljs-string,.article.wisteria .hljs-attr { color:#397b35; }
.article.wisteria .hljs-number,.article.wisteria .hljs-literal,.article.wisteria .hljs-built_in { color:#986801; }
.article.wisteria .hljs-title { color:#356bc2; }
.article.wisteria .hljs-comment { color:#7e8795; }
.article.wisteria th,.article.wisteria td { font-size:var(--md-font-size); }
.article.wisteria .references,.article.wisteria .references p { font-size:var(--md-font-size); }
.article.wisteria sup { font-weight:normal; color:var(--md-primary-color); }
.article.wisteria .references h3 { font-size:20px; }
.article.wisteria .references p { color:var(--md-primary-color); font-weight:bold; }
.article.wisteria .references em { display:block; font-size:var(--md-font-size); font-weight:normal; }
/* Original light technology style for AI project reports and technical articles. */
.article.neural { color:#3b4b62; background:#fff; letter-spacing:.02em; }
.article.neural h1 { display:block; padding:0 0 18px; margin:14px 0 28px; border:0; border-bottom:3px solid var(--md-primary-color); background:none; color:#152c52; font-size:1.7em; font-weight:800; text-align:left; letter-spacing:.025em; }
.article.neural h2 { display:block; padding:12px 16px; margin:32px 0 18px; border:1px solid #d9e7fb; border-left:4px solid var(--md-primary-color); border-radius:2px 12px 12px 2px; background:#eef5ff; background-image:linear-gradient(100deg,#edf4ff,#f8fcff); color:#173b65; font-size:1.25em; font-weight:700; text-align:left; }
.article.neural h3 { padding:0 0 8px; margin:26px 0 14px; border:0; border-bottom:1px solid #dce8f6; color:#173b65; font-size:1.1em; font-weight:650; }
.article.neural h4 { color:var(--md-primary-color); }
.article.neural p { color:#3b4b62; margin:1.15em 0; letter-spacing:.02em; }
.article.neural strong { color:var(--md-primary-color); }
.article.neural a { color:var(--md-primary-color); border-bottom:1px solid #90c9ef; }
.article.neural blockquote { padding:16px 18px; margin:22px 0; border:1px solid #cce5f4; border-left:4px solid #4aa9bd; border-radius:8px; background:#f1f9fc; }
.article.neural blockquote p { margin:0; color:#396575; }
.article.neural ul { list-style:square; }
.article.neural li { color:#3b4b62; margin:9px 0; }
.article.neural li p { margin:4px 0; }
.article.neural :not(pre)>code { padding:2px 6px; border:1px solid #d7e8fc; border-radius:4px; background:#edf5ff; color:#13549b; }
.article.neural .codebox { border:1px solid #28415e; border-radius:10px; background:#102338; }
.article.neural pre,.article.neural .codehead { background:#102338; }
.article.neural .codehead { color:#8ebdcd; }
.article.neural table { font-size:.88em; }
.article.neural th { padding:11px 12px; border-color:#284d73; background:#173b65; color:#f3f8ff; }
.article.neural td { padding:11px 12px; border-color:#dce8f6; color:#3b4b62; }
.article.neural img { border:1px solid #e0eaf5; border-radius:10px; }
.article.neural figcaption { color:#7c91a8; }
.article.neural hr { height:0; border:0; border-top:1px solid #cdddf0; margin:30px 0; transform:none; }
.article.neural .references p { color:#71869e; font-size:12px; }
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
