<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePetStore } from '@/stores/pet'
import { useEquipmentStore } from '@/stores/equipment'
import { useSkillStore } from '@/stores/skill'


const router = useRouter()
const userStore = useUserStore()
const petStore = usePetStore()
const equipmentStore = useEquipmentStore()
const skillStore = useSkillStore()

const activeTab = ref<'info' | 'equipment' | 'skills'>('info')
const showEquipModal = ref(false)
const selectedSlot = ref<'weapon' | 'armor' | 'accessory' | null>(null)

const petTypes = [
  { type: 'dragon', icon: '🐉' },
  { type: 'phoenix', icon: '🦅' },
  { type: 'tiger', icon: '🐯' },
  { type: 'rabbit', icon: '🐰' },
  { type: 'turtle', icon: '🐢' }
]

const menuItems = [
  { name: 'StudentHome', icon: '🏠', label: '首页' },
  { name: 'StudentPet', icon: '🐾', label: '我的宠物' },
  { name: 'StudentBattle', icon: '⚔️', label: 'PK对战' },
  { name: 'StudentShop', icon: '🛒', label: '商店' },
  { name: 'StudentTasks', icon: '📋', label: '任务' },
  { name: 'StudentRanking', icon: '🏆', label: '排行榜' },
  { name: 'StudentAchievements', icon: '🎖️', label: '成就' },
  { name: 'StudentSocial', icon: '💬', label: '社交' }
]

const currentPet = computed(() => petStore.currentPet)
const petStats = computed(() => currentPet.value ? petStore.getPetTotalStats(currentPet.value.id) : null)

const ownedEquipmentBySlot = computed(() => {
  if (!selectedSlot.value) return []
  return equipmentStore.getUserEquipment(selectedSlot.value)
})

function getPetIcon(type: string): string {
  return petTypes.find(p => p.type === type)?.icon || '🐾'
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'var(--rarity-common)'
    case 'rare': return 'var(--rarity-rare)'
    case 'epic': return 'var(--rarity-epic)'
    case 'legendary': return 'var(--rarity-legendary)'
    default: return 'var(--rarity-common)'
  }
}

function openEquipModal(slot: 'weapon' | 'armor' | 'accessory') {
  selectedSlot.value = slot
  showEquipModal.value = true
}

function equipItem(equipmentId: string | null) {
  if (!currentPet.value || !selectedSlot.value) return
  petStore.equipItem(currentPet.value.id, selectedSlot.value, equipmentId)
  showEquipModal.value = false
}

function getEquippedItem(slot: 'weapon' | 'armor' | 'accessory') {
  if (!currentPet.value) return null
  const equipId = currentPet.value.equipmentSlots[slot]
  return equipId ? equipmentStore.getEquipmentById(equipId) : null
}

function canLearnSkill(skillId: string): boolean {
  if (!currentPet.value) return false
  return skillStore.canLearnSkill(currentPet.value.id, skillId).canLearn
}

function learnSkill(skillId: string) {
  if (!currentPet.value) return
  skillStore.learnSkillForPet(currentPet.value.id, skillId)
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}

