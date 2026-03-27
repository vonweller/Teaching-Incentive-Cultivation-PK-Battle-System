export type PetAssetTier = 'basic' | 'advanced' | 'intermediate' | 'master' | 'legendary'
export type PetAssetStatus = 'active' | 'inactive' | 'deleted'

export interface PetAsset {
  id: string
  name: string
  description: string
  type: string
  tier: PetAssetTier
  gifUrl: string
  previewUrl: string
  fileType: 'image' | 'gif'  // 文件类型：静态图或动态图
  statsBonus: {
    attack?: number
    defense?: number
    speed?: number
    health?: number
    critical?: number
  }
  evolutionConditions: EvolutionCondition
  status: PetAssetStatus
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface EvolutionCondition {
  requiredLevel: number
  requiredExp: number
  requiredWins?: number
  requiredTasks?: number
  requiredAchievements?: string[]
}

export interface PetAssetForm {
  name: string
  description: string
  type: string
  tier: PetAssetTier
  statsBonus: {
    attack: number
    defense: number
    speed: number
    health: number
    critical: number
  }
  evolutionConditions: {
    requiredLevel: number
    requiredExp: number
    requiredWins: number
    requiredTasks: number
  }
}

export const PET_ASSET_TIERS: { value: PetAssetTier; label: string; color: string }[] = [
  { value: 'basic', label: '基础形态', color: '#9ca3af' },
  { value: 'advanced', label: '进阶形态', color: '#3b82f6' },
  { value: 'intermediate', label: '中级形态', color: '#a855f7' },
  { value: 'master', label: '大师形态', color: '#f59e0b' },
  { value: 'legendary', label: '传说形态', color: '#ef4444' }
]

export const PET_ASSET_TYPES = [
  { value: 'dragon', label: '龙系', icon: '🐉' },
  { value: 'phoenix', label: '鸟系', icon: '🦅' },
  { value: 'tiger', label: '虎系', icon: '🐯' },
  { value: 'rabbit', label: '兔系', icon: '🐰' },
  { value: 'turtle', label: '龟系', icon: '🐢' },
  { value: 'wolf', label: '狼系', icon: '🐺' },
  { value: 'bear', label: '熊系', icon: '🐻' },
  { value: 'fox', label: '狐系', icon: '🦊' }
]

export function getTierLabel(tier: PetAssetTier): string {
  const tierInfo = PET_ASSET_TIERS.find(t => t.value === tier)
  return tierInfo?.label || tier
}

export function getTierColor(tier: PetAssetTier): string {
  const tierInfo = PET_ASSET_TIERS.find(t => t.value === tier)
  return tierInfo?.color || '#9ca3af'
}

export function canEvolveToTier(
  _currentTier: PetAssetTier,
  _targetTier: PetAssetTier,
  petStats: {
    level: number
    exp: number
    wins: number
    completedTasks: number
  },
  conditions: EvolutionCondition
): { canEvolve: boolean; reasons: string[] } {
  const reasons: string[] = []
  
  if (petStats.level < conditions.requiredLevel) {
    reasons.push(`需要等级达到 ${conditions.requiredLevel} 级`)
  }
  
  if (petStats.exp < conditions.requiredExp) {
    reasons.push(`需要经验达到 ${conditions.requiredExp}`)
  }
  
  if (conditions.requiredWins && petStats.wins < conditions.requiredWins) {
    reasons.push(`需要胜利场次达到 ${conditions.requiredWins}`)
  }
  
  if (conditions.requiredTasks && petStats.completedTasks < conditions.requiredTasks) {
    reasons.push(`需要完成任务数达到 ${conditions.requiredTasks}`)
  }
  
  return {
    canEvolve: reasons.length === 0,
    reasons
  }
}

export interface StudentPet {
  id: string
  assetId: string
  ownerId: string
  name: string
  currentTier: PetAssetTier
  level: number
  exp: number
  wins: number
  losses: number
  completedTasks: number
  unlockedTiers: PetAssetTier[]
  evolutionHistory: EvolutionRecord[]
  createdAt: number
  lastEvolvedAt?: number
}

export interface EvolutionRecord {
  fromTier: PetAssetTier
  toTier: PetAssetTier
  evolvedAt: number
  trigger: 'level_up' | 'task_complete' | 'battle_win' | 'manual'
}
