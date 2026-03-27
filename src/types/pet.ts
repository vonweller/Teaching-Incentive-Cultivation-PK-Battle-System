export type PetType = 'dragon' | 'phoenix' | 'tiger' | 'rabbit' | 'turtle'
export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface PetStats {
  attack: number
  defense: number
  speed: number
  health: number
  critical: number
}

export interface Pet {
  id: string
  name: string
  type: PetType
  rarity: PetRarity
  level: number
  exp: number
  ownerId: string
  baseStats: PetStats
  equipmentSlots: {
    weapon: string | null
    armor: string | null
    accessory: string | null
  }
  skills: string[]
  wins: number
  losses: number
  createdAt: number
}

export interface PetTemplate {
  type: PetType
  name: string
  rarity: PetRarity
  baseStats: PetStats
  description: string
}

export const PET_TEMPLATES: PetTemplate[] = [
  {
    type: 'dragon',
    name: '小火龙',
    rarity: 'rare',
    baseStats: { attack: 15, defense: 8, speed: 12, health: 100, critical: 10 },
    description: '传说中的龙族后裔，拥有强大的火焰力量'
  },
  {
    type: 'phoenix',
    name: '凤凰雏鸟',
    rarity: 'legendary',
    baseStats: { attack: 18, defense: 6, speed: 15, health: 80, critical: 15 },
    description: '浴火重生的神鸟，速度与攻击兼备'
  },
  {
    type: 'tiger',
    name: '小老虎',
    rarity: 'epic',
    baseStats: { attack: 14, defense: 12, speed: 10, health: 120, critical: 8 },
    description: '森林之王的后代，攻防均衡'
  },
  {
    type: 'rabbit',
    name: '萌萌兔',
    rarity: 'common',
    baseStats: { attack: 8, defense: 6, speed: 18, health: 70, critical: 12 },
    description: '可爱的小兔子，速度极快'
  },
  {
    type: 'turtle',
    name: '玄龟',
    rarity: 'common',
    baseStats: { attack: 6, defense: 18, speed: 5, health: 150, critical: 5 },
    description: '长寿的象征，防御力惊人'
  }
]

export const PET_LEVEL_THRESHOLDS: PetExperienceThreshold[] = [
  { level: 1, requiredExp: 0, title: '幼年期' },
  { level: 5, requiredExp: 200, title: '成长期' },
  { level: 10, requiredExp: 600, title: '成熟期' },
  { level: 15, requiredExp: 1200, title: '完全体' },
  { level: 20, requiredExp: 2000, title: '究极体' }
]

export interface PetExperienceThreshold {
  level: number
  requiredExp: number
  title: string
}

export function getPetLevelByExp(exp: number): number {
  for (let i = PET_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (exp >= PET_LEVEL_THRESHOLDS[i].requiredExp) {
      return PET_LEVEL_THRESHOLDS[i].level
    }
  }
  return 1
}

export function getPetStage(level: number): string {
  for (let i = PET_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (level >= PET_LEVEL_THRESHOLDS[i].level) {
      return PET_LEVEL_THRESHOLDS[i].title
    }
  }
  return '幼年期'
}
