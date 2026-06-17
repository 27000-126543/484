<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">用户管理</h2>
      <el-button type="primary">新增用户</el-button>
    </div>

    <el-card class="mb-4">
      <el-form :inline="true" class="mb-4">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="全部" clearable style="width: 140px">
            <el-option label="主管" value="supervisor" />
            <el-option label="运维" value="operator" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="nickname" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="row.role === 'supervisor' ? 'danger' : 'primary'">
              {{ row.roleText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="team" label="所属团队" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="lastLogin" label="最近登录" width="170" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '启用' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button size="small" type="primary" link>编辑</el-button>
            <el-button size="small" type="warning" link>重置密码</el-button>
            <el-button size="small" type="danger" link>禁用</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          :page-size="10"
          :total="38"
          layout="prev, pager, next, total"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({
  username: '',
  role: '',
  status: '',
})
const page = ref(1)

const tableData = Array.from({ length: 8 }).map((_, i) => {
  const isSuper = i % 4 === 0
  return {
    id: i + 1,
    username: isSuper ? `supervisor${i + 1}` : `operator${i + 1}`,
    nickname: ['李建国', '张伟', '王芳', '刘强', '陈静', '赵磊', '孙娜', '周涛'][i],
    role: isSuper ? 'supervisor' : 'operator',
    roleText: isSuper ? '主管' : '运维',
    team: ['华南一组', '华北二组', '华东三组', '运维管理部'][i % 4],
    email: `user${i + 1}@company.com`,
    phone: `138${String(10000000 + i * 1234).slice(0, 8)}`,
    lastLogin: `2026-06-${String(15 - (i % 5)).padStart(2, '0')} ${String(9 + i).padStart(2, '0')}:30:00`,
    status: i === 5 ? '禁用' : '启用',
  }
})

function handleSearch() {
  page.value = 1
}
function handleReset() {
  form.username = ''
  form.role = ''
  form.status = ''
}
</script>
