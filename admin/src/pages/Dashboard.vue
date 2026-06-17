<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold text-slate-800 mb-6">监控大盘</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <el-card shadow="hover" v-for="item in stats" :key="item.label" class="rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">{{ item.label }}</p>
            <p class="text-2xl font-bold mt-1" :class="item.color">{{ item.value }}</p>
          </div>
          <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="item.bg">
            <component :is="item.icon" :size="24" :class="item.iconColor" />
          </div>
        </div>
      </el-card>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="mb-4">
          <template #header>
            <span class="font-medium">风险事件趋势（近7天）</span>
          </template>
          <div class="h-64 flex items-end justify-around gap-2 px-4">
            <div v-for="d in chartData" :key="d.day" class="flex-1 flex flex-col items-center">
              <div
                class="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                :style="{ height: `${d.value * 2}px`, minHeight: '4px' }"
              ></div>
              <span class="text-xs text-slate-400 mt-2">{{ d.day }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span class="font-medium">最新告警</span>
          </template>
          <el-scrollbar max-height="320px">
            <div v-for="item in alerts" :key="item.id" class="py-3 border-b border-slate-100 last:border-0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">{{ item.title }}</span>
                <el-tag size="small" :type="item.type">{{ item.level }}</el-tag>
              </div>
              <p class="text-xs text-slate-400 mt-1">{{ item.time }}</p>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Ticket, FileText, TrendingUp } from 'lucide-vue-next'

const stats = [
  { label: '今日风险事件', value: 23, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', iconColor: 'text-red-500' },
  { label: '待处理工单', value: 87, icon: Ticket, color: 'text-amber-500', bg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { label: '在线供应商', value: 156, icon: FileText, color: 'text-green-500', bg: 'bg-green-50', iconColor: 'text-green-500' },
  { label: '月处置率', value: '96.2%', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
]

const chartData = [
  { day: '周一', value: 45 },
  { day: '周二', value: 62 },
  { day: '周三', value: 38 },
  { day: '周四', value: 71 },
  { day: '周五', value: 55 },
  { day: '周六', value: 29 },
  { day: '周日', value: 23 },
]

const alerts = [
  { id: 1, title: '华南港口拥堵预警', level: '高危', type: 'danger', time: '10分钟前' },
  { id: 2, title: '东南亚地缘政治风险', level: '中危', type: 'warning', time: '32分钟前' },
  { id: 3, title: '北欧航线天气影响', level: '低危', type: 'info', time: '1小时前' },
  { id: 4, title: '供应商信用评分下调', level: '中危', type: 'warning', time: '2小时前' },
  { id: 5, title: '美洲港口劳工罢工', level: '高危', type: 'danger', time: '3小时前' },
]
</script>
