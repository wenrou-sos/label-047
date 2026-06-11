# 小区物业管理面板系统

基于 Vue 3 + TypeScript + ECharts 构建的现代化物业管理系统，提供物业费管理、维修报修和数据可视化等核心功能。

## 功能特性

### 1. 仪表盘概览
- 核心指标实时展示（收缴率、欠费数、待处理报修、及时率）
- 欠费提醒列表（含逾期天数和欠费金额）
- 报修动态实时更新
- 快捷操作入口

### 2. 住户物业费管理
- 物业费缴纳状态展示（已缴/未缴/部分缴纳）
- 多维度筛选查询（楼栋、单元、姓名、状态）
- 欠费提醒与逾期时长统计
- 支持标记缴费和部分缴费操作
- 数据自动本地持久化

### 3. 维修报修管理
- 报修进度跟踪（提交→分配→处理→完成→关闭）
- 维修人员实时位置追踪（含动态位置模拟）
- 预计到达时间（ETA）显示
- 报修单状态流转管理
- 维修人员分配调度
- 优先级管理（低/中/高/紧急）

### 4. 数据可视化分析
- **仪表盘图表**：物业费收缴率、报修及时率
- **饼图**：缴费状态分布占比
- **柱状图**：月度报修量趋势
- **核心指标卡片**：金额统计、工单数量

## 技术栈

| 类别 | 技术选型 | 版本 |
|------|---------|------|
| 框架 | Vue 3 (Composition API) | ^3.4 |
| 语言 | TypeScript | ~5.3 |
| 构建工具 | Vite | ^5.0 |
| 状态管理 | Pinia | ^3.0 |
| 路由 | Vue Router | ^4.2 |
| 图表 | ECharts + vue-echarts | ^6.1 + ^8.0 |
| 样式 | Tailwind CSS | ^3.4 |
| 图标 | lucide-vue-next | ^0.511 |
| 工具库 | clsx + tailwind-merge | ^2.1 + ^3.3 |

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── charts/          # 图表组件
│   │   ├── GaugeChart.vue       # 仪表盘组件
│   │   ├── PaymentPieChart.vue  # 缴费饼图
│   │   └── RepairBarChart.vue   # 报修柱状图
│   ├── common/          # 通用组件
│   │   ├── StatCard.vue         # 统计卡片
│   │   └── StatusBadge.vue      # 状态标签
│   └── layout/          # 布局组件
│       ├── AppLayout.vue        # 主布局
│       ├── AppHeader.vue        # 顶部导航
│       └── Sidebar.vue          # 侧边栏
├── composables/         # 组合式函数
│   ├── useLocalStorage.ts       # 本地存储
│   └── useTheme.ts             # 主题管理
├── lib/                 # 工具库
│   └── utils.ts                 # 通用工具函数
├── mock/                # Mock 数据
│   ├── payments.ts              # 缴费数据
│   ├── repairs.ts               # 报修数据
│   ├── residents.ts             # 住户数据
│   └── workers.ts               # 维修人员数据
├── pages/               # 页面组件
│   ├── DashboardPage.vue        # 仪表盘
│   ├── PropertyFeesPage.vue     # 物业费管理
│   ├── MaintenancePage.vue      # 报修管理
│   └── AnalyticsPage.vue        # 数据分析
├── router/              # 路由配置
│   └── index.ts
├── stores/              # Pinia 状态管理
│   ├── payment.ts               # 缴费状态
│   ├── repair.ts                # 报修状态
│   └── worker.ts                # 维修人员状态
├── types/               # TypeScript 类型定义
│   └── index.ts
├── App.vue              # 根组件
├── main.ts              # 入口文件
└── style.css            # 全局样式
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问：http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
# TypeScript 类型检查
npm run check

# ESLint 代码检查
npm run lint

# ESLint 自动修复
npm run lint:fix
```

## API 文档

### 状态管理 (Pinia Stores)

#### usePaymentStore - 物业费管理

```typescript
// 状态
- payments: Payment[]              # 缴费记录列表
- residents: Resident[]            # 住户列表
- filter: PaymentFilter            # 当前筛选条件
- buildings: string[]              # 所有楼栋列表
- units: string[]                  # 当前楼栋的单元列表

// 计算属性
- filteredPayments: Payment[]      # 筛选后的缴费记录
- overduePayments: Payment[]       # 欠费记录
- totalCollected: number           # 已收缴总额
- totalOutstanding: number         # 欠费总额
- collectionRate: number           # 收缴率 (0-100)
- statusCounts: StatusCounts       # 各状态数量统计
- overdueCount: number             # 欠费户数

