import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pet, PetType, PetStats } from '@/types'
import { PET_TEMPLATES, getPetLevelByExp } from '@/types'
import { useUserStore } from './user'

export const usePetStore = defineStore('pet', () => {
  const pets = ref<Pet[]>([])
  const currentPetId = ref<string | null>(null)

  const currentPet = computed(() => {
    const userStore = useUserStore()
    if (!currentPetId.value || !userStore.currentUser) return null
    // 关键修复：验证宠物所有权，防止数据泄露
    return pets.value.find(p => p.id === currentPetId.value && p.ownerId === userStore.currentUser!.id) || null
  })

  const userPets = computed(() => {
    const userStore = useUserStore()
    if (!userStore.currentUser) return []
    return pets.value.filter(p => p.ownerId === userStore.currentUser!.id)
  })

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function createPet(type: PetType, name: string): Pet {
    const userStore = useUserStore()
    const template = PET_TEMPLATES.find(t => t.type === type)
    
    if (!template) {
      throw new Error('Invalid pet type')
    }

    const newPet: Pet = {
      id: generateId(),
      name,
      type,
      rarity: template.rarity,
      level: 1,
      exp: 0,
      ownerId: userStore.currentUser!.id,
      baseStats: { ...template.baseStats },
      equipmentSlots: {
        weapon: null,
        armor: null,
        accessory: null
      },
      skills: ['skill_basic_attack'],
      wins: 0,
      losses: 0,
      createdAt: Date.now()
    }

    pets.value.push(newPet)
    if (!currentPetId.value) {
      currentPetId.value = newPet.id
    }

    return newPet
  }

  function addExpToPet(petId: string, amount: number) {
    const pet = pets.value.find(p => p.id === petId)
    if (!pet) return

    const oldLevel = pet.level
    pet.exp += amount
    pet.level = getPetLevelByExp(pet.exp)

    if (pet.level > oldLevel) {
      onPetLevelUp(pet, oldLevel, pet.level)
    }
  }

  function getPetTotalStats(petId: string): PetStats {
    const pet = pets.value.find(p => p.id === petId)
    if (!pet) return { attack: 0, defense: 0, speed: 0, health: 0, critical: 0 }

    const stats = { ...pet.baseStats }
    
    const levelBonus = Math.floor(pet.level / 5)
    stats.attack += levelBonus * 2
    stats.defense += levelBonus * 2
    stats.speed += levelBonus
    stats.health += levelBonus * 10
    stats.critical += levelBonus

    return stats
  }

  function equipItem(petId: string, slot: 'weapon' | 'armor' | 'accessory', equipmentId: string | null) {
    const pet = pets.value.find(p => p.id === petId)
    if (!pet) return false

    pet.equipmentSlots[slot] = equipmentId
    return true
  }

  function learnSkill(petId: string, skillId: string) {
    const pet = pets.value.find(p => p.id === petId)
    if (!pet || pet.skills.includes(skillId)) return false

    pet.skills.push(skillId)
    return true
  }

  function recordBattleResult(petId: string, isWin: boolean) {
    const pet = pets.value.find(p => p.id === petId)
    if (!pet) return

    if (isWin) {
      pet.wins++
    } else {
      pet.losses++
    }
  }

  function onPetLevelUp(pet: Pet, oldLevel: number, newLevel: number) {
    console.log(`宠物 ${pet.name} 升级！${oldLevel} -> ${newLevel}`)
  }

  function selectPet(petId: string) {
    const userStore = useUserStore()
    // 关键修复：验证宠物所有权后才允许选择
    const pet = pets.value.find(p => p.id === petId && p.ownerId === userStore.currentUser?.id)
    if (pet) {
      currentPetId.value = petId
    }
  }

  function getPetById(id: string): Pet | undefined {
    const userStore = useUserStore()
    // 关键修复：验证宠物所有权
    return pets.value.find(p => p.id === id && p.ownerId === userStore.currentUser?.id)
  }

  // 关键修复：用户切换时重置当前宠物ID
  function resetCurrentPet() {
    currentPetId.value = null
  }

  // 关键修复：初始化当前用户的宠物选择
  function initUserPet() {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      currentPetId.value = null
      return
    }
    // 查找当前用户的第一个宠物
    const userPet = pets.value.find(p => p.ownerId === userStore.currentUser!.id)
    if (userPet) {
      currentPetId.value = userPet.id
    } else {
      currentPetId.value = null
    }
  }

  return {
    pets,
    currentPetId,
    currentPet,
    userPets,
    createPet,
    addExpToPet,
    getPetTotalStats,
    equipItem,
    learnSkill,
    recordBattleResult,
    selectPet,
    getPetById,
    resetCurrentPet,
    initUserPet
  }
}, {
  persist: true
})
