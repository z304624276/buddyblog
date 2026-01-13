# Vue Web 

这是原 Codebuddy 项目使用 Vue3 和 Supabase 重构的版本。

## 技术栈

- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **后端**: Supabase (PostgreSQL + Auth + Storage)
- **样式**: 原生 CSS (深色主题)
- **图标**: Lucide Vue Next
- **工具库**:
  - VueUse - Vue 组合式工具集
  - date-fns - 日期处理
  - pinyin-pro - 中文转拼音

## 项目结构

```
vue-web/
├── src/
│   ├── api/              # API 层
│   │   ├── posts.js
│   │   └── comments.js
│   ├── components/       # Vue 组件
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   ├── Layout.vue
│   │   ├── Hero.vue
│   │   ├── PostCard.vue
│   │   ├── TagPill.vue
│   │   └── CommentSection.vue
│   ├── pages/            # 页面组件
│   │   ├── Home.vue
│   │   ├── Posts.vue
│   │   ├── PostDetail.vue
│   │   ├── Login.vue
│   │   ├── Signup.vue
│   │   ├── Dashboard.vue
│   │   ├── EditPost.vue
│   │   ├── MyPosts.vue
│   │   ├── Profile.vue
│   │   ├── Account.vue
│   │   └── NotFound.vue
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── stores/           # Pinia 状态管理
│   │   └── auth.js
│   ├── supabase/         # Supabase 配置
│   │   └── client.js
│   ├── lib/              # 工具函数
│   │   └── utils.js
│   ├── App.vue
│   ├── main.js
│   └── index.css
├── supabase/
│   └── migrations/       # 数据库迁移
│       ├── 001_initial_schema.sql
│       └── 002_tags_posts_table.sql
├── public/
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 在 Supabase 创建一个新项目
2. 在 Supabase Dashboard 中运行迁移脚本:
```暂无（等待版本更新，有bug）
3. 在 Supabase Dashboard 的 Storage 中创建两个公开的 bucket:
   - `posts` (用于文章封面和附件)
   - `avatars` (用于用户头像)
4. 复制 `.env.example` 为 `.env`
5. 填入你的 Supabase 凭证:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
```

## 功能特性

### 用户功能
- 用户注册和登录 (邮箱/密码)
- 个人资料管理
- 头像上传
- 密码修改

### 文章功能
- 创建、编辑、删除文章
- HTML 内容编辑器 (支持富文本工具栏)
- 封面图片上传
- 附件图片上传 (支持多选)
- 标签管理
- 文章状态管理 (草稿、已发布、已归档)
- 定时发布功能
- 阅读时长计算
- 自动生成 URL Slug (支持中文转拼音)

### 浏览功能
- 首页精选文章
- 全部文章列表
- 文章详情页
- 标签筛选
- 关键词搜索
- 日期范围筛选
- 排序 (最新/最早发布)
- 评论系统

### 设计特点
- 深色主题
- 渐变背景效果
- 毛玻璃效果
- 响应式布局
- 流畅的动画过渡

## 数据库表结构

### profiles
用户资料表

### tags
标签表

### posts
文章表

### tags_posts
文章标签关联表

### comments
评论表



## 注意事项

1. Supabase RLS (Row Level Security) 策略已配置,确保数据安全
2. 文件上传大小限制: 封面 5MB, 附件 8MB
3. 密码最少 6 个字符
4. 所有时间均使用 UTC,前端根据时区显示

## License

MIT
