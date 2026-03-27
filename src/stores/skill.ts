import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { Skill } from '@/types'
import { SKILL_LIST } from '@/types'
import { usePetStore } from './pet'
import { useEquipmentStore } from './equipment'

export const useSkillStore = defineStore('skill', () => {
  const allSkills = computed(() => {
    return SKILL_LIST.map((skill, index) => ({
      ...skill,
      id: `skill_${index}`
    }))
  })

  function getSkillById(id: string): Skill | undefined {
    const index = parseInt(id.split('_')[1])
    const template = SKILL_LIST[index]
    if (!template) return undefined
    return { ...template, id }
  }

  function canLearnSkill(petId: string, skillId: string): { canLearn: boolean; reason: string } {
    const petStore = usePetStore()
    const equipmentStore = useEquipmentStore()
    
    const pet = petStore.getPetById(petId)
    const skill = getSkillById(skillId)
    
    if (!pet || !skill) {
      return { canLearn: false, reason: '宠物或技能不存在' }
    }

    if (pet.skills.includes(skillId)) {
      return { canLearn: false, reason: '已学习该技能' }
    }

    if (pet.level < skill.requiredLevel) {
      return { canLearn: false, reason: `需要宠物等级 ${skill.requiredLevel}` }
    }

    if (skill.requiredEquipment) {
      const hasEquipment = pet.equipmentSlots[skill.requiredEquipment.slot as 'weapon' | 'armor' | 'accessory']
      if (!hasEquipment) {
        return { canLearn: false, reason: `需要装备 ${skill.requiredEquipment.slot}` }
      }
      
      const equipment = equipmentStore.getEquipmentById(hasEquipment)
      if (equipment && equipment.rarity !== skill.requiredEquipment.rarity) {
        return { canLearn: false, reason: `需要 ${skill.requiredEquipment.rarity} 品质的装备` }
      }
    }

    return { canLearn: true, reason: '' }
  }

  function learnSkillForPet(petId: string, skillId: string): boolean {
    const petStore = usePetStore()
    const result = canLearnSkill(petId, skillId)
    
    if (!result.canLearn) return false
    
    return petStore.learnSkill(petId, skillId)
  }

  function getAvailableSkillsForPet(petId: string): Skill[] {
    return allSkills.value.filter(skill => {
      const result = canLearnSkill(petId, skill.id)
      return result.canLearn
    })
  }

  return {
    allSkills,
    getSkillById,
    canLearnSkill,
    learnSkillForPet,
    getAvailableSkillsForPet
  }
}, {
  persist: true
})
