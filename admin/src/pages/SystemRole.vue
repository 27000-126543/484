<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">角色权限</h2>
      <el-button type="primary">新增角色</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="role in roles" :key="role.id">
        <el-card shadow="hover" class="mb-4">
          <template #header>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <component :is="role.icon" :size="20" />
                <span class="font-medium">{{ role.name }}</span>
              </div>
              <el-tag size="small" :type="role.tagType">
                {{ role.userCount }}人
              </el-tag>
            </div>
          </template>
          <p class="text-sm text-slate-500 mb-3">{{ role.desc }}</p>
          <div class="text-xs text-slate-400 mb-3">
            拥有权限：
          </div>
          <div class="flex flex-wrap gap-1">
            <el-tag
              v-for="perm in role.permissions"
              :key="perm"
              size="small"
              type="info"
              effect="plain"
            >
              {{ perm }}
            </el-tag>
          </div>
          <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100">
            <el-button size="small" type="primary" plain style="flex: 1">编辑权限</el-button>
            <el-button size="small" type="info" plain style="flex: 1">成员管理</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { User, Users, Settings, Shield } from 'lucide-vue-next'

const roles = [
  {
    id: 1,
    name: '超级管理员',
    tagType: 'danger',
    icon: Shield,
    userCount: 2,
    desc: '系统最高权限，拥有所有功能的完全控制权',
    permissions: ['全部菜单', '用户管理', '角色管理', '系统配置', '审计日志', '所有数据'],
  },
  {
    id: 2,
    name: '主管',
    tagType: 'warning',
    icon: Users,
    userCount: 5,
    desc: '负责全局监控与管理，可查看所有工单和审计日志',
    permissions: ['监控大盘', '全量工单', '异常事件', '预案管理', '报表统计', '日志查询', '审计日志', '系统管理'],
  },
  {
    id: 3,
    name: '运维人员',
    tagType: 'primary',
    icon: User,
    userCount: 24,
    desc: '处理本团队分配的工单，执行预案，查看报表',
    permissions: ['团队工单', '预案管理', '报表统计'],
  },
  {
    id: 4,
    name: '访客',
    tagType: 'info',
    icon: User,
    userCount: 8,
    desc: '只读权限，仅可查看部分报表和公开信息',
    permissions: ['报表查看', '公告查看'],
  },
]
</script>

<style scoped>
</style>
