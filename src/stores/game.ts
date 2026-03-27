import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Achievement, RankingEntry, RankingType } from '@/types'
import { ACHIEVEMENT_LIST } from '@/types'
import { useUserStore } from './user'
import { usePetStore } from './pet'

export const useGameStore = defineStore('game', () => {
  const achievements = ref<Achievement[]>([])
  const consecutiveLoginDays = ref(0)
  const lastLoginDate = ref('')
  const totalPkWins = ref(0)
  const socialInteractions = ref(0)

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function initAchievements() {
    if (achievements.value.length === 0) {
      achievements.value = ACHIEVEMENT_LIST.map(template => ({
        ...template,
        id: generateId(),
        unlocked: false
      }))
    }
  }

  function checkAchievements() {
    initAchievements()
    const userStore = useUserStore()
    const petStore = usePetStore()

    achievements.value.forEach(achievement => {
      if (achievement.unlocked) return

      let shouldUnlock = false
      const req = achievement.requirement

      switch (req.type) {
        case 'register':
          shouldUnlock = true
          break
        case 'consecutive_login':
          shouldUnlock = consecutiveLoginDays.value >= req.value
          break
        case 'total_points':
          shouldUnlock = (userStore.currentUser?.points || 0) >= req.value
          break
        case 'pet_level':
          shouldUnlock = (petStore.currentPet?.level || 0) >= req.value
          break
        case 'pk_wins':
          shouldUnlock = totalPkWins.value >= req.value
          break
        case 'social_interactions':
          shouldUnlock = socialInteractions.value >= req.value
          break
        case 'player_level':
          shouldUnlock = userStore.userLevel >= req.value
          break
      }

      if (shouldUnlock) {
        unlockAchievement(achievement.id)
      }
    })
  }

  function unlockAchievement(achievementId: string) {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement || achievement.unlocked) return

    achievement.unlocked = true
    achievement.unlockedAt = Date.now()

    const userStore = useUserStore()
    userStore.addExp(achievement.reward.exp)
    userStore.addCoins(achievement.reward.coins)
  }

  function recordLogin() {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (lastLoginDate.value === yesterday) {
      consecutiveLoginDays.value++
    } else if (lastLoginDate.value !== today) {
      consecutiveLoginDays.value = 1
    }

    lastLoginDate.value = today
    checkAchievements()
  }

  function recordPkWin() {
    totalPkWins.value++
    checkAchievements()
  }

  function recordSocialInteraction() {
    socialInteractions.value++
    checkAchievements()
  }

  function getRanking(type: RankingType): RankingEntry[] {
    const userStore = useUserStore()
    const petStore = usePetStore()
    
    const students = userStore.getAllStudents()
    
    const ranking = students.map(student => {
      const pet = petStore.userPets.find(p => p.ownerId === student.id)
      return {
        userId: student.id,
        userName: student.name,
        avatar: student.avatar,
        level: getLevelByExp(student.exp),
        points: student.points,
        petLevel: pet?.level || 0,
        rank: 0
      }
    })

    const sorted = ranking.sort((a, b) => {
      switch (type) {
        case 'points':
          return b.points - a.points
        case 'level':
          return b.level - a.level
        case 'petLevel':
          return b.petLevel - a.petLevel
        case 'pkWins':
          return 0
        default:
          return 0
      }
    })

    sorted.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return sorted
  }

  function getLevelByExp(exp: number): number {
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (exp >= thresholds[i]) {
        return i + 1
      }
    }
    return 1
  }

  return {
    achievements,
    consecutiveLoginDays,
    totalPkWins,
    socialInteractions,
    initAchievements,
    checkAchievements,
    unlockAchievement,
    recordLogin,
    recordPkWin,
    recordSocialInteraction,
    getRanking
  }
}, {
  persist: true
})
