# 全球供应链风险监控系统 - 管理后台技术架构

## 1. 技术选型

| 层 | 技术 | 选型理由 |
|----|------|---------|
| 框架 | Vue 3 + TypeScript | 组合式 API + 类型安全，后台系统最成熟方案 |
| 构建工具 | Vite | 极速冷启动 + HMR |
| UI 组件库 | Element Plus | 国内企业后台标准，组件齐全 |
| 状态管理 | Pinia | Vue 官方推荐，轻量直观 |
| 路由 | Vue Router 4 | 支持 beforeEach 路由守卫，meta 配置角色权限 |
| 图标 | Element Plus Icons + lucide-vue-next | 丰富图标 |
| 样式 | Tailwind CSS + SCSS | 原子化 CSS + 少量自定义覆盖 |
| HTTP | Axios | 拦截器统一处理 401/403 |
| 持久化 | localStorage | 存 token + 用户信息 |

## 2. 目录结构

```
484/
├── admin/                           # 前端管理后台（新建）
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── api/                     # Mock API
│       │   └── auth.ts
│       ├── router/
│       │   ├── index.ts             # 路由配置 + beforeEach 守卫
│       │   └── routes.ts            # 路由表（含 meta.roles）
│       ├── stores/
│       │   ├── user.ts              # 用户信息 + 角色
│       │   └── permission.ts        # 菜单权限
│       ├── layouts/
│       │   └── AdminLayout.vue      # 左侧菜单 + 顶栏布局
│       ├── components/
│       │   ├── SideMenu.vue         # 侧边栏（按 role 动态生成）
│       │   └── HeaderBar.vue        # 顶栏（用户/退出/角色切换）
│       ├── pages/
│       │   ├── Login.vue
│       │   ├── Dashboard.vue
│       │   ├── WorkOrder.vue
│       │   ├── WorkOrderAll.vue
│       │   ├── Exception.vue
│       │   ├── Plan.vue
│       │   ├── Report.vue
│       │   ├── LogQuery.vue
│       │   ├── AuditLog.vue
│       │   ├── SystemUser.vue
│       │   ├── SystemRole.vue
│       │   └── SystemConfig.vue
│       └── utils/
│           ├── auth.ts              # 角色判定 + 默认首页
│           └── request.ts
│
├── prisma/                          # 后端（已存在）
├── src/                             # 后端（已存在）
```

## 3. 权限体系设计

### 3.1 路由表结构（核心）

```typescript
const routes = [
  {
    path: '/audit',
    component: AuditLog,
    meta: {
      title: '审计日志',
      roles: ['supervisor'],           // 只有主管能进
      icon: 'Document'
    }
  },
  {
    path: '/workorder',
    component: WorkOrder,
    meta: {
      title: '团队工单',
      roles: ['operator', 'supervisor'], // 两者都能进
      icon: 'Tickets',
      defaultFor: ['operator']           // 运维默认落这里
    }
  }
]
```

### 3.2 权限判断流程

```
                ┌─────────────────────┐
                │  路由 beforeEach 钩子  │
                └──────────┬──────────┘
                           │
              ┌────────────▼────────────┐
              │  是否白名单（/login）？  │──是──▶ 放行
              └────────────┬────────────┘
                           │否
              ┌────────────▼────────────┐
              │     有没有登录态？       │──无──▶ /login
              └────────────┬────────────┘
                           │有
              ┌────────────▼────────────┐
              │  to.meta.roles 包含      │
              │  userStore.role ？       │──是──▶ 放行
              └────────────┬────────────┘
                           │否
              ┌────────────▼────────────┐
              │  跳到 getDefaultHome(role) │
              └─────────────────────────┘
```

### 3.3 菜单生成逻辑

```typescript
// stores/permission.ts
const menuRoutes = computed(() => {
  const role = userStore.role
  return allRoutes.filter(r => {
    // 条件1：在 meta.roles 里
    // 条件2：不是隐藏路由（hidden: true）
    return r.meta?.roles?.includes(role) && !r.meta?.hidden
  })
})
```

**关键**：`menuRoutes` 是 computed，只要 `userStore.role` 变 → 菜单立刻重算，不会缓存旧值。

### 3.4 角色切换监听

```typescript
// App.vue 或 AdminLayout.vue
watch(
  () => userStore.role,
  (newRole, oldRole) => {
    if (oldRole && newRole !== oldRole) {
      // 1. 当前页面新角色有没有权限？
      const canStay = currentRoute.meta?.roles?.includes(newRole)
      if (!canStay) {
        // 2. 没权限 → 跳新角色默认首页
        router.push(getDefaultHome(newRole))
      }
      // 3. 菜单因为是 computed，会自动刷新，不用手动清
    }
  }
)
```

## 4. 默认首页映射

```typescript
// utils/auth.ts
export function getDefaultHome(role: string): string {
  switch (role) {
    case 'operator':   return '/workorder'
    case 'supervisor': return '/dashboard'
    default:           return '/login'
  }
}
```

## 5. 登录态持久化 + 刷新恢复

```
页面刷新
  │
  ├─ main.ts → Pinia 从 localStorage 恢复 userInfo
  │
  ├─ router.onReady → beforeEach 触发
  │     │
  │     ├─ 有登录态 ✓
  │     ├─ 当前路由有权限？→ 进
  │     └─ 没权限 → next(getDefaultHome(role))
  │
  └─ SideMenu computed 根据 role 生成菜单 ✓
```

## 6. Mock 用户数据

| 用户名 | 密码 | 角色 |
|--------|------|------|
| `operator` | `123456` | 普通运维（operator） |
| `supervisor` | `123456` | 主管（supervisor） |

后端 API 未接入前，用 mock 模拟登录请求。

## 7. 启动方式

```bash
# 前端（单独端口 5173，Vite 默认）
cd admin
npm install
npm run dev        # http://localhost:5173

# 后端（端口 3000，已存在）
cd ..
npm run dev
```

前后端解耦，通过 Vite proxy 代理 `/api/*` 到 `http://localhost:3000`。

## 8. 验收标准（自测清单）

- [x] operator 登录 → 默认进 `/workorder`，左侧只看到3个菜单
- [x] supervisor 登录 → 默认进 `/dashboard`，左侧看到9个全量菜单
- [x] operator 登出 → supervisor 登录 → 菜单立即变全量
- [x] supervisor 地址栏敲 `/audit` → 能进
- [x] operator 地址栏敲 `/audit` → 自动跳回 `/workorder`
- [x] operator 在 `/workorder` 刷新 → 仍在 `/workorder`，菜单正确
- [x] supervisor 在 `/dashboard` 刷新 → 仍在 `/dashboard`，菜单正确
- [x] operator 手动登出 → localStorage 清空 → 回 `/login`
