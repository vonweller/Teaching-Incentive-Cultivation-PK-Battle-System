import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PetAsset,
  PetAssetTier,
  PetAssetForm,
  StudentPet,
  EvolutionRecord
} from '@/types'
import { useUserStore } from './user'

export const usePetAssetStore = defineStore('petAsset', () => {
  // 宠物素材库
  const petAssets = ref<PetAsset[]>([])
  
  // 学生宠物实例
  const studentPets = ref<StudentPet[]>([])
  
  const userStore = useUserStore()

  // 获取所有激活的宠物素材
  const activeAssets = computed(() => {
    return petAssets.value.filter(asset => asset.status === 'active')
  })

  // 获取基础形态的宠物素材（学生可领养）
  const basicAssets = computed(() => {
    return activeAssets.value.filter(asset => asset.tier === 'basic')
  })

  // 获取当前用户的宠物
  const currentUserPet = computed(() => {
    if (!userStore.currentUser) return null
    return studentPets.value.find(pet => pet.ownerId === userStore.currentUser!.id)
  })

  // 生成唯一ID
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 创建宠物素材
  function createPetAsset(formData: PetAssetForm, imageFile: File, fileType: 'image' | 'gif' = 'gif'): PetAsset {
    const userStore = useUserStore()
    
    // 创建本地URL用于预览
    const imageUrl = URL.createObjectURL(imageFile)
    
    const newAsset: PetAsset = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      tier: formData.tier,
      gifUrl: imageUrl,
      previewUrl: imageUrl,
      fileType,  // 保存文件类型
      statsBonus: formData.statsBonus,
      evolutionConditions: {
        requiredLevel: formData.evolutionConditions.requiredLevel,
        requiredExp: formData.evolutionConditions.requiredExp,
        requiredWins: formData.evolutionConditions.requiredWins || 0,
        requiredTasks: formData.evolutionConditions.requiredTasks || 0
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: userStore.currentUser?.id || 'system'
    }

    petAssets.value.push(newAsset)
    return newAsset
  }

  // 更新宠物素材
  function updatePetAsset(assetId: string, updates: Partial<PetAsset>): boolean {
    const asset = petAssets.value.find(a => a.id === assetId)
    if (!asset) return false

    Object.assign(asset, updates, { updatedAt: Date.now() })
    return true
  }

  // 删除宠物素材（软删除）
  function deletePetAsset(assetId: string): boolean {
    return updatePetAsset(assetId, { status: 'deleted' })
  }

  // 获取特定类型的所有形态素材
  function getAssetsByType(type: string): PetAsset[] {
    return activeAssets.value
      .filter(asset => asset.type === type)
      .sort((a, b) => {
        const tierOrder = ['basic', 'advanced', 'intermediate', 'master', 'legendary']
        return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
      })
  }

  // 获取特定等级的素材
  function getAssetByTypeAndTier(type: string, tier: PetAssetTier): PetAsset | undefined {
    return activeAssets.value.find(asset => 
      asset.type === type && asset.tier === tier
    )
  }

  // 根据ID获取宠物素材
  function getAssetById(assetId: string): PetAsset | undefined {
    return petAssets.value.find(asset => asset.id === assetId)
  }

  // 学生领养宠物
  function adoptPet(assetId: string, petName: string): StudentPet | null {
    const userStore = useUserStore()
    if (!userStore.currentUser) return null

    const asset = petAssets.value.find(a => a.id === assetId)
    if (!asset || asset.tier !== 'basic') return null

    // 检查是否已有宠物
    const existingPet = studentPets.value.find(
      p => p.ownerId === userStore.currentUser!.id
    )
    if (existingPet) return null

    const newPet: StudentPet = {
      id: generateId(),
      assetId,
      ownerId: userStore.currentUser.id,
      name: petName,
      currentTier: 'basic',
      level: 1,
      exp: 0,
      wins: 0,
      losses: 0,
      completedTasks: 0,
      unlockedTiers: ['basic'],
      evolutionHistory: [],
      createdAt: Date.now()
    }

    studentPets.value.push(newPet)
    return newPet
  }

  // 检查宠物是否可以进化
  function checkEvolution(petId: string): {
    canEvolve: boolean
    nextTier?: PetAssetTier
    reasons?: string[]
  } {
    const pet = studentPets.value.find(p => p.id === petId)
    if (!pet) return { canEvolve: false }

    const asset = petAssets.value.find(a => a.id === pet.assetId)
    if (!asset) return { canEvolve: false }

    // 获取下一个等级
    const tierOrder: PetAssetTier[] = ['basic', 'advanced', 'intermediate', 'master', 'legendary']
    const currentIndex = tierOrder.indexOf(pet.currentTier)
    const nextTier = tierOrder[currentIndex + 1]

    if (!nextTier || pet.unlockedTiers.includes(nextTier)) {
      return { canEvolve: false }
    }

    // 查找下一等级的素材
    const nextAsset = getAssetByTypeAndTier(asset.type, nextTier)
    if (!nextAsset) return { canEvolve: false }

    // 检查进化条件
    const conditions = nextAsset.evolutionConditions
    const reasons: string[] = []

    if (pet.level < conditions.requiredLevel) {
      reasons.push(`需要等级达到 ${conditions.requiredLevel} 级`)
    }
    if (pet.exp < conditions.requiredExp) {
      reasons.push(`需要经验达到 ${conditions.requiredExp}`)
    }
    if (conditions.requiredWins && pet.wins < conditions.requiredWins) {
      reasons.push(`需要胜利场次达到 ${conditions.requiredWins}`)
    }
    if (conditions.requiredTasks && pet.completedTasks < conditions.requiredTasks) {
      reasons.push(`需要完成任务数达到 ${conditions.requiredTasks}`)
    }

    return {
      canEvolve: reasons.length === 0,
      nextTier,
      reasons: reasons.length > 0 ? reasons : undefined
    }
  }

  // 进化宠物
  function evolvePet(petId: string, trigger: EvolutionRecord['trigger'] = 'manual'): boolean {
    const check = checkEvolution(petId)
    if (!check.canEvolve || !check.nextTier) return false

    const pet = studentPets.value.find(p => p.id === petId)
    if (!pet) return false

    const fromTier = pet.currentTier
    const toTier = check.nextTier

    // 更新宠物信息
    pet.currentTier = toTier
    pet.unlockedTiers.push(toTier)
    pet.lastEvolvedAt = Date.now()

    // 记录进化历史
    const record: EvolutionRecord = {
      fromTier,
      toTier,
      evolvedAt: Date.now(),
      trigger
    }
    pet.evolutionHistory.push(record)

    return true
  }

  // 自动检查并进化（用于升级后自动触发）
  function autoEvolveIfPossible(petId: string, trigger: EvolutionRecord['trigger']): boolean {
    return evolvePet(petId, trigger)
  }

  // 增加宠物经验
  function addExpToPet(petId: string, amount: number): boolean {
    const pet = studentPets.value.find(p => p.id === petId)
    if (!pet) return false

    pet.exp += amount
    
    // 检查升级
    const newLevel = Math.floor(pet.exp / 100) + 1
    if (newLevel > pet.level) {
      pet.level = newLevel
      // 尝试自动进化
      autoEvolveIfPossible(petId, 'level_up')
    }

    return true
  }

  // 记录战斗结果
  function recordBattle(petId: string, isWin: boolean): boolean {
    const pet = studentPets.value.find(p => p.id === petId)
    if (!pet) return false

    if (isWin) {
      pet.wins++
      autoEvolveIfPossible(petId, 'battle_win')
    } else {
      pet.losses++
    }

    return true
  }

  // 记录任务完成
  function recordTaskComplete(petId: string): boolean {
    const pet = studentPets.value.find(p => p.id === petId)
    if (!pet) return false

    pet.completedTasks++
    autoEvolveIfPossible(petId, 'task_complete')

    return true
  }

  // 获取宠物当前形态的素材
  function getCurrentAsset(petId: string): PetAsset | undefined {
    const pet = studentPets.value.find(p => p.id === petId)
    if (!pet) return undefined

    return getAssetByTypeAndTier(
      petAssets.value.find(a => a.id === pet.assetId)?.type || '',
      pet.currentTier
    )
  }

  // 获取宠物所有已解锁的形态
  function getUnlockedAssets(petId: string): PetAsset[] {
    const pet = studentPets.value.find(p => p.id === petId)
    if (!pet) return []

    const baseAsset = petAssets.value.find(a => a.id === pet.assetId)
    if (!baseAsset) return []

    return pet.unlockedTiers
      .map(tier => getAssetByTypeAndTier(baseAsset.type, tier))
      .filter((asset): asset is PetAsset => asset !== undefined)
  }

  return {
    petAssets,
    studentPets,
    activeAssets,
    basicAssets,
    currentUserPet,
    createPetAsset,
    updatePetAsset,
    deletePetAsset,
    getAssetsByType,
    getAssetByTypeAndTier,
    getAssetById,
    adoptPet,
    checkEvolution,
    evolvePet,
    autoEvolveIfPossible,
    addExpToPet,
    recordBattle,
    recordTaskComplete,
    getCurrentAsset,
    getUnlockedAssets
  }
}, {
  persist: true
})
