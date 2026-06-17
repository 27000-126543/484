import type { UserInfo } from '@/utils/auth'

interface MockUser {
  username: string
  password: string
  user: UserInfo
}

const mockUsers: MockUser[] = [
  {
    username: 'operator',
    password: '123456',
    user: {
      id: 'u001',
      username: 'operator',
      nickname: '张运维',
      role: 'operator',
      team: '华南运维一组',
      avatar: '',
    },
  },
  {
    username: 'supervisor',
    password: '123456',
    user: {
      id: 'u002',
      username: 'supervisor',
      nickname: '李主管',
      role: 'supervisor',
      team: '运维管理部',
      avatar: '',
    },
  },
]

export interface LoginResponse {
  token: string
  user: UserInfo
}

export function login(username: string, password: string): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const found = mockUsers.find(
        (u) => u.username === username && u.password === password
      )
      if (found) {
        resolve({
          token: `mock-token-${found.user.id}-${Date.now()}`,
          user: found.user,
        })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 400)
  })
}

export function getUserInfo(): Promise<UserInfo> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers[0].user)
    }, 200)
  })
}