function getExpProgress(): number {
  if (!currentPet.value) return 0
  const thresholds = [0, 200, 600, 1200, 2000]
  const level = Math.min(currentPet.value.level, thresholds.length)
  const currentThreshold = thresholds[level - 1]
  const nextThreshold = thresholds[Math.min(level, thresholds.length - 1)]
  return ((currentPet.value.exp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
}
</script>

<template>
  <div class="student-pet">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">🎓</div>
        <h2>教学激励系统</h2>
        <span class="badge badge-success">学生端</span>
      </div>
      
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.name"
          :to="{ name: item.name }"
          class="nav-item"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">👨‍🎓</div>
          <div class="user-details">
            <span class="user-name">{{ userStore.currentUser?.name }}</span>
            <span class="user-level">Lv.{{ userStore.userLevel }}</span>
          </div>
        </div>
        <button class="btn btn-secondary logout-btn" @click="handleLogout">
          退出登录
        </button>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="page-header">
        <h1>我的宠物</h1>
        <p>管理和培养你的宠物伙伴</p>
      </header>
      
      <div v-if="currentPet" class="pet-content">
        <div class="pet-card-section">
          <div class="pet-main-card">
            <div class="pet-avatar-large" :style="{ borderColor: getRarityColor(currentPet.rarity) }">
              <span class="pet-emoji">{{ getPetIcon(currentPet.type) }}</span>
            </div>
            <div class="pet-basic-info">
              <h2>{{ currentPet.name }}</h2>
              <span class="pet-rarity" :style="{ color: getRarityColor(currentPet.rarity) }">
                {{ currentPet.rarity.toUpperCase() }}
              </span>
              <div class="pet-level-info">
                <span class="level">Lv.{{ currentPet.level }}</span>
                <div class="exp-bar">
                  <div class="progress-bar">
                    <div class="progress-bar-fill" :style="{ width: getExpProgress() + '%' }"></div>
                  </div>
                  <span class="exp-text">{{ currentPet.exp }} EXP</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pet-stats-card">
            <h3>属性面板</h3>
            <div v-if="petStats" class="stats-grid">
              <div class="stat-item">
                <span class="stat-icon">⚔️</span>
                <div class="stat-info">
                  <span class="stat-label">攻击力</span>
                  <span class="stat-value">{{ petStats.attack }}</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🛡️</span>
                <div class="stat-info">
                  <span class="stat-label">防御力</span>
                  <span class="stat-value">{{ petStats.defense }}</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💨</span>
                <div class="stat-info">
                  <span class="stat-label">速度</span>
                  <span class="stat-value">{{ petStats.speed }}</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">❤️</span>
                <div class="stat-info">
                  <span class="stat-label">生命值</span>
                  <span class="stat-value">{{ petStats.health }}</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💥</span>
                <div class="stat-info">
                  <span class="stat-label">暴击率</span>
                  <span class="stat-value">{{ petStats.critical }}%</span>
                </div>
              </div>
            </div>
            
            <div class="battle-record">
              <h4>战绩</h4>
              <div class="record-stats">
                <div class="record-item win">
                  <span class="record-value">{{ currentPet.wins }}</span>
                  <span class="record-label">胜利</span>
                </div>
                <div class="record-item lose">
                  <span class="record-value">{{ currentPet.losses }}</span>
                  <span class="record-label">失败</span>
                </div>
                <div class="record-item rate">
                  <span class="record-value">
                    {{ currentPet.wins + currentPet.losses > 0 
                      ? Math.round(currentPet.wins / (currentPet.wins + currentPet.losses) * 100) 
                      : 0 }}%
                  </span>
                  <span class="record-label">胜率</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tabs-section">
          <div class="tabs">
            <button 
              class="tab" 
              :class="{ active: activeTab === 'equipment' }"
              @click="activeTab = 'equipment'"
            >
              🎽 装备
            </button>
            <button 
              class="tab" 
              :class="{ active: activeTab === 'skills' }"
              @click="activeTab = 'skills'"
            >
              ✨ 技能
            </button>
          </div>
          
          <div class="tab-content">
            <div v-if="activeTab === 'equipment'" class="equipment-tab">
              <h3>装备槽位</h3>
              <div class="equipment-slots">
                <div class="equipment-slot" @click="openEquipModal('weapon')">
                  <div class="slot-icon" :class="{ equipped: getEquippedItem('weapon') }">
                    {{ getEquippedItem('weapon')?.icon || '🗡️' }}
                  </div>
                  <span class="slot-label">武器</span>
                  <span v-if="getEquippedItem('weapon')" class="equipped-name">
                    {{ getEquippedItem('weapon')?.name }}
                  </span>
                </div>
                <div class="equipment-slot" @click="openEquipModal('armor')">
                  <div class="slot-icon" :class="{ equipped: getEquippedItem('armor') }">
                    {{ getEquippedItem('armor')?.icon || '🛡️' }}
                  </div>
                  <span class="slot-label">护甲</span>
                  <span v-if="getEquippedItem('armor')" class="equipped-name">
                    {{ getEquippedItem('armor')?.name }}
                  </span>
                </div>
                <div class="equipment-slot" @click="openEquipModal('accessory')">
                  <div class="slot-icon" :class="{ equipped: getEquippedItem('accessory') }">
                    {{ getEquippedItem('accessory')?.icon || '💍' }}
                  </div>
                  <span class="slot-label">饰品</span>
                  <span v-if="getEquippedItem('accessory')" class="equipped-name">
                    {{ getEquippedItem('accessory')?.name }}
                  </span>
                </div>
              </div>
              <p class="hint">点击槽位更换装备</p>
            </div>
            
            <div v-if="activeTab === 'skills'" class="skills-tab">
              <h3>已学技能</h3>
              <div class="learned-skills">
                <div v-for="skillId in currentPet.skills" :key="skillId" class="skill-card learned">
                  <span class="skill-icon">{{ skillStore.getSkillById(skillId)?.icon || '⭐' }}</span>
                  <div class="skill-info">
                    <span class="skill-name">{{ skillStore.getSkillById(skillId)?.name }}</span>
                    <span class="skill-desc">{{ skillStore.getSkillById(skillId)?.description }}</span>
                  </div>
                </div>
              </div>
              
              <h3>可学习技能</h3>
              <div class="available-skills">
                <div 
                  v-for="skill in skillStore.allSkills" 
                  :key="skill.id"
                  class="skill-card"
                  :class="{ canLearn: canLearnSkill(skill.id), learned: currentPet.skills.includes(skill.id) }"
                >
                  <span class="skill-icon">{{ skill.icon }}</span>
                  <div class="skill-info">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-desc">{{ skill.description }}</span>
                    <span class="skill-req">需要等级: {{ skill.requiredLevel }}</span>
                  </div>
                  <button 
                    v-if="canLearnSkill(skill.id) && !currentPet.skills.includes(skill.id)"
                    class="btn btn-primary btn-sm"
                    @click="learnSkill(skill.id)"
                  >
                    学习
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-pet">
        <span class="no-pet-icon">🐾</span>
        <h2>你还没有宠物</h2>
        <p>请先在首页领养一只宠物</p>
        <button class="btn btn-primary" @click="router.push({ name: 'StudentHome' })">
          去领养
        </button>
      </div>
    </main>
    
    <div v-if="showEquipModal" class="modal-overlay" @click.self="showEquipModal = false">
      <div class="modal animate-scaleIn">
        <h2>选择{{ selectedSlot === 'weapon' ? '武器' : selectedSlot === 'armor' ? '护甲' : '饰品' }}</h2>
        
        <div class="equipment-list">
          <div 
            class="equipment-option"
            :class="{ equipped: !currentPet?.equipmentSlots[selectedSlot!] }"
            @click="equipItem(null)"
          >
            <span class="equip-icon">❌</span>
            <span class="equip-name">卸下装备</span>
          </div>
          
          <div 
            v-for="equip in ownedEquipmentBySlot" 
            :key="equip.id"
            class="equipment-option"
            :class="{ equipped: currentPet?.equipmentSlots[selectedSlot!] === equip.id }"
            @click="equipItem(equip.id)"
          >
            <span class="equip-icon">{{ equip.icon }}</span>
            <div class="equip-info">
              <span class="equip-name">{{ equip.name }}</span>
              <span class="equip-stats">
                <span v-for="(value, stat) in equip.stats" :key="stat">
                  {{ stat }}: +{{ value }}
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <button class="btn btn-secondary close-btn" @click="showEquipModal = false">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-pet {
  display: flex;
  width: 100%;
  height: 100%;
}

.sidebar {
  width: 240px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  font-size: 36px;
  margin-bottom: 8px;
}

.sidebar-header h2 {
  font-size: 16px;
  margin-bottom: 8px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 4px;
  transition: all var(--transition-fast);
  font-size: 13px;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.router-link-active {
  background: rgba(102, 126, 234, 0.15);
  color: var(--primary-light);
}

.nav-icon {
  font-size: 18px;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
}

.user-level {
  font-size: 11px;
  color: var(--text-secondary);
}

.logout-btn {
  width: 100%;
  font-size: 12px;
  padding: 8px;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  margin-bottom: 4px;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.pet-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pet-card-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.pet-main-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pet-avatar-large {
  width: 120px;
  height: 120px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid;
  margin-bottom: 20px;
}

.pet-emoji {
  font-size: 64px;
}

.pet-basic-info h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.pet-rarity {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  display: block;
}

.pet-level-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pet-level-info .level {
  font-size: 18px;
  font-weight: 600;
}

.exp-bar {
  width: 200px;
}

.exp-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  display: block;
}

.pet-stats-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.pet-stats-card h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
}

.battle-record h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.record-stats {
  display: flex;
  gap: 16px;
}

.record-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.record-item.win {
  border: 1px solid var(--success-color);
}

.record-item.lose {
  border: 1px solid var(--danger-color);
}

.record-value {
  font-size: 24px;
  font-weight: 700;
  display: block;
}

.record-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.tabs-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  background: var(--bg-secondary);
}

.tab.active {
  color: var(--primary-light);
  border-bottom: 2px solid var(--primary-color);
}

.tab-content {
  padding: 24px;
}

.equipment-tab h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.equipment-slots {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.equipment-slot {
  width: 120px;
  text-align: center;
  padding: 20px;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.equipment-slot:hover {
  border-color: var(--primary-color);
}

.slot-icon {
  font-size: 40px;
  margin-bottom: 8px;
  display: block;
}

.slot-icon.equipped {
  animation: glow 2s infinite;
}

.slot-label {
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.equipped-name {
  font-size: 12px;
  color: var(--primary-light);
}

.hint {
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 16px;
}

.skills-tab h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.learned-skills, .available-skills {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.skill-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.skill-card.learned {
  border-color: var(--success-color);
  background: rgba(72, 187, 120, 0.1);
}

.skill-card.canLearn {
  border-color: var(--primary-color);
}

.skill-icon {
  font-size: 28px;
}

.skill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.skill-name {
  font-size: 14px;
  font-weight: 600;
}

.skill-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.skill-req {
  font-size: 11px;
  color: var(--warning-color);
}

.no-pet {
  text-align: center;
  padding: 60px;
}

.no-pet-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.no-pet h2 {
  font-size: 20px;
  margin-bottom: 8px;
}

.no-pet p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 24px;
  width: 400px;
  max-width: 90%;
}

.modal h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.equipment-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.equipment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.equipment-option:hover {
  border-color: var(--primary-color);
}

.equipment-option.equipped {
  border-color: var(--success-color);
}

.equip-icon {
  font-size: 24px;
}

.equip-info {
  flex: 1;
}

.equip-name {
  font-size: 14px;
  font-weight: 500;
  display: block;
}

.equip-stats {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 8px;
}

.close-btn {
  width: 100%;
}
</style>
