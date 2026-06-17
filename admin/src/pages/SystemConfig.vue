<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold text-slate-800 mb-6">系统配置</h2>

    <el-card class="mb-4">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic" />
        <el-tab-pane label="告警配置" name="alert" />
        <el-tab-pane label="通知设置" name="notify" />
        <el-tab-pane label="安全设置" name="security" />
      </el-tabs>

      <div v-show="activeTab === 'basic'" class="max-w-2xl">
        <el-form label-width="120px">
          <el-form-item label="系统名称">
            <el-input v-model="basicForm.systemName" />
          </el-form-item>
          <el-form-item label="系统Logo">
            <el-input v-model="basicForm.logoUrl" placeholder="Logo URL" />
          </el-form-item>
          <el-form-item label="默认语言">
            <el-select v-model="basicForm.language" style="width: 200px">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </el-form-item>
          <el-form-item label="时区">
            <el-select v-model="basicForm.timezone" style="width: 280px">
              <el-option label="UTC+8 北京时间" value="Asia/Shanghai" />
              <el-option label="UTC+0 格林威治" value="UTC" />
              <el-option label="UTC-5 美东" value="America/New_York" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存设置</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-show="activeTab === 'alert'" class="max-w-2xl">
        <el-form label-width="140px">
          <el-form-item label="高危告警阈值">
            <el-input-number v-model="alertForm.criticalThreshold" :min="1" :max="100" />
            <span class="ml-2 text-sm text-slate-400">次/天</span>
          </el-form-item>
          <el-form-item label="告警通知方式">
            <el-checkbox-group v-model="alertForm.channels">
              <el-checkbox label="email">邮件</el-checkbox>
              <el-checkbox label="sms">短信</el-checkbox>
              <el-checkbox label="webhook">Webhook</el-checkbox>
              <el-checkbox label="app">APP推送</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="自动升级主管">
            <el-switch v-model="alertForm.autoEscalate" />
            <span class="ml-2 text-sm text-slate-400">高危事件未处理30分钟自动通知主管</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存设置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-show="activeTab === 'notify'" class="max-w-2xl">
        <el-form label-width="140px">
          <el-form-item label="邮件服务器">
            <el-input v-model="notifyForm.smtpHost" placeholder="smtp.example.com" />
          </el-form-item>
          <el-form-item label="端口">
            <el-input-number v-model="notifyForm.smtpPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="发送账号">
            <el-input v-model="notifyForm.sender" placeholder="noreply@example.com" />
          </el-form-item>
          <el-form-item label="Webhook地址">
            <el-input v-model="notifyForm.webhookUrl" placeholder="https://..." type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存设置</el-button>
            <el-button @click="handleTest">测试连接</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-show="activeTab === 'security'" class="max-w-2xl">
        <el-form label-width="160px">
          <el-form-item label="会话超时时间">
            <el-input-number v-model="securityForm.sessionTimeout" :min="5" :max="480" />
            <span class="ml-2 text-sm text-slate-400">分钟</span>
          </el-form-item>
          <el-form-item label="密码最小长度">
            <el-input-number v-model="securityForm.minPasswordLength" :min="6" :max="32" />
          </el-form-item>
          <el-form-item label="登录失败锁定">
            <el-switch v-model="securityForm.enableLock" />
            <span class="ml-2 text-sm text-slate-400">连续失败5次锁定30分钟</span>
          </el-form-item>
          <el-form-item label="强制密码更换">
            <el-switch v-model="securityForm.forcePasswordChange" />
            <span class="ml-2 text-sm text-slate-400">每90天必须更换密码</span>
          </el-form-item>
          <el-form-item label="双因素认证">
            <el-switch v-model="securityForm.mfa" />
            <span class="ml-2 text-sm text-slate-400">启用后所有用户需配置MFA</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存设置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')

const basicForm = reactive({
  systemName: '供应链风险监控平台',
  logoUrl: '',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
})

const alertForm = reactive({
  criticalThreshold: 5,
  channels: ['email', 'webhook'],
  autoEscalate: true,
})

const notifyForm = reactive({
  smtpHost: 'smtp.company.com',
  smtpPort: 465,
  sender: 'no-reply@company.com',
  webhookUrl: '',
})

const securityForm = reactive({
  sessionTimeout: 120,
  minPasswordLength: 8,
  enableLock: true,
  forcePasswordChange: false,
  mfa: false,
})

function handleSave() {
  ElMessage.success('设置已保存')
}
function handleReset() {
  ElMessage.info('已重置')
}
function handleTest() {
  ElMessage.success('连接测试成功')
}
</script>
