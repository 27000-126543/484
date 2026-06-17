import type { UserInfo } from '@/utils/auth'
import { login as mockLogin } from '@/api/auth'
import { defineStore } from 'pinia'
import {
  setToken,
  setUser,
  getToken,
  getUser,
  clearAuth,
  getDefaultHome,
} from '@/utils/auth'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken())
  const userInfo = ref<UserInfo | null>(getUser())

  const role = computed(() => userInfo.value?.role || null)
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const defaultHome = computed(() => getDefaultHome(role.value))

  async function login(username: string, password: string) {
    const res = await mockLogin(username, password)
    token.value = res.token
    userInfo.value = res.user
    setToken(res.token)
    setUser(res.user)
    return res
  }

  function logout() {
    token.value = null
    userInfo.value = null
    clearAuth()
  }

  function refreshUserInfo(user: UserInfo) {
    userInfo.value = user
    setUser(user)
  }

  return {
    token,
    userInfo,
    role,
    isLoggedIn,
    defaultHome,
    login,
    logout,
    refreshUserInfo,
  }
})
