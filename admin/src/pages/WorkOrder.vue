<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">团队工单</h2>
      <div class="flex gap-2">
        <el-input v-model="searchKey" placeholder="搜索工单号" style="width: 220px" clearable />
        <el-button type="primary">新建工单</el-button>
      </div>
    </div>

    <el-card class="mb-4">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="待处理" name="pending" />
        <el-tab-pane label="处理中" name="processing" />
        <el-tab-pane label="已完成" name="done" />
      </el-tabs>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="orderNo" label="工单号" width="160" />
        <el-table-column prop="title" label="工单标题" min-width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.priority === '高' ? 'danger' : row.priority === '中' ? 'warning' : 'info'">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="处理人" width="120" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '已完成' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default>
            <el-button size="small" type="primary" link>查看</el-button>
            <el-button size="small" type="primary" link>处理</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          :page-size="10"
          :total="128"
          layout="prev, pager, next, total"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchKey = ref('')
const activeTab = ref('pending')
const page = ref(1)

const tableData = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  orderNo: `WO-2026-${String(6001 + i).padStart(6, '0')}`,
  title: [
    '深圳港口集装箱延迟处置',
    '备用供应商资质审核',
    '东南亚航线运费调整',
    '应急预案演练安排',
    '华东区域台风预警响应',
    '供应商交付质量异常',
    '物流跟踪系统故障排查',
    '月度报表数据校验',
  ][i],
  type: ['物流类', '供应商类', '财务类', '安全类'][i % 4],
  priority: ['高', '中', '低'][i % 3],
  owner: ['张运维', '王运维', '李运维'][i % 3],
  status: activeTab.value === 'pending' ? '待处理' : activeTab.value === 'processing' ? '处理中' : '已完成',
  createTime: `2026-06-${String(10 + (i % 8)).padStart(2, '0')} ${String(9 + i).padStart(2, '0')}:${String(15 * i).padStart(2, '0')}:00`,
}))
</script>
