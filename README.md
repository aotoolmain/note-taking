# Markdown 笔记应用

一个功能完善的 Markdown 笔记编辑器，支持实时预览、多种导出格式、图片上传等功能。

## 功能特性

- ✨ **Markdown 编辑器** - 支持完整的 Markdown 语法
- 📝 **实时预览** - 所见即所得的编辑体验
- 🎨 **三种布局模式** - 编辑、编辑+预览、预览
- 🖼️ **图片上传** - 支持本地图片上传，自动转换为 URL 引用
- 📤 **多种导出格式** - PDF、HTML、MD 文件导出
- 📁 **分类管理** - 支持笔记分类和筛选
- 🔒 **数据本地存储** - 使用 JSON 文件存储数据
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **样式**: TailwindCSS 3
- **图标**: Font Awesome 4
- **Markdown**: marked.js
- **代码高亮**: highlight.js
- **PDF导出**: jsPDF + html2canvas
- **HTML净化**: DOMPurify

## 安装步骤

```bash
# 克隆项目
git clone https://gitee.com/xuejinlin/note-taking.git

# 进入项目目录
cd note-taking

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或生产环境启动
npm start
```

## 使用说明

### 基本操作

1. **创建笔记**: 点击左侧「+」按钮创建新笔记
2. **编辑笔记**: 点击笔记列表中的笔记进行编辑
3. **保存**: 笔记会自动保存，无需手动操作

### 布局模式

- **编辑模式**: 仅显示 Markdown 编辑器
- **编辑+预览**: 左右分屏，左侧编辑，右侧预览
- **预览模式**: 仅显示渲染后的效果

### 工具栏功能

- **粗体/斜体/删除线**: 文本格式设置
- **标题**: 支持 H1-H6 标题
- **列表**: 有序列表和无序列表
- **引用**: 添加引用块
- **代码**: 行内代码和代码块
- **表格**: 插入表格
- **链接**: 插入超链接
- **图片**: 上传本地图片

### 导出功能

- **导出 PDF**: 将笔记导出为 PDF 文件
- **导出 HTML**: 将笔记导出为 HTML 文件
- **导出 MD**: 将笔记导出为 Markdown 文件

### 分类管理

- **查看分类**: 点击左侧分类标签筛选笔记
- **添加分类**: 点击分类列表的「+」按钮
- **重命名分类**: 双击分类名称进行编辑
- **删除分类**: 右键删除分类（默认分类不可删除）

## 项目结构

```
note-taking/
├── data/                    # 数据目录
│   └── db.json              # 数据库文件（自动生成）
├── lib/                     # 前端依赖库
│   ├── dompurify/           # HTML 净化库
│   ├── font-awesome/        # 图标库
│   ├── highlightjs/         # 代码高亮库
│   ├── html2canvas/         # HTML 转 Canvas
│   ├── jspdf/               # PDF 生成库
│   ├── marked/              # Markdown 解析库
│   └── tailwindcss/         # CSS 框架
├── uploads/                 # 图片上传目录（自动生成）
├── index.html               # 主页面
├── script.js                # 前端脚本
├── server.js                # 后端服务
├── style.css                # 自定义样式
├── package.json             # 依赖配置
├── package-lock.json        # 依赖锁定
├── .gitignore               # Git 忽略配置
└── README.md                # 项目说明
```

## API 接口

### 笔记管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notes` | 获取笔记列表 |
| GET | `/api/notes/:id` | 获取单篇笔记 |
| POST | `/api/notes` | 创建新笔记 |
| PUT | `/api/notes/:id` | 更新笔记 |
| DELETE | `/api/notes/:id` | 删除笔记 |

### 分类管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取分类列表 |
| POST | `/api/categories` | 创建新分类 |
| PUT | `/api/categories/:id` | 更新分类名称 |
| DELETE | `/api/categories/:id` | 删除分类 |

### 图片上传

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload/image` | 上传图片 |

## 配置说明

- **端口**: 默认使用端口 3000，可通过环境变量 `PORT` 自定义
- **数据库**: 数据存储在 `data/db.json` 文件中
- **上传目录**: 图片上传到 `uploads/` 目录

## 开发说明

### 本地开发

```bash
# 启动开发服务器（自动热重载）
npm run dev
```

### 生产部署

```bash
# 安装依赖
npm install --production

# 启动服务器
npm start
```

### Docker 部署

#### 使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重启容器
docker-compose restart
```

#### 使用 Docker 命令

```bash
# 构建镜像
docker build -t note-taking .

# 运行容器
docker run -d \
  --name note-taking \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  note-taking
```

#### Docker 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3000 | 服务端口 |

#### 数据持久化

- `data/` - 笔记数据存储目录
- `uploads/` - 上传图片存储目录

使用 `-v` 参数挂载本地目录可实现数据持久化。

#### 更新 Docker 部署

当代码更新后，需要重新构建镜像并启动容器：

**Linux/macOS (Bash):**

```bash
# 方法一：使用 Docker Compose（推荐）
cd /path/to/note-taking
docker-compose down
docker-compose build
docker-compose up -d

# 方法二：使用 Docker 命令
docker stop note-taking
docker rm note-taking
docker rmi note-taking:latest
docker build -t note-taking:latest .
docker run -d \
  --name note-taking \
  -p 3000:3000 \
  -v ./data:/app/data \
  -v ./uploads:/app/uploads \
  --restart unless-stopped \
  note-taking:latest
```

**Windows (PowerShell):**

```powershell
# 方法一：使用 Docker Compose（推荐）
Set-Location D:\path\to\note-taking
docker-compose down
docker-compose build
docker-compose up -d

# 方法二：使用 Docker 命令
docker stop note-taking
docker rm note-taking
docker rmi note-taking:latest
docker build -t note-taking:latest .
docker run -d `
  --name note-taking `
  -p 3000:3000 `
  -v ./data:/app/data `
  -v ./uploads:/app/uploads `
  --restart unless-stopped `
  note-taking:latest
```

**注意事项：**

1. **数据安全**：由于 `data` 和 `uploads` 目录通过卷挂载到容器外部，更新时数据不会丢失。但请确保 `.dockerignore` 文件中包含 `data/` 和 `uploads/` 目录，以防止本地数据被复制到镜像中。

2. **更新前备份**：建议在更新前备份 `data` 目录：
   
   Linux/macOS:
   ```bash
   cp -r data data_backup_$(date +%Y%m%d)
   ```
   
   Windows PowerShell:
   ```powershell
   Copy-Item -Recurse data "data_backup_$(Get-Date -Format yyyyMMdd)"
   ```

3. **端口冲突**：如果端口被占用，需要先停止占用该端口的进程，然后再启动容器。

4. **验证更新**：更新完成后可以通过以下命令验证：
   ```bash
   # 查看容器日志
   docker logs note-taking
   
   # 检查容器状态
   docker ps
   ```

5. **服务器部署注意事项**：
   - 在服务器上首次部署时，确保服务器上的 `data` 目录为空或不存在，容器启动时会自动创建必要的文件。
   - 更新部署时，**不要**将本地开发环境的 `data` 目录复制到服务器，以免覆盖服务器上的现有数据。
   - 确保 `.dockerignore` 文件包含以下内容：
     ```
     node_modules
     npm-debug.log
     .git
     .DS_Store
     data/
     uploads/
     ```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

Apache License 2.0

## 作者

xuejinlin

---

**注意**: 首次运行时，`data/` 和 `uploads/` 目录会自动创建。如果需要清空数据，直接删除 `data/db.json` 文件即可。