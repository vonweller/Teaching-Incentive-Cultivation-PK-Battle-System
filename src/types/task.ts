export type TaskType = 'homework' | 'attendance' | 'praise' | 'daily'
export type TaskStatus = 'pending' | 'completed' | 'failed'

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  reward: {
    exp: number
    coins: number
    points: number
  }
  status: TaskStatus
  completedAt?: number
  createdAt: number
  expiresAt?: number
}

export interface DailyTask {
  id: string
  title: string
  description: string
  reward: {
    exp: number
    coins: number
    points: number
  }
  target: number
  progress: number
  completed: boolean
  claimed: boolean
}

export const DAILY_TASK_TEMPLATES: Omit<DailyTask, 'id' | 'progress' | 'completed' | 'claimed'>[] = [
  {
    title: '每日签到',
    description: '登录游戏完成签到',
    reward: { exp: 10, coins: 20, points: 5 },
    target: 1
  },
  {
    title: '完成作业',
    description: '完成老师布置的作业',
    reward: { exp: 30, coins: 50, points: 20 },
    target: 1
  },
  {
    title: '课堂表现',
    description: '在课堂上积极回答问题',
    reward: { exp: 20, coins: 30, points: 15 },
    target: 3
  },
  {
    title: '宠物训练',
    description: '进行宠物PK对战',
    reward: { exp: 15, coins: 25, points: 10 },
    target: 3
  },
  {
    title: '学习打卡',
    description: '累计在线学习时长',
    reward: { exp: 25, coins: 40, points: 15 },
    target: 30
  }
]
