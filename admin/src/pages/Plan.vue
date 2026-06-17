<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-slate-800">预案管理</h2>
      <el-button type="primary">新建预案</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="item in plans" :key="item.id">
        <el-card shadow="hover" class="mb-4 h-full">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ item.name }}</span>
              <el-tag size="small" :type="item.status === '启用' ? 'success' : 'info'">
                {{ item.status }}
              </el-tag>
            </div>
          </template>
          <p class="text-sm text-slate-500 mb-3 h-10">{{ item.desc }}</p>
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>类型：{{ item.type }}</span>
            <span>最近执行：{{ item.lastRun }}</span>
          </div>
          <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100">
            <el-button size="small" type="primary" plain style="flex: 1">编辑</el-button>
            <el-button size="small" type="success" plain style="flex: 1">执行</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
const plans = [
  { id: 1, name: '港口拥堵应急预案', desc: '当主要港口拥堵超过48小时时启动，切换至备用港口与陆运方案', type: '物流类', status: '启用', lastRun: '3天前' },
  { id: 2, name: '供应商违约处置预案', desc: '核心供应商出现违约风险时，启动备用供应商切换流程', type: '供应商类', status: '启用', lastRun: '1周前' },
  { id: 3, name: '自然灾害响应预案', desc: '地震/台风/洪水等自然灾害下的供应链快速恢复方案', type: '灾害类', status: '启用', lastRun: '2周前' },
  { id: 4, name: '地缘政治风险预案', desc: '贸易战/制裁/战争等地缘政治事件下的供应链布局调整', type: '政治类', status: '启用', lastRun: '1个月前' },
  { id: 5, name: '疫情防控应急预案', desc: '突发公共卫生事件下的人员与物资保障方案', type: '公共卫生', status: '停用', lastRun: '半年前' },
  { id: 6, name: '信息系统故障预案', desc: '物流跟踪系统/ERP系统故障时的手工应急处理流程', type: 'IT类', status: '启用', lastRun: '5天前' },
]
</script>
