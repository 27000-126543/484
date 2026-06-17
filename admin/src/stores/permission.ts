import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { constantRoutes } from '@/router/routes'
import { useUserStore } from './user'
import { hasPermission } from '@/utils/auth'

export const usePermissionStore = defineStore('permission', () => {
  const userStore = useUserStore()

  const addRoutes = ref<RouteRecordRaw[]>([])

  const menuRoutes = computed<RouteRecordRaw[]>(() => {
    const role = userStore.role
    if (!role) return []

    function filter(routes: RouteRecordRaw[]): RouteRecordRaw[] {
      const result: RouteRecordRaw[] = []
      for (const route of routes) {
        const meta = route.meta as any
        const hidden = meta?.hidden === true
        const roles = meta?.roles as string[] | undefined

        if (!hasPermission(roles, role)) continue
        if (hidden) continue

        const item = { ...route }
        if (item.children && item.children.length > 0) {
          item.children = filter(item.children)
        }
        result.push(item)
      }
      return result
    }

    return filter(constantRoutes)
  })

  function generateRoutes() {
    addRoutes.value = menuRoutes.value
    return addRoutes.value
  }

  return {
    addRoutes,
    menuRoutes,
    generateRoutes,
  }
})
