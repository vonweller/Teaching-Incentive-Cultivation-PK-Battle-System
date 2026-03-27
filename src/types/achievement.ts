export type AchievementCategory = 'learning' | 'pet' | 'social' | 'special'
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'diamond'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  rarity: AchievementRarity
  icon: string
  reward: {
    exp: number
    coins: number
    title?: string
    item?: string
  }
  requirement: {
    type: string
    value: number
  }
  unlocked: boolean
  unlockedAt?: number
}

export const ACHIEVEMENT_LIST: Omit<Achievement, 'id' | 'unlocked' | 'unlockedAt'>[] = [
  {
    name: '初来乍到',
    description: '完成账号注册',
    category: 'special',
    rarity: 'bronze',
    icon: '🎉',
    reward: { exp: 50, coins: 100 },
    requirement: { type: 'register', value: 1 }
  },
  {
    name: '勤奋学子',
    description: '连续签到7天',
    category: 'learning',
    rarity: 'silver',
    icon: '📅',
    reward: { exp: 100, coins: 200 },
    requirement: { type: 'consecutive_login', value: 7 }
  },
  {
    name: '学霸之路',
    description: '累计获得1000积分',
    category: 'learning',
    rarity: 'gold',
    icon: '📚',
    reward: { exp: 200, coins: 500, title: '学霸' },
    requirement: { type: 'total_points', value: 1000 }
  },
  {
    name: '宠物大师',
    description: '宠物达到20级',
    category: 'pet',
    rarity: 'diamond',
    icon: '🏆',
    reward: { exp: 500, coins: 1000, title: '宠物大师' },
    requirement: { type: 'pet_level', value: 20 }
  },
  {
    name: '百战百胜',
    description: 'PK对战胜利50场',
    category: 'pet',
    rarity: 'gold',
    icon: '⚔️',
    reward: { exp: 300, coins: 600 },
    requirement: { type: 'pk_wins', value: 50 }
  },
  {
    name: '社交达人',
    description: '与10位同学互动',
    category: 'social',
    rarity: 'silver',
    icon: '🤝',
    reward: { exp: 100, coins: 200 },
    requirement: { type: 'social_interactions', value: 10 }
  },
  {
    name: '传奇学霸',
    description: '达到最高等级',
    category: 'special',
    rarity: 'diamond',
    icon: '👑',
    reward: { exp: 1000, coins: 2000, title: '传奇学霸' },
    requirement: { type: 'player_level', value: 10 }
  }
]
