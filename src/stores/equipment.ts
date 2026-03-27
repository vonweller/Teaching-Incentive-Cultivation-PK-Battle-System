import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Equipment } from '@/types'
import { EQUIPMENT_LIST } from '@/types'
import { useUserStore } from './user'

export const useEquipmentStore = defineStore('equipment', () => {
  const ownedEquipment = ref<Equipment[]>([])

  const availableEquipment = computed(() => {
    return EQUIPMENT_LIST.map((eq, index) => ({
      ...eq,
      id: `equip_${index}`
    }))
  })

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function buyEquipment(equipmentId: string): boolean {
    const userStore = useUserStore()
    const template = EQUIPMENT_LIST[parseInt(equipmentId.split('_')[1])]
    
    if (!template) return false

    if (userStore.userLevel < template.requiredLevel) {
      return false
    }

    if (!userStore.deductCoins(template.price)) {
      return false
    }

    const newEquipment: Equipment = {
      id: generateId(),
      ...template
    }

    ownedEquipment.value.push(newEquipment)
    return true
  }

  function getUserEquipment(slot?: 'weapon' | 'armor' | 'accessory'): Equipment[] {
    const userStore = useUserStore()
    if (!userStore.currentUser) return []
    
    let equipment = ownedEquipment.value
    
    if (slot) {
      equipment = equipment.filter(e => e.slot === slot)
    }
    
    return equipment
  }

  function getEquipmentById(id: string): Equipment | undefined {
    return ownedEquipment.value.find(e => e.id === id)
  }

  function hasEquipment(equipmentId: string): boolean {
    return ownedEquipment.value.some(e => e.id === equipmentId)
  }

  return {
    ownedEquipment,
    availableEquipment,
    buyEquipment,
    getUserEquipment,
    getEquipmentById,
    hasEquipment
  }
}, {
  persist: true
})
