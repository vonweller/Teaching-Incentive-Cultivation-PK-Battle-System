import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePetAssetStore } from './petAsset'
import { useUserStore } from './user'
import type { PetAssetForm, User } from '@/types'

describe('PetAsset Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const createMockUser = (role: 'teacher' | 'student', id: string, name: string): User => ({
    id,
    name,
    role,
    username: id,
    password: 'password',
    points: 0,
    coins: 0,
    exp: 0,
    level: 1,
    avatar: '',
    appearance: { hair: 1, face: 1, body: 1, accessory: 1 },
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  })

  describe('Pet Asset Management', () => {
    it('should create a pet asset', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const formData: PetAssetForm = {
        name: '小火龙',
        description: '一只可爱的小火龙',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 5, requiredExp: 500, requiredWins: 3, requiredTasks: 10 }
      }

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      const asset = store.createPetAsset(formData, mockFile, 'gif')

      expect(asset).toBeDefined()
      expect(asset.name).toBe('小火龙')
      expect(asset.tier).toBe('basic')
      expect(asset.type).toBe('dragon')
      expect(asset.fileType).toBe('gif')
      expect(asset.status).toBe('active')
      expect(store.petAssets).toHaveLength(1)
    })

    it('should create a pet asset with image type', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const formData: PetAssetForm = {
        name: '小火龙',
        description: '一只可爱的小火龙',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 5, requiredExp: 500, requiredWins: 3, requiredTasks: 10 }
      }

      const mockFile = new File(['png content'], 'dragon.png', { type: 'image/png' })
      const asset = store.createPetAsset(formData, mockFile, 'image')

      expect(asset).toBeDefined()
      expect(asset.fileType).toBe('image')
      expect(asset.status).toBe('active')
    })

    it('should filter active assets', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const formData: PetAssetForm = {
        name: '小火龙',
        description: '一只可爱的小火龙',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 5, requiredExp: 500, requiredWins: 3, requiredTasks: 10 }
      }

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      store.createPetAsset(formData, mockFile, 'gif')

      expect(store.activeAssets).toHaveLength(1)
      
      const assetId = store.petAssets[0].id
      store.deletePetAsset(assetId)
      
      expect(store.activeAssets).toHaveLength(0)
    })

    it('should get basic tier assets only', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      
      store.createPetAsset({
        name: '小火龙',
        description: '基础形态',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 5, requiredExp: 500, requiredWins: 3, requiredTasks: 10 }
      }, mockFile, 'gif')

      store.createPetAsset({
        name: '火恐龙',
        description: '进阶形态',
        type: 'dragon',
        tier: 'advanced',
        statsBonus: { attack: 10, defense: 6, speed: 8, health: 20, critical: 4 },
        evolutionConditions: { requiredLevel: 10, requiredExp: 1000, requiredWins: 10, requiredTasks: 20 }
      }, mockFile, 'gif')

      expect(store.basicAssets).toHaveLength(1)
      expect(store.basicAssets[0].tier).toBe('basic')
    })
  })

  describe('Pet Adoption', () => {
    it('should allow student to adopt a basic tier pet', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      const asset = store.createPetAsset({
        name: '小火龙',
        description: '基础形态',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 5, requiredExp: 500, requiredWins: 3, requiredTasks: 10 }
      }, mockFile, 'gif')

      userStore.currentUser = createMockUser('student', 'student1', 'Test Student')

      const pet = store.adoptPet(asset.id, '我的小宠物')

      expect(pet).toBeDefined()
      expect(pet?.name).toBe('我的小宠物')
      expect(pet?.currentTier).toBe('basic')
      expect(pet?.ownerId).toBe('student1')
      expect(store.currentUserPet).toBeDefined()
    })

    it('should not allow adopting non-basic tier pets', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      const asset = store.createPetAsset({
        name: '火恐龙',
        description: '进阶形态',
        type: 'dragon',
        tier: 'advanced',
        statsBonus: { attack: 10, defense: 6, speed: 8, health: 20, critical: 4 },
        evolutionConditions: { requiredLevel: 10, requiredExp: 1000, requiredWins: 10, requiredTasks: 20 }
      }, mockFile, 'gif')

      userStore.currentUser = createMockUser('student', 'student1', 'Test Student')

      const pet = store.adoptPet(asset.id, '我的小宠物')

      expect(pet).toBeNull()
    })

    it('should not allow adopting multiple pets', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      const asset1 = store.createPetAsset({
        name: '小火龙',
        description: '基础形态',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 5, requiredExp: 500, requiredWins: 3, requiredTasks: 10 }
      }, mockFile, 'gif')

      const asset2 = store.createPetAsset({
        name: '小水龙',
        description: '基础形态',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 4, defense: 5, speed: 3, health: 12, critical: 1 },
        evolutionConditions: { requiredLevel: 5, requiredExp: 500, requiredWins: 3, requiredTasks: 10 }
      }, mockFile, 'gif')

      userStore.currentUser = createMockUser('student', 'student1', 'Test Student')

      const pet1 = store.adoptPet(asset1.id, '宠物1')
      expect(pet1).toBeDefined()

      const pet2 = store.adoptPet(asset2.id, '宠物2')
      expect(pet2).toBeNull()
    })
  })

  describe('Pet Evolution', () => {
    it('should check evolution conditions correctly', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      
      const basicAsset = store.createPetAsset({
        name: '小火龙',
        description: '基础形态',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 1, requiredExp: 0, requiredWins: 0, requiredTasks: 0 }
      }, mockFile, 'gif')

      store.createPetAsset({
        name: '火恐龙',
        description: '进阶形态',
        type: 'dragon',
        tier: 'advanced',
        statsBonus: { attack: 10, defense: 6, speed: 8, health: 20, critical: 4 },
        evolutionConditions: { requiredLevel: 10, requiredExp: 1000, requiredWins: 5, requiredTasks: 20 }
      }, mockFile, 'gif')

      userStore.currentUser = createMockUser('student', 'student1', 'Test Student')

      const pet = store.adoptPet(basicAsset.id, '我的小宠物')
      expect(pet).toBeDefined()
      expect(pet!.level).toBe(1)
      expect(pet!.exp).toBe(0)

      const check1 = store.checkEvolution(pet!.id)
      expect(check1.canEvolve).toBe(false)
      expect(check1.reasons).toBeDefined()
      expect(check1.reasons!.length).toBeGreaterThan(0)

      const petRef = store.studentPets.find(p => p.id === pet!.id)!
      petRef.level = 10
      petRef.exp = 1000
      petRef.wins = 5
      petRef.completedTasks = 20

      const check2 = store.checkEvolution(pet!.id)
      expect(check2.canEvolve).toBe(true)
      expect(check2.nextTier).toBe('advanced')
    })

    it('should evolve pet when conditions are met', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      
      const basicAsset = store.createPetAsset({
        name: '小火龙',
        description: '基础形态',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 1, requiredExp: 0, requiredWins: 0, requiredTasks: 0 }
      }, mockFile, 'gif')

      store.createPetAsset({
        name: '火恐龙',
        description: '进阶形态',
        type: 'dragon',
        tier: 'advanced',
        statsBonus: { attack: 10, defense: 6, speed: 8, health: 20, critical: 4 },
        evolutionConditions: { requiredLevel: 1, requiredExp: 0, requiredWins: 0, requiredTasks: 0 }
      }, mockFile, 'gif')

      userStore.currentUser = createMockUser('student', 'student1', 'Test Student')

      const pet = store.adoptPet(basicAsset.id, '我的小宠物')
      expect(pet).toBeDefined()
      expect(pet!.currentTier).toBe('basic')

      const success = store.evolvePet(pet!.id, 'manual')
      expect(success).toBe(true)

      const evolvedPet = store.studentPets.find(p => p.id === pet!.id)
      expect(evolvedPet!.currentTier).toBe('advanced')
      expect(evolvedPet!.unlockedTiers).toContain('advanced')
      expect(evolvedPet!.evolutionHistory).toHaveLength(1)
      expect(evolvedPet!.evolutionHistory[0].fromTier).toBe('basic')
      expect(evolvedPet!.evolutionHistory[0].toTier).toBe('advanced')
      expect(evolvedPet!.evolutionHistory[0].trigger).toBe('manual')
    })

    it('should auto-evolve when adding exp triggers level up', () => {
      const store = usePetAssetStore()
      const userStore = useUserStore()
      
      userStore.currentUser = createMockUser('teacher', 'teacher1', 'Test Teacher')

      const mockFile = new File(['gif content'], 'dragon.gif', { type: 'image/gif' })
      
      const basicAsset = store.createPetAsset({
        name: '小火龙',
        description: '基础形态',
        type: 'dragon',
        tier: 'basic',
        statsBonus: { attack: 5, defense: 3, speed: 4, health: 10, critical: 2 },
        evolutionConditions: { requiredLevel: 1, requiredExp: 0, requiredWins: 0, requiredTasks: 0 }
      }, mockFile, 'gif')

      store.createPetAsset({
        name: '火恐龙',
        description: '进阶形态',
        type: 'dragon',
        tier: 'advanced',
        statsBonus: { attack: 10, defense: 6, speed: 8, health: 20, critical: 4 },
        evolutionConditions: { requiredLevel: 1, requiredExp: 0, requiredWins: 0, requiredTasks: 0 }
      }, mockFile, 'gif')

      userStore.currentUser = createMockUser('student', 'student1', 'Test Student')

      const pet = store.adoptPet(basicAsset.id, '我的小宠物')
      expect(pet).toBeDefined()

      store.addExpToPet(pet!.id, 100)

      const evolvedPet = store.studentPets.find(p => p.id === pet!.id)
      expect(evolvedPet!.currentTier).toBe('advanced')
      expect(evolvedPet!.evolutionHistory[0].trigger).toBe('level_up')
    })
  })
})
