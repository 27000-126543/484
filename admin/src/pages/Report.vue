<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">报表统计</h2>
      <div class="flex gap-2">
        <el-date-picker
          v-model="month"
          type="month"
          placeholder="选择月份"
          style="width: 180px"
        />
        <el-button type="primary">导出报表</el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <el-card shadow="hover">
        <p class="text-sm text-slate-500 mb-2">本月风险事件数</p>
        <p class="text-3xl font-bold text-red-500">128</p>
        <p class="text-xs text-slate-400 mt-2">较上月 <span class="text-red-400">↑ 12.3%</span></p>
      </el-card>
      <el-card shadow="hover">
        <p class="text-sm text-slate-500 mb-2">平均响应时长</p>
        <p class="text-3xl font-bold text-blue-500">2.4h</p>
        <p class="text-xs text-slate-400 mt-2">较上月 <span class="text-green-400">↓ 18.5%</span></p>
      </el-card>
      <el-card shadow="hover">
        <p class="text-sm text-slate-500 mb-2">替代方案采用率</p>
        <p class="text-3xl font-bold text-green-500">86.7%</p>
        <p class="text-xs text-slate-400 mt-2">较上月 <span class="text-green-400">↑ 5.2%</span></p>
      </el-card>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="mb-4">
          <template #header>
            <span class="font-medium">风险事件类型分布</span>
          </template>
          <div class="space-y-3 px-2">
            <div v-for="item in typeStats" :key="item.name">
              <div class="flex justify-between text-sm mb-1">
                <span>{{ item.name }}</span>
                <span class="text-slate-500">{{ item.value }} 件</span>
              </div>
              <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                  :style="{ width: `${item.value * 0.8}%` }"
                ></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span class="font-medium">成本超支分布</span>
          </template>
          <div class="space-y-3 px-2">
            <div v-for="item in costStats" :key="item.range">
              <div class="flex justify-between text-sm mb-1">
                <span>{{ item.range }}</span>
                <span class="text-slate-500">{{ item.count }} 笔</span>
              </div>
              <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                  :style="{ width: `${item.count * 3}%` }"
                ></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const month = ref(new Date())

const typeStats = [
  { name: '自然灾害', value: 42 },
  { name: '港口拥堵', value: 36 },
  { name: '地缘政治', value: 24 },
  { name: '运输中断', value: 18 },
  { name: '供应商违约', value: 8 },
]

const costStats = [
  { range: '$0 - $1,000', count: 18 },
  { range: '$1,000 - $5,000', count: 32 },
  { range: '$5,000 - $10,000', count: 24 },
  { range: '$10,000 - $50,000', count: 12 },
  { range: '$50,000+', count: 4 },
]
</script>
