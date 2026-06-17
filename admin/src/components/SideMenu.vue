<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :unique-opened="true"
    background-color="#1e293b"
    text-color="#cbd5e1"
    active-text-color="#3b82f6"
    router
    class="h-full border-r-0"
  >
    <template v-for="route in menuRoutes" :key="route.path">
      <el-sub-menu
        v-if="route.children && route.children.length > 0"
        :index="resolvePath(route.path)"
      >
        <template #title>
          <el-icon v-if="getIcon(route)">
            <component :is="getIcon(route)" />
          </el-icon>
          <span>{{ getTitle(route) }}</span>
        </template>
        <el-menu-item
          v-for="child in route.children"
          :key="child.path"
          :index="resolvePath(route.path + '/' + child.path)"
        >
          <el-icon v-if="getIcon(child)">
            <component :is="getIcon(child)" />
          </el-icon>
          <span>{{ getTitle(child) }}</span>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item
        v-else
        :index="resolvePath(route.path)"
      >
        <el-icon v-if="getIcon(route)">
          <component :is="getIcon(route)" />
        </el-icon>
        <span>{{ getTitle(route) }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import {
  LayoutDashboard,
  Ticket,
  FileText,
  AlertTriangle,
  ScrollText,
  BarChart3,
  Search,
  FileCheck,
  Settings,
  Users,
  Shield,
  Wrench,
} from 'lucide-vue-next'
import type { Component } from 'vue'

const route = useRoute()
const permissionStore = usePermissionStore()

const menuRoutes = computed<RouteRecordRaw[]>(() => {
  return permissionStore.menuItems
})

const activeMenu = computed(() => route.path)

const iconMap: Record<string, Component> = {
  DataBoard: LayoutDashboard,
  Tickets: Ticket,
  Document: FileText,
  Warning: AlertTriangle,
  Operation: ScrollText,
  DataAnalysis: BarChart3,
  Search: Search,
  DocumentChecked: FileCheck,
  Setting: Settings,
  User: Users,
  UserFilled: Shield,
  Tools: Wrench,
}

function getIcon(r: RouteRecordRaw): Component | null {
  const iconName = r.meta?.icon as string | undefined
  if (!iconName) return null
  return iconMap[iconName] || null
}

function getTitle(r: RouteRecordRaw): string {
  return (r.meta?.title as string) || ''
}

function resolvePath(p: string): string {
  if (p.startsWith('/')) return p
  return '/' + p
}
</script>

<style scoped>
.el-menu {
  border-right: none;
}
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(59, 130, 246, 0.1) !important;
}
:deep(.el-menu-item.is-active) {
  background-color: rgba(59, 130, 246, 0.15) !important;
}
</style>
