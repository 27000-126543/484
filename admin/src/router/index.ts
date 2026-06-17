import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes'
import { useUserStore } from '@/stores/user'
import { getDefaultHome, hasPermission } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
})

const whiteList = ['/login']

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const hasToken = userStore.isLoggedIn
  const userRole = userStore.role

  if (whiteList.includes(to.path)) {
    if (hasToken) {
      next(getDefaultHome(userRole))
    } else {
      next()
    }
    return
  }

  if (!hasToken) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  const metaRoles = to.meta?.roles as string[] | undefined
  if (!hasPermission(metaRoles, userRole)) {
    next(getDefaultHome(userRole))
    return
  }

  next()
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  if (title) {
    document.title = `${title} - 供应链风险监控平台`
  } else {
    document.title = '供应链风险监控平台'
  }
})

export default router
