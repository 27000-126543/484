<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">日志查询</h2>
      <el-button type="primary" plain>导出日志</el-button>
    </div>

    <el-card class="mb-4">
      <el-form :inline="true" class="mb-4">
        <el-form-item label="日志类型">
          <el-select v-model="form.type" placeholder="全部" clearable style="width: 160px">
            <el-option label="操作日志" value="action" />
            <el-option label="系统日志" value="system" />
            <el-option label="登录日志" value="login" />
            <el-option label="错误日志" value="error" />
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
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.levelType">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column prop="user" label="操作人" width="120" />
        <el-table-column prop="module" label="模块" width="140" />
        <el-table-column prop="action" label="操作内容" min-width="260" />
        <el-table-column prop="ip" label="IP地址" width="140" />
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          :page-size="15"
          :total="328"
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
  const levels = [
    { text: 'INFO', type: 'info' },
    { text: 'WARN', type: 'warning' },
    { text: 'ERROR', type: 'danger' },
    { text: 'INFO', type: 'success' },
  ]
  const lvl = levels[i % 4]
  return {
    id: i + 1,
    time: `2026-06-${String(15 - (i % 10)).padStart(2, '0')} ${String(18 - i).padStart(2, '0')}:${String(30 + i * 3).padStart(2, '0')}:15`,
    level: lvl.text,
    levelType: lvl.type,
    type: ['操作日志', '系统日志', '登录日志', '错误日志'][i % 4],
    user: ['admin', 'operator01', 'supervisor', 'system'][i % 4],
    module: ['工单模块', '系统管理', '权限模块', '报表模块'][i % 4],
    action: [
      '创建工单 WO-2026-06125',
      '更新用户权限配置',
      '用户登录成功',
      '导出月度报表',
      '修改供应商信息',
      '系统定时任务执行',
      '密码修改成功',
      '审批流程异常',
      '预案执行记录',
      '数据同步完成',
    ][i],
    ip: `192.168.1.${10 + i}`,
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
