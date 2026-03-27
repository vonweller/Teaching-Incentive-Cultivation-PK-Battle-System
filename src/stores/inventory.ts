import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Equipment } from '@/types'
import { useUserStore } from './user'
import { usePetAssetStore } from './petAsset'

// 背包物品接口
export interface InventoryItem extends Equipment {
  obtainedAt: number
  isEquipped: boolean
  equippedTo?: string // 装备到的宠物ID
}

// 装备槽位类型
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory'

export const useInventoryStore = defineStore('inventory', () => {
  // 背包物品列表
  const items = ref<InventoryItem[]>([])

  const userStore = useUserStore()
  const petAssetStore = usePetAssetStore()

  // 获取所有背包物品
  const allItems = computed(() => items.value)

  // 获取未装备的物品
  const unequippedItems = computed(() => 
    items.value.filter(item => !item.isEquipped)
  )

  // 获取已装备的物品
  const equippedItems = computed(() => 
    items.value.filter(item => item.isEquipped)
  )

  // 按槽位获取物品
  function getItemsBySlot(slot: EquipmentSlot): InventoryItem[] {
    return items.value.filter(item => item.slot === slot && !item.isEquipped)
  }

  // 获取当前宠物的装备
  function getPetEquipment(petId: string): Record<EquipmentSlot, InventoryItem | null> {
    const equipped: Record<EquipmentSlot, InventoryItem | null> = {
      weapon: null,
      armor: null,
      accessory: null
    }

    items.value
      .filter(item => item.isEquipped && item.equippedTo === petId)
      .forEach(item => {
        equipped[item.slot as EquipmentSlot] = item
      })

    return equipped
  }

  // 添加物品到背包（购买时调用）
  function addItem(equipment: Equipment): boolean {
    const newItem: InventoryItem = {
      ...equipment,
      obtainedAt: Date.now(),
      isEquipped: false
    }
    items.value.push(newItem)
    return true
  }

  // 装备物品到宠物
  function equipItem(itemId: string, petId: string): boolean {
    const item = items.value.find(i => i.id === itemId)
    if (!item) return false

    // 检查宠物是否存在
    const pet = petAssetStore.studentPets.find(p => p.id === petId)
    if (!pet) return false

    // 检查是否已有同类型装备
    const existingEquipped = items.value.find(
      i => i.isEquipped && i.equippedTo === petId && i.slot === item.slot
    )

    // 如果已有同类型装备，先卸下
    if (existingEquipped) {
      unequipItem(existingEquipped.id)
    }

    // 装备新物品
    item.isEquipped = true
    item.equippedTo = petId

    return true
  }

  // 卸下装备
  function unequipItem(itemId: string): boolean {
    const item = items.value.find(i => i.id === itemId)
    if (!item || !item.isEquipped) return false

    item.isEquipped = false
    item.equippedTo = undefined

    return true
  }

  // 出售物品（50%价格）
  function sellItem(itemId: string): { success: boolean; coinsReceived: number } {
    const itemIndex = items.value.findIndex(i => i.id === itemId)
    if (itemIndex === -1) return { success: false, coinsReceived: 0 }

    const item = items.value[itemIndex]

    // 已装备的物品不能出售
    if (item.isEquipped) {
      return { success: false, coinsReceived: 0 }
    }

    // 计算出售价格（50%）
    const sellPrice = Math.floor(item.price * 0.5)

    // 添加金币
    userStore.addCoins(sellPrice)

    // 从背包移除
    items.value.splice(itemIndex, 1)

    return { success: true, coinsReceived: sellPrice }
  }

  // 批量出售物品
  function sellItems(itemIds: string[]): { success: boolean; totalCoins: number; soldCount: number } {
    let totalCoins = 0
    let soldCount = 0

    // 过滤掉已装备的物品
    const itemsToSell = itemIds.filter(id => {
      const item = items.value.find(i => i.id === id)
      return item && !item.isEquipped
    })

    itemsToSell.forEach(id => {
      const result = sellItem(id)
      if (result.success) {
        totalCoins += result.coinsReceived
        soldCount++
      }
    })

    return { success: soldCount > 0, totalCoins, soldCount }
  }

  // 检查物品是否已装备
  function isEquipped(itemId: string): boolean {
    const item = items.value.find(i => i.id === itemId)
    return item?.isEquipped || false
  }

  // 获取物品详情
  function getItem(itemId: string): InventoryItem | undefined {
    return items.value.find(i => i.id === itemId)
  }

  // 获取装备总属性加成
  function getTotalStatsBonus(petId: string): {
    attack: number
    defense: number
    speed: number
    health: number
    critical: number
  } {
    const equipped = getPetEquipment(petId)
    const bonus = {
      attack: 0,
      defense: 0,
      speed: 0,
      health: 0,
      critical: 0
    }

    Object.values(equipped).forEach(item => {
      if (item) {
        bonus.attack += item.stats.attack || 0
        bonus.defense += item.stats.defense || 0
        bonus.speed += item.stats.speed || 0
        bonus.health += item.stats.health || 0
        bonus.critical += item.stats.critical || 0
      }
    })

    return bonus
  }

  return {
    items,
    allItems,
    unequippedItems,
    equippedItems,
    getItemsBySlot,
    getPetEquipment,
    addItem,
    equipItem,
    unequipItem,
    sellItem,
    sellItems,
    isEquipped,
    getItem,
    getTotalStatsBonus
  }
}, {
  persist: true
})
