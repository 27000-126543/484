<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">全量工单</h2>
      <el-button type="primary">导出</el-button>
    </div>

    <el-card class="mb-4">
      <el-form :inline="true" class="mb-4">
        <el-form-item label="工单号">
          <el-input v-model="form.orderNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="done" />
          </el-select>
        </el-form-item>
        <el-form-item label="团队">
          <el-select v-model="form.team" placeholder="全部" clearable style="width: 160px">
            <el-option label="华南一组" value="team-south-1" />
            <el-option label="华北二组" value="team-north-2" />
            <el-option label="华东三组" value="team-east-3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="orderNo" label="工单号" width="160" />
        <el-table-column prop="title" label="工单标题" min-width="200" />
        <el-table-column prop="team" label="所属团队" width="130" />
        <el-table-column prop="owner" label="处理人" width="110" />
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="row.priority === '高' ? 'danger' : row.priority === '中' ? 'warning' : 'info'">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '已完成' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default>
            <el-button size="small" type="primary" link>详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          :page-size="10"
          :total="256"
          layout="prev, pager, next, total"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({
  orderNo: '',
  status: '',
  team: '',
})
const page = ref(1)

const teams = ['华南一组', '华北二组', '华东三组']
const statuses = ['待处理', '处理中', '已完成']

const tableData = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  orderNo: `WO-2026-${String(6101 + i).padStart(6, '0')}`,
  title: [
    '全球海运价格波动预警',
    '供应商履约能力评估',
    '欧洲内陆运输优化',
    '海关政策更新通知',
    '危险品运输合规检查',
    '仓库库存盘点安排',
    '跨境电商清关流程',
    '多式联运方案设计',
    '冷链物流温控监控',
    '逆向物流处置流程',
  ][i],
  team: teams[i % 3],
  owner: ['张三', '李四', '王五', '赵六', '钱七'][i % 5],
  priority: ['高', '中', '低'][i % 3],
  status: statuses[i % 3],
  createTime: `2026-06-${String(5 + (i % 12)).padStart(2, '0')} ${String(8 + (i % 10)).padStart(2, '0')}:${String(20 * i).padStart(2, '0')}:00`,
}))

function handleSearch() {
  page.value = 1
}
function handleReset() {
  form.orderNo = ''
  form.status = ''
  form.team = ''
}
</script>
