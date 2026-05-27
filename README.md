# Nexus · 知识文章发布页 Demo

> 企业内部 AI 知识分享平台 — 「发布新文章」页面高保真 Demo

## 技术栈

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** + 自定义企业级设计 token
- **lucide-react** 图标
- **framer-motion** 微交互动画

## 启动

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 功能清单

### 顶部 Header
- Nexus Logo + 「发布新文章」标题
- 自动保存状态（每 10 秒 mock）
- 保存草稿 / 预览 / 发布按钮

### 主编辑区（左 70%）
- **超大标题输入**（36px / 700，支持 0/100 计数 + AI 优化标题）
- **AI 文档总结模块**：浅紫色卡片、试用 badge、换一换 / 复制 / 折叠 / 关闭
- **Block 编辑器工具栏**：+ 添加菜单、正文样式、所有 Block 快捷插入、AI 润色
- **Block 类型**：Text / H1-H3 / 无序与有序列表 / 引用 / 分割线 / 图片 / 文件卡片 / 链接卡片 / 待办 / 表格 / 代码块
- **Slash Command**：在文本块输入 `/` 唤起命令面板，支持上下键 + Enter
- 块级 hover handle（+ / 拖拽指示）

### 右侧设置面板（30%）
- **作者**：Avatar Chip、+ 添加作者弹窗、最多 5 位、协同在线状态
- **附件**：拖拽 / 点击上传、虚线区域、文件类型图标、单文件 ≤200MB
- **标签**：Chip UI、推荐标签库、自定义新增、最多 5 个
- **可见范围**：4 选 1 Radio Group（公开 / 部门 / 指定 / 仅自己）

### 加分项
- AI 优化标题
- AI 润色按钮
- 文档字数统计
- 协同在线人数（mock）
- 添加图标 / 封面入口

## 风格关键词
企业级 · 飞书 + Notion · 极简克制 · AI 产品感

## 颜色规范
| Token | Value |
| --- | --- |
| 主色 | `#2563EB` |
| AI 紫 | `#8B5CF6` |
| 背景 | `#F7F8FA` |
| 边框 | `#E5E7EB` |
| 正文 | `#111827` |
| 次级 | `#6B7280` |

## 目录结构

```
app/
  layout.tsx         全局字体 + 元信息
  page.tsx           发布页主页面
  globals.css        Tailwind + 全局基础样式
components/
  Header.tsx         顶部固定 Header
  Logo.tsx           Nexus 品牌标识
  TitleInput.tsx     文章标题输入（含字数 / AI 优化）
  blocks/
    BlockRow.tsx     所有 Block 类型渲染
  editor/
    BlockEditor.tsx  编辑器主组件
    EditorToolbar.tsx
    SlashMenu.tsx    Slash Command 命令面板
    Editable.tsx     轻量 contentEditable 封装
    types.ts / factory.ts
  summary/
    AiSummary.tsx    AI 文档总结卡
  sidebar/
    Sidebar.tsx
    AuthorsPanel.tsx
    AttachmentsPanel.tsx
    TagsPanel.tsx
    VisibilityPanel.tsx
  ui/
    Button.tsx
    Card.tsx
lib/
  utils.ts
  mock.ts            mock 用户 / 附件 / AI summary
```
