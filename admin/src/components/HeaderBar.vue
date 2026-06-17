<template>
  <div class="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button
        class="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
        @click="toggleCollapse"
      >
        <ChevronRight v-if="isCollapse" :size="20" />
        <ChevronLeft v-else :size="20" />
      </button>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, idx) in breadcrumbs" :key="idx">
          {{ item }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="flex items-center gap-4">
      <el-tag v-if="userRole === 'supervisor'" type="danger" effect="light" size="large">
        主管账号
      </el-tag>
      <el-tag v-else type="primary" effect="light" size="large">
        运维账号
      </el-tag>

      <el-dropdown @command="handleCommand" trigger="click">
        <span class="flex items-center gap-2 cursor-pointer">
          <el-avatar :size="32" class="bg-blue-500">
            {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
          </el-avatar>
          <span class="text-slate-700">{{ userStore.userInfo?.nickname }}</span>
          <ChevronDown :size="16" class="text-slate-400" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled class="text-slate-400 text-xs">
              角色：{{ roleText }}
            </el-dropdown-item>
            <el-dropdown-item divided command="profile">
              <User :size="16" class="mr-2" />个人中心
            </el-dropdown-item>
            <el-dropdown-item command="switch">
              <ArrowLeftRight :size="16" class="mr-2" />切换角色
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <LogOut :size="16" class="mr-2" />退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  ArrowLeftRight,
  LogOut,
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { getDefaultHome } from '@/utils/auth'

const props = defineProps<{ isCollapse: boolean }>()
const emit = defineEmits<{ (e: 'update:isCollapse', val: boolean): void }>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userRole = computed(() => userStore.role)
const roleText = computed(() => (userRole.value === 'supervisor' ? '主管' : '运维人员'))

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((r) => r.meta?.title)
  return matched.map((r) => r.meta?.title as string)
})

function toggleCollapse() {
  emit('update:isCollapse', !props.isCollapse)
}

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        userStore.logout()
        ElMessage.success('已退出登录')
        router.replace('/login')
      })
      .catch(() => {})
  } else if (cmd === 'switch') {
    handleSwitchRole()
  } else if (cmd === 'profile') {
    ElMessage.info('个人中心开发中')
  }
}

function handleSwitchRole() {
  const nextRole = userRole.value === 'supervisor' ? 'operator' : 'supervisor'
  ElMessageBox.confirm(
    `确定要切换为${nextRole === 'supervisor' ? '主管' : '运维'}账号吗？`,
    '切换角色',
    {
      confirmButtonText: '确定切换',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      const mockUser = {
        id: nextRole === 'supervisor' ? 'u002' : 'u001',
        username: nextRole,
        nickname: nextRole === 'supervisor' ? '李主管' : '张运维',
        role: nextRole as 'supervisor' | 'operator',
        team: nextRole === 'supervisor' ? '运维管理部' : '华南运维一组',
        avatar: '',
      }
      userStore.refreshUserInfo(mockUser)
      ElMessage.success(`已切换为${nextRole === 'supervisor' ? '主管' : '运维'}账号`)

      const currentPath = route.path
      const metaRoles = route.meta?.roles as string[] | undefined
      if (metaRoles && !metaRoles.includes(nextRole)) {
        router.replace(getDefaultHome(nextRole))
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
:deep(.el-dropdown-menu) {
  padding: 4px 0;
}
</style>
