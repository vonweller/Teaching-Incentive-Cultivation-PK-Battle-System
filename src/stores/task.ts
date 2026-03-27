import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DailyTask, Task } from '@/types'
import { DAILY_TASK_TEMPLATES } from '@/types'
import { useUserStore } from './user'

export const useTaskStore = defineStore('task', () => {
  const dailyTasks = ref<DailyTask[]>([])
  const completedTasks = ref<Task[]>([])
  const lastResetDate = ref<string>('')

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function getTodayString(): string {
    return new Date().toISOString().split('T')[0]
  }

  function resetDailyTasksIfNeeded() {
    const today = getTodayString()
    if (lastResetDate.value !== today) {
      dailyTasks.value = DAILY_TASK_TEMPLATES.map(template => ({
        ...template,
        id: generateId(),
        progress: 0,
        completed: false,
        claimed: false
      }))
      lastResetDate.value = today
    }
  }

  function updateTaskProgress(taskType: string, amount: number = 1) {
    resetDailyTasksIfNeeded()
    
    dailyTasks.value.forEach(task => {
      if (task.title.includes(taskType) || task.description.includes(taskType)) {
        if (!task.completed) {
          task.progress = Math.min(task.progress + amount, task.target)
          if (task.progress >= task.target) {
            task.completed = true
          }
        }
      }
    })
  }

  function claimTaskReward(taskId: string): boolean {
    const task = dailyTasks.value.find(t => t.id === taskId)
    if (!task || !task.completed || task.claimed) return false

    const userStore = useUserStore()
    userStore.addExp(task.reward.exp)
    userStore.addCoins(task.reward.coins)
    userStore.addPoints(task.reward.points)
    
    task.claimed = true
    return true
  }

  function completeHomework(studentId: string, reward: { exp: number; coins: number; points: number }) {
    const userStore = useUserStore()
    const student = userStore.getUserById(studentId)
    
    if (student) {
      userStore.currentUser = student
      userStore.addExp(reward.exp)
      userStore.addCoins(reward.coins)
      userStore.addPoints(reward.points)
      
      updateTaskProgress('作业', 1)
    }
  }

  function recordAttendance(_studentId: string) {
    updateTaskProgress('签到', 1)
  }

  function recordClassPerformance(_studentId: string) {
    updateTaskProgress('课堂', 1)
  }

  function getDailyTasks(): DailyTask[] {
    resetDailyTasksIfNeeded()
    return dailyTasks.value
  }

  return {
    dailyTasks,
    completedTasks,
    lastResetDate,
    resetDailyTasksIfNeeded,
    updateTaskProgress,
    claimTaskReward,
    completeHomework,
    recordAttendance,
    recordClassPerformance,
    getDailyTasks
  }
}, {
  persist: true
})