// 方法
- getResidentById(id: string): Resident | undefined
- updatePaymentStatus(id, status, paidAmount?): void
- setFilter(newFilter: Partial<PaymentFilter>): void
- resetFilter(): void
```

#### useRepairStore - 报修管理

```typescript
// 状态
- repairs: RepairOrder[]           # 报修单列表
- filter: RepairFilter             # 当前筛选条件

// 计算属性
- filteredRepairs: RepairOrder[]   # 筛选后的报修单
- pendingCount: number             # 待受理数量
- inProgressCount: number          # 处理中数量（含已分配）
- completedCount: number           # 已完成数量
- timelyRate: number               # 及时率 (0-100)
- monthlyRepairCounts: MonthData[] # 月度报修数据

// 方法
- assignWorker(orderId, workerId): void
- updateStatus(orderId, status, description): void
- setFilter(newFilter: Partial<RepairFilter>): void
- resetFilter(): void
```

#### useWorkerStore - 维修人员管理

```typescript
// 状态
- workers: MaintenanceWorker[]     # 维修人员列表
- isSimulating: boolean            # 是否正在位置模拟

// 方法
- getWorkerById(id: string): MaintenanceWorker | undefined
- getAvailableWorkers(): MaintenanceWorker[]
- updateWorkerLocation(id, lat, lng): void
- simulateWorkerMovement(): void   # 启动位置模拟
- stopSimulation(): void           # 停止位置模拟
```

### 类型定义

完整类型定义请参考 [types/index.ts](file:///d:/proje/label-047/src/types/index.ts)

核心类型：

```typescript
type PaymentStatus = 'paid' | 'unpaid' | 'partial'
type RepairStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'closed'
type RepairPriority = 'low' | 'medium' | 'high' | 'urgent'
type WorkerStatus = 'available' | 'busy' | 'off_duty'

interface Resident {
  id: string
  name: string
  building: string        // 楼栋号
  unit: string            // 单元号
  room: string            // 房号
  phone: string
}

interface Payment {
  id: string
  residentId: string
  period: string          // 缴费周期 'YYYY-MM'
  amount: number          // 应缴金额
  paidAmount: number      // 实缴金额
  status: PaymentStatus
  dueDate: string         // 截止日期
  paidDate: string | null // 缴费日期
}

interface RepairOrder {
  id: string
  residentId: string
  title: string
  description: string
  priority: RepairPriority
  status: RepairStatus
  createdAt: string
  assignedWorkerId: string | null
  images: string[]
  progress: RepairProgress[]
}

interface MaintenanceWorker {
  id: string
  name: string
  phone: string
  specialty: string       // 专长领域
  latitude: number        // 实时纬度
  longitude: number       // 实时经度
  status: WorkerStatus
  eta: string | null      // 预计到达时间
  currentOrderId: string | null
}
```

## 数据库设计方案

### 关系型数据库表结构

#### 1. residents (住户信息表)

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | VARCHAR(32) | PRIMARY KEY | 住户ID |
| name | VARCHAR(50) | NOT NULL | 姓名 |
| building | VARCHAR(20) | NOT NULL | 楼栋号 |
| unit | VARCHAR(20) | NOT NULL | 单元号 |
| room | VARCHAR(20) | NOT NULL | 房号 |
| phone | VARCHAR(20) | NOT NULL | 联系电话 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

**索引**: `INDEX idx_building_unit(building, unit)`

#### 2. payments (物业费缴费表)

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | VARCHAR(32) | PRIMARY KEY | 缴费记录ID |
| resident_id | VARCHAR(32) | FOREIGN KEY | 住户ID |
| period | VARCHAR(7) | NOT NULL | 缴费周期 (YYYY-MM) |
| amount | DECIMAL(10,2) | NOT NULL | 应缴金额 |
| paid_amount | DECIMAL(10,2) | DEFAULT 0 | 实缴金额 |
| status | ENUM | NOT NULL | paid/unpaid/partial |
| due_date | DATE | NOT NULL | 缴费截止日 |
| paid_date | DATETIME | NULL | 实际缴费时间 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

**索引**: 
- `INDEX idx_resident_period(resident_id, period)`
- `INDEX idx_status(status)`
- `UNIQUE KEY uk_resident_period(resident_id, period)`

#### 3. repair_orders (报修工单表)

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | VARCHAR(32) | PRIMARY KEY | 工单ID |
| resident_id | VARCHAR(32) | FOREIGN KEY | 报修住户ID |
| title | VARCHAR(100) | NOT NULL | 报修标题 |
| description | TEXT | NULL | 详细描述 |
| priority | ENUM | NOT NULL | low/medium/high/urgent |
| status | ENUM | NOT NULL | pending/assigned/in_progress/completed/closed |
| assigned_worker_id | VARCHAR(32) | FOREIGN KEY | 分配维修人员ID |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| completed_at | DATETIME | NULL | 完成时间 |
| closed_at | DATETIME | NULL | 关闭时间 |

**索引**:
- `INDEX idx_status(status)`
- `INDEX idx_priority(priority)`
- `INDEX idx_created_at(created_at)`
- `INDEX idx_worker(assigned_worker_id)`

#### 4. repair_progress (报修进度日志表)

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | BIGINT | PRIMARY KEY AUTO_INCREMENT | 进度ID |
| order_id | VARCHAR(32) | FOREIGN KEY | 工单ID |
| stage | ENUM | NOT NULL | 进度阶段 |
| description | VARCHAR(255) | NULL | 进度说明 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

#### 5. maintenance_workers (维修人员表)

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | VARCHAR(32) | PRIMARY KEY | 人员ID |
| name | VARCHAR(50) | NOT NULL | 姓名 |
| phone | VARCHAR(20) | NOT NULL | 联系电话 |
| specialty | VARCHAR(50) | NOT NULL | 专长 |
| status | ENUM | NOT NULL | available/busy/off_duty |
| latitude | DECIMAL(10,6) | NULL | 当前纬度 |
| longitude | DECIMAL(10,6) | NULL | 当前经度 |
| eta_minutes | INT | NULL | 预计到达时间(分钟) |
| current_order_id | VARCHAR(32) | NULL | 当前处理工单 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | ON UPDATE NOW() | 更新时间 |

#### 6. repair_images (报修图片表)

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | BIGINT | PRIMARY KEY AUTO_INCREMENT | 图片ID |
| order_id | VARCHAR(32) | FOREIGN KEY | 工单ID |
| url | VARCHAR(500) | NOT NULL | 图片地址 |
| created_at | DATETIME | DEFAULT NOW() | 上传时间 |

### 数据同步机制

本项目采用 **LocalStorage 本地缓存** 方案，数据持久化流程如下：

```
Store初始化
    ↓
