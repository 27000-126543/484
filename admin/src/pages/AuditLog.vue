<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">审计日志</h2>
      <el-button type="primary" plain>导出审计记录</el-button>
    </div>

    <el-card class="mb-4">
      <el-form :inline="true" class="mb-4">
        <el-form-item label="审计类型">
          <el-select v-model="form.type" placeholder="全部" clearable style="width: 160px">
            <el-option label="权限变更" value="permission" />
            <el-option label="数据修改" value="data" />
            <el-option label="登录登出" value="login" />
            <el-option label="配置变更" value="config" />
            <el-option label="敏感操作" value="sensitive" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="form.user" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="form.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="user" label="操作人" width="120" />
        <el-table-column prop="role" label="角色" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="row.roleType">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="审计类型" width="120" />
        <el-table-column prop="action" label="操作描述" min-width="260" />
        <el-table-column prop="target" label="操作对象" width="160" />
        <el-table-column prop="result" label="结果" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.result === '成功' ? 'success' : 'danger'">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default>
            <el-button size="small" type="primary" link>详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          :page-size="15"
          :total="512"
          layout="prev, pager, next, total"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({
  type: '',
  user: '',
  date: [],
})
const page = ref(1)

const tableData = Array.from({ length: 10 }).map((_, i) => {
  const roles = [
    { text: '主管', type: 'danger' },
    { text: '运维', type: 'primary' },
    { text: '系统', type: 'info' },
  ]
  const role = roles[i % 3]
  return {
    id: i + 1,
    time: `2026-06-${String(16 - (i % 10)).padStart(2, '0')} ${String(17 - i).padStart(2, '0')}:${String(15 * i).padStart(2, '0')}:42`,
    user: ['李主管', '张运维', '系统管理员', '王运维'][i % 4],
    role: role.text,
    roleType: role.type,
    type: ['权限变更', '数据修改', '登录登出', '配置变更', '敏感操作'][i % 5],
    action: [
      '新增用户账号 operator05',
      '修改工单状态为已完成',
      '用户登录系统',
      '更新系统告警阈值',
      '批量删除历史日志',
      '修改角色权限配置',
      '导出全量工单数据',
      '重置用户密码',
      '切换系统运行模式',
      '审批供应商合同变更',
    ][i],
    target: ['用户管理', '工单模块', '登录接口', '系统配置', '日志模块'][i % 5],
    result: ['成功', '失败'][i % 2],
  }
})

function handleSearch() {
  page.value = 1
}
function handleReset() {
  form.type = ''
  form.user = ''
  form.date = []
}
</script>
