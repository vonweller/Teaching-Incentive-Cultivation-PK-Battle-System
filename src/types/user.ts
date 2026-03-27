export type UserRole = 'student' | 'teacher'

export type AppearanceType = 'hair' | 'face' | 'body' | 'accessory'

export interface CharacterAppearance {
  hair: number
  face: number
  body: number
  accessory: number
}

export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  name: string
  avatar: string
  appearance: CharacterAppearance
  level: number
  exp: number
  coins: number
  points: number
  classId?: string
  createdAt: number
  lastLoginAt: number
}

export interface ExperienceThreshold {
  level: number
  requiredExp: number
  title: string
}

export const LEVEL_THRESHOLDS: ExperienceThreshold[] = [
  { level: 1, requiredExp: 0, title: '新手学徒' },
  { level: 2, requiredExp: 100, title: '初级学员' },
  { level: 3, requiredExp: 300, title: '进阶学员' },
  { level: 4, requiredExp: 600, title: '优秀学员' },
  { level: 5, requiredExp: 1000, title: '学霸新星' },
  { level: 6, requiredExp: 1500, title: '知识达人' },
  { level: 7, requiredExp: 2200, title: '学习精英' },
  { level: 8, requiredExp: 3000, title: '学术之星' },
  { level: 9, requiredExp: 4000, title: '智慧大师' },
  { level: 10, requiredExp: 5500, title: '传奇学霸' }
]

export function getLevelByExp(exp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_THRESHOLDS[i].requiredExp) {
      return LEVEL_THRESHOLDS[i].level
    }
  }
  return 1
}

export function getExpForNextLevel(currentLevel: number): number {
  const nextLevel = LEVEL_THRESHOLDS.find(t => t.level === currentLevel + 1)
  return nextLevel ? nextLevel.requiredExp : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].requiredExp
}

export function getTitleByLevel(level: number): string {
  const threshold = LEVEL_THRESHOLDS.find(t => t.level === level)
  return threshold ? threshold.title : '新手学徒'
}

export function getAppearanceTier(level: number): number {
  return Math.floor((level - 1) / 5) + 1
}