检查LocalStorage中是否有缓存数据
    ↓ (有缓存)                ↓ (无缓存)
加载缓存数据              加载Mock默认数据
    ↓                        ↓
    └───────────┬────────────┘
                ↓
        监听Store数据变化
                ↓
      自动写入LocalStorage
```

**本地缓存键值**:
- `property-payments`: 缴费记录
- `property-repairs`: 报修工单
- `property-workers`: 维修人员

## 部署说明

### 1. 本地开发环境

已在「快速开始」章节说明，使用 Vite 开发服务器即可。

### 2. 生产环境部署

#### 方式一：静态站点部署 (推荐)

```bash
# 1. 构建生产版本
npm run build

# 2. 部署 dist/ 目录到任意静态托管服务：
#    - Nginx
#    - Apache
#    - Vercel / Netlify / Cloudflare Pages
#    - 阿里云 OSS / 腾讯云 COS
```

**Nginx 配置示例**:
```nginx
server {
    listen 80;
    server_name property.example.com;
    root /var/www/property-management/dist;
    index index.html;

    # Vue Router history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript;
}
```

#### 方式二：Docker 部署

创建 `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建并运行:
```bash
docker build -t property-management .
docker run -p 80:80 property-management
```

#### 方式三：Node.js 服务端渲染 (如需 SSR)

可使用 Nuxt 3 或 Quasar 等框架迁移，本项目采用 SPA 架构。

### 3. 环境变量

Vite 支持通过 `.env` 文件配置环境变量：

```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=物业管理系统
```

在代码中使用：
```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL
```

### 4. 性能优化建议

1. **启用 Gzip/Brotli 压缩**
2. **CDN 加速静态资源**
3. **图片懒加载与 WebP 格式**
4. **Service Worker 离线缓存** (PWA)
5. **路由懒加载** (已配置)

## 响应式设计

系统采用 Tailwind CSS 响应式断点：

| 断点 | 宽度 | 适配设备 |
|------|------|---------|
| 默认 | < 640px | 手机竖屏 |
| sm | >= 640px | 手机横屏 |
| md | >= 768px | 平板 |
| lg | >= 1024px | 小屏笔记本 |
| xl | >= 1280px | 桌面显示器 |
| 2xl | >= 1536px | 大屏显示器 |

## 开发规范

### 命名约定
- 组件名：`PascalCase` (GaugeChart.vue)
- 组合式函数：`camelCase` 前缀 use (useLocalStorage)
- 常量：`UPPER_SNAKE_CASE`
- 变量/函数：`camelCase`

### Git 提交信息规范
```
feat: 新增功能
fix: 修复Bug
docs: 文档更新
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## License

MIT
