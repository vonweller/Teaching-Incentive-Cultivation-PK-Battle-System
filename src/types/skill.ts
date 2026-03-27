export type SkillType = 'attack' | 'defense' | 'buff' | 'debuff'
export type SkillTarget = 'self' | 'enemy' | 'all'

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff'
  value: number
  duration?: number
  stat?: string
}

export interface Skill {
  id: string
  name: string
  type: SkillType
  target: SkillTarget
  effects: SkillEffect[]
  cooldown: number
  description: string
  icon: string
  requiredLevel: number
  requiredEquipment?: {
    slot: string
    rarity: string
  }
}

export const SKILL_LIST: Omit<Skill, 'id'>[] = [
  {
    name: '猛击',
    type: 'attack',
    target: 'enemy',
    effects: [{ type: 'damage', value: 20 }],
    cooldown: 0,
    description: '基础攻击技能',
    icon: '👊',
    requiredLevel: 1
  },
  {
    name: '火焰吐息',
    type: 'attack',
    target: 'enemy',
    effects: [{ type: 'damage', value: 35 }],
    cooldown: 2,
    description: '喷出火焰造成大量伤害',
    icon: '🔥',
    requiredLevel: 5,
    requiredEquipment: { slot: 'weapon', rarity: 'rare' }
  },
  {
    name: '龙卷风',
    type: 'attack',
    target: 'enemy',
    effects: [{ type: 'damage', value: 50 }],
    cooldown: 3,
    description: '召唤龙卷风造成巨大伤害',
    icon: '🌪️',
    requiredLevel: 10,
    requiredEquipment: { slot: 'weapon', rarity: 'epic' }
  },
  {
    name: '神圣审判',
    type: 'attack',
    target: 'enemy',
    effects: [{ type: 'damage', value: 80 }],
    cooldown: 4,
    description: '神圣力量的终极攻击',
    icon: '⚡',
    requiredLevel: 15,
    requiredEquipment: { slot: 'weapon', rarity: 'legendary' }
  },
  {
    name: '铁壁',
    type: 'defense',
    target: 'self',
    effects: [{ type: 'buff', value: 50, duration: 2, stat: 'defense' }],
    cooldown: 3,
    description: '大幅提升防御力',
    icon: '🛡️',
    requiredLevel: 3
  },
  {
    name: '治愈之光',
    type: 'buff',
    target: 'self',
    effects: [{ type: 'heal', value: 30 }],
    cooldown: 2,
    description: '恢复生命值',
    icon: '💚',
    requiredLevel: 5
  },
  {
    name: '疾风步',
    type: 'buff',
    target: 'self',
    effects: [{ type: 'buff', value: 30, duration: 2, stat: 'speed' }],
    cooldown: 3,
    description: '大幅提升速度',
    icon: '💨',
    requiredLevel: 7
  },
  {
    name: '弱点洞察',
    type: 'debuff',
    target: 'enemy',
    effects: [{ type: 'debuff', value: 20, duration: 2, stat: 'defense' }],
    cooldown: 2,
    description: '降低敌人防御',
    icon: '👁️',
    requiredLevel: 8
  }
]
