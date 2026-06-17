import type { RouteRecordRaw } from 'vue-router'
import Login from '@/pages/Login.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import WorkOrder from '@/pages/WorkOrder.vue'
import WorkOrderAll from '@/pages/WorkOrderAll.vue'
import Exception from '@/pages/Exception.vue'
import Plan from '@/pages/Plan.vue'
import Report from '@/pages/Report.vue'
import LogQuery from '@/pages/LogQuery.vue'
import AuditLog from '@/pages/AuditLog.vue'
import SystemUser from '@/pages/SystemUser.vue'
import SystemRole from '@/pages/SystemRole.vue'
import SystemConfig from '@/pages/SystemConfig.vue'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      hidden: true,
      public: true,
    },
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    meta: { hidden: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '监控大盘',
          icon: 'DataBoard',
          roles: ['supervisor'],
          defaultFor: ['supervisor'],
        },
      },
      {
        path: 'workorder',
        name: 'WorkOrder',
        component: WorkOrder,
        meta: {
          title: '团队工单',
          icon: 'Tickets',
          roles: ['operator', 'supervisor'],
          defaultFor: ['operator'],
        },
      },
      {
        path: 'workorder/all',
        name: 'WorkOrderAll',
        component: WorkOrderAll,
        meta: {
          title: '全量工单',
          icon: 'Document',
          roles: ['supervisor'],
        },
      },
      {
        path: 'exception',
        name: 'Exception',
        component: Exception,
        meta: {
          title: '异常事件',
          icon: 'Warning',
          roles: ['supervisor'],
        },
      },
      {
        path: 'plan',
        name: 'Plan',
        component: Plan,
        meta: {
          title: '预案管理',
          icon: 'Operation',
          roles: ['operator', 'supervisor'],
        },
      },
      {
        path: 'report',
        name: 'Report',
        component: Report,
        meta: {
          title: '报表统计',
          icon: 'DataAnalysis',
          roles: ['operator', 'supervisor'],
        },
      },
      {
        path: 'log',
        name: 'LogQuery',
        component: LogQuery,
        meta: {
          title: '日志查询',
          icon: 'Search',
          roles: ['supervisor'],
        },
      },
      {
        path: 'audit',
        name: 'AuditLog',
        component: AuditLog,
        meta: {
          title: '审计日志',
          icon: 'DocumentChecked',
          roles: ['supervisor'],
        },
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: {
          title: '系统管理',
          icon: 'Setting',
          roles: ['supervisor'],
        },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: SystemUser,
            meta: {
              title: '用户管理',
              icon: 'User',
              roles: ['supervisor'],
            },
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: SystemRole,
            meta: {
              title: '角色权限',
              icon: 'UserFilled',
              roles: ['supervisor'],
            },
          },
          {
            path: 'config',
            name: 'SystemConfig',
            component: SystemConfig,
            meta: {
              title: '系统配置',
              icon: 'Tools',
              roles: ['supervisor'],
            },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard',
    meta: { hidden: true },
  },
]

export default constantRoutes
