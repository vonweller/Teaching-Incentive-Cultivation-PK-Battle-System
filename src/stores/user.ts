import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, CharacterAppearance } from '@/types'
import { getLevelByExp, getExpForNextLevel, getTitleByLevel, getAppearanceTier } from '@/types'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isLoggedIn = computed(() => currentUser.value !== null)
  const users = ref<User[]>([])

  const userLevel = computed(() => {
    if (!currentUser.value) return 1
    return getLevelByExp(currentUser.value.exp)
  })

  const userTitle = computed(() => {
    return getTitleByLevel(userLevel.value)
  })

  const expProgress = computed(() => {
    if (!currentUser.value) return 0
    const currentLevelExp = getExpForNextLevel(userLevel.value - 1)
    const nextLevelExp = getExpForNextLevel(userLevel.value)
    const currentExp = currentUser.value.exp
    return ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
  })

  const appearanceTier = computed(() => {
    return getAppearanceTier(userLevel.value)
  })

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function registerStudent(username: string, password: string, name: string, appearance: CharacterAppearance): boolean {
    if (users.value.find(u => u.username === username)) {
      return false
    }

    const newUser: User = {
      id: generateId(),
      username,
      password,
      role: 'student',
      name,
      avatar: '',
      appearance,
      level: 1,
      exp: 0,
      coins: 100,
      points: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    }

    users.value.push(newUser)
    currentUser.value = newUser
    return true
  }

  function registerTeacher(username: string, password: string, name: string): boolean {
    if (users.value.find(u => u.username === username)) {
      return false
    }

    const newUser: User = {
      id: generateId(),
      username,
      password,
      role: 'teacher',
      name,
      avatar: '',
      appearance: { hair: 1, face: 1, body: 1, accessory: 1 },
      level: 10,
      exp: 9999,
      coins: 9999,
      points: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    }

    users.value.push(newUser)
    currentUser.value = newUser
    return true
  }

  function login(username: string, password: string): boolean {
    const user = users.value.find(u => u.username === username && u.password === password)
    if (user) {
      user.lastLoginAt = Date.now()
      currentUser.value = user
      return true
    }
    return false
  }

  function logout() {
    currentUser.value = null
  }

  function addExp(amount: number) {
    if (!currentUser.value) return
    const oldLevel = userLevel.value
    currentUser.value.exp += amount
    const newLevel = userLevel.value

    if (newLevel > oldLevel) {
      onLevelUp(oldLevel, newLevel)
    }
  }

  function addCoins(amount: number) {
    if (!currentUser.value) return
    currentUser.value.coins += amount
  }

  function addPoints(amount: number) {
    if (!currentUser.value) return
    currentUser.value.points += amount
  }

  function deductCoins(amount: number): boolean {
    if (!currentUser.value || currentUser.value.coins < amount) return false
    currentUser.value.coins -= amount
    return true
  }

  function deductExp(amount: number) {
    if (!currentUser.value) return
    currentUser.value.exp = Math.max(0, currentUser.value.exp - amount)
    
    const newLevel = userLevel.value
    if (newLevel < currentUser.value.level) {
      onLevelDown(currentUser.value.level, newLevel)
    }
    currentUser.value.level = newLevel
  }

  function deductPoints(amount: number) {
    if (!currentUser.value) return
    currentUser.value.points = Math.max(0, currentUser.value.points - amount)
  }

  function updateAppearance(appearance: Partial<CharacterAppearance>) {
    if (!currentUser.value) return
    currentUser.value.appearance = { ...currentUser.value.appearance, ...appearance }
  }

  function onLevelUp(oldLevel: number, newLevel: number) {
    const levelDiff = newLevel - oldLevel
    currentUser.value!.coins += levelDiff * 50
    
    const oldTier = getAppearanceTier(oldLevel)
    const newTier = getAppearanceTier(newLevel)
    if (newTier > oldTier) {
      console.log('角色外观进化！')
    }
  }

  function onLevelDown(oldLevel: number, newLevel: number) {
    console.log(`角色降级：${oldLevel} -> ${newLevel}`)
  }

  function getAllStudents(): User[] {
    return users.value.filter(u => u.role === 'student')
  }

  function getUserById(id: string): User | undefined {
    return users.value.find(u => u.id === id)
  }

  return {
    currentUser,
    isLoggedIn,
    users,
    userLevel,
    userTitle,
    expProgress,
    appearanceTier,
    registerStudent,
    registerTeacher,
    login,
    logout,
    addExp,
    addCoins,
    addPoints,
    deductCoins,
    deductExp,
    deductPoints,
    updateAppearance,
    getAllStudents,
    getUserById
  }
}, {
  persist: true
})
