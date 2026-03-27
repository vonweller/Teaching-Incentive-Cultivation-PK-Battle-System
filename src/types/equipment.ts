export type EquipmentSlot = 'weapon' | 'armor' | 'accessory'
export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface EquipmentStats {
  attack?: number
  defense?: number
  speed?: number
  health?: number
  critical?: number
}

export interface Equipment {
  id: string
  name: string
  slot: EquipmentSlot
  rarity: EquipmentRarity
  stats: EquipmentStats
  icon: string
  description: string
  price: number
  requiredLevel: number
}

export const EQUIPMENT_LIST: Omit<Equipment, 'id'>[] = [
  {
    name: '木剑',
    slot: 'weapon',
    rarity: 'common',
    stats: { attack: 3 },
    icon: '🗡️',
    description: '新手入门武器',
    price: 50,
    requiredLevel: 1
  },
  {
    name: '铁剑',
    slot: 'weapon',
    rarity: 'rare',
    stats: { attack: 8, critical: 2 },
    icon: '⚔️',
    description: '坚固的铁制武器',
    price: 200,
    requiredLevel: 5
  },
  {
    name: '烈焰剑',
    slot: 'weapon',
    rarity: 'epic',
    stats: { attack: 15, critical: 5 },
    icon: '🔥',
    description: '蕴含火焰之力的神剑',
    price: 500,
    requiredLevel: 10
  },
  {
    name: '龙牙剑',
    slot: 'weapon',
    rarity: 'legendary',
    stats: { attack: 25, critical: 10 },
    icon: '🐉',
    description: '传说中龙牙打造的武器',
    price: 1000,
    requiredLevel: 15
  },
  {
    name: '布衣',
    slot: 'armor',
    rarity: 'common',
    stats: { defense: 3, health: 10 },
    icon: '👕',
    description: '简单的防护服',
    price: 50,
    requiredLevel: 1
  },
  {
    name: '铁甲',
    slot: 'armor',
    rarity: 'rare',
    stats: { defense: 8, health: 30 },
    icon: '🛡️',
    description: '坚固的铁制护甲',
    price: 200,
    requiredLevel: 5
  },
  {
    name: '龙鳞甲',
    slot: 'armor',
    rarity: 'epic',
    stats: { defense: 15, health: 60 },
    icon: '🔰',
    description: '龙鳞制成的强力护甲',
    price: 500,
    requiredLevel: 10
  },
  {
    name: '圣光甲',
    slot: 'armor',
    rarity: 'legendary',
    stats: { defense: 25, health: 100 },
    icon: '✨',
    description: '神圣光芒凝聚的护甲',
    price: 1000,
    requiredLevel: 15
  },
  {
    name: '幸运符',
    slot: 'accessory',
    rarity: 'common',
    stats: { critical: 3 },
    icon: '🍀',
    description: '带来好运的护符',
    price: 50,
    requiredLevel: 1
  },
  {
    name: '疾风靴',
    slot: 'accessory',
    rarity: 'rare',
    stats: { speed: 10 },
    icon: '👟',
    description: '提升移动速度的靴子',
    price: 200,
    requiredLevel: 5
  },
  {
    name: '力量项链',
    slot: 'accessory',
    rarity: 'epic',
    stats: { attack: 5, defense: 5, speed: 5 },
    icon: '📿',
    description: '全面提升属性的项链',
    price: 500,
    requiredLevel: 10
  },
  {
    name: '天使之翼',
    slot: 'accessory',
    rarity: 'legendary',
    stats: { attack: 10, defense: 10, speed: 15, critical: 10 },
    icon: '👼',
    description: '天使赐予的神圣饰品',
    price: 1000,
    requiredLevel: 15
  }
]
