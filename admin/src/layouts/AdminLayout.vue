<template>
  <div class="flex h-screen w-screen bg-slate-50 overflow-hidden">
    <aside
      class="flex-shrink-0 transition-all duration-300 bg-slate-900 text-white flex flex-col"
      :class="isCollapse ? 'w-16' : 'w-60'"
    >
      <div
        class="h-14 flex items-center gap-2 px-4 border-b border-slate-700/50"
      >
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          SC
        </div>
        <span
          v-if="!isCollapse"
          class="text-white font-medium text-sm whitespace-nowrap overflow-hidden"
        >
          供应链风险监控
        </span>
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <SideMenu :is-collapse="isCollapse" />
      </div>

      <div v-if="!isCollapse" class="p-3 border-t border-slate-700/50 text-xs text-slate-500">
        v1.0.0 · 企业版
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <HeaderBar v-model:is-collapse="isCollapse" />
      <main class="flex-1 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideMenu from '@/components/SideMenu.vue'
import HeaderBar from '@/components/HeaderBar.vue'
import { useUserStore } from '@/stores/user'
import { getDefaultHome } from '@/utils/auth'

const isCollapse = ref(false)
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

let lastRole: string | null = userStore.role

watch(
  () => userStore.role,
  (newRole, oldRole) => {
    if (oldRole && newRole !== oldRole && newRole !== lastRole) {
      lastRole = newRole
      const metaRoles = route.meta?.roles as string[] | undefined
      if (newRole && (!metaRoles || !metaRoles.includes(newRole))) {
        router.replace(getDefaultHome(newRole))
      }
    }
  }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
