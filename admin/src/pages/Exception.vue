<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">异常事件</h2>
      <div class="flex gap-2">
        <el-tag type="danger" effect="dark" size="large">高危 4</el-tag>
        <el-tag type="warning" effect="dark" size="large">中危 12</el-tag>
        <el-tag type="info" effect="dark" size="large">低危 8</el-tag>
      </div>
    </div>

    <el-card class="mb-4">
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="eventId" label="事件ID" width="160" />
        <el-table-column prop="type" label="类型" width="130" />
        <el-table-column prop="level" label="等级" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.level === 'CRITICAL' ? 'danger' : row.level === 'HIGH' ? 'warning' : 'info'">
              {{ row.levelText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="事件描述" min-width="240" />
        <el-table-column prop="region" label="影响区域" width="120" />
        <el-table-column prop="affectedOrders" label="影响订单" width="110">
          <template #default="{ row }">
            <span class="text-red-500 font-medium">{{ row.affectedOrders }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="occurredAt" label="发生时间" width="170" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '处理中' ? 'warning' : row.status === '已解决' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default>
            <el-button size="small" type="primary" link>详情</el-button>
            <el-button size="small" type="primary" link>处置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          :page-size="10"
          :total="24"
          layout="prev, pager, next, total"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const page = ref(1)

const tableData = Array.from({ length: 8 }).map((_, i) => {
  const levels = [
    { key: 'CRITICAL', text: '高危' },
    { key: 'HIGH', text: '中危' },
    { key: 'MEDIUM', text: '中危' },
    { key: 'LOW', text: '低危' },
  ]
  const lvl = levels[i % 4]
  return {
    id: i + 1,
    eventId: `EVT-2026-${String(1001 + i).padStart(6, '0')}`,
    type: ['地缘政治', '自然灾害', '港口拥堵', '运输中断'][i % 4],
    level: lvl.key,
    levelText: lvl.text,
    title: [
      '华南港口工人罢工持续升级',
      '东南亚地震影响物流线路',
      '鹿特丹港集装箱严重积压',
      '巴拿马运河通行费大幅上涨',
      '中东地缘冲突影响能源运输',
      '墨西哥湾飓风预警发布',
      '苏伊士运河通行受限',
      '亚马逊地区洪水影响内陆运输',
    ][i],
    region: ['华南', '东南亚', '欧洲', '北美'][i % 4],
    affectedOrders: 12 + i * 5,
    occurredAt: `2026-06-${String(12 + (i % 6)).padStart(2, '0')} ${String(6 + i).padStart(2, '0')}:30:00`,
    status: ['处理中', '待处理', '已解决'][i % 3],
  }
})
</script>
