<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePetAssetStore } from '@/stores/petAsset'
import { useTaskStore } from '@/stores/task'
import type { PetAsset } from '@/types'
import { PET_ASSET_TIERS, getTierColor, getTierLabel } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const petAssetStore = usePetAssetStore()
useTaskStore()

const showAdoptModal = ref(false)
const selectedAsset = ref<PetAsset | null>(null)
const petName = ref('')
const isEvolving = ref(false)
const evolutionSuccess = ref(false)

const currentPet = computed(() => petAssetStore.currentUserPet)

const currentAsset = computed(() => {
  if (!currentPet.value) return null
  return petAssetStore.getCurrentAsset(currentPet.value.id)
})

const unlockedAssets = computed(() => {
  if (!currentPet.value) return []
  return petAssetStore.getUnlockedAssets(currentPet.value.id)
})

const evolutionCheck = computed(() => {
  if (!currentPet.value) return { canEvolve: false }
  return petAssetStore.checkEvolution(currentPet.value.id)
})

const availableBasicAssets = computed(() => petAssetStore.basicAssets)

const menuItems = [
  { name: 'StudentHome', icon: '🏠', label: '首页' },
  { name: 'StudentMyPet', icon: '🐾', label: '我的宠物' },
  { name: 'StudentBattle', icon: '⚔️', label: 'PK对战' },
  { name: 'StudentShop', icon: '🛒', label: '商店' },
  { name: 'StudentInventory', icon: '🎒', label: '背包' },
  { name: 'StudentTasks', icon: '📋', label: '任务' },
  { name: 'StudentRanking', icon: '🏆', label: '排行榜' },
  { name: 'StudentAchievements', icon: '🎖️', label: '成就' },
  { name: 'StudentSocial', icon: '💬', label: '社交' }
]

function openAdoptModal(asset: PetAsset) {
  selectedAsset.value = asset
  petName.value = ''
  showAdoptModal.value = true
}

function handleAdopt() {
  if (!selectedAsset.value || !petName.value.trim()) return
  
  petAssetStore.adoptPet(selectedAsset.value.id, petName.value)
  showAdoptModal.value = false
  selectedAsset.value = null
  petName.value = ''
}

function triggerEvolution() {
  if (!currentPet.value || !evolutionCheck.value.canEvolve) return
  
  isEvolving.value = true
  
  setTimeout(() => {
    const success = petAssetStore.evolvePet(currentPet.value!.id, 'manual')
    if (success) {
      evolutionSuccess.value = true
      setTimeout(() => {
        isEvolving.value = false
        evolutionSuccess.value = false
      }, 2000)
    } else {
      isEvolving.value = false
    }
  }, 2000)
}

function getExpProgress(): number {
  if (!currentPet.value) return 0
  const exp = currentPet.value.exp
  return Math.min(100, (exp % 100) / 100 * 100)
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    dragon: '🐉',
    phoenix: '🦅',
    tiger: '🐯',
    rabbit: '🐰',
    turtle: '🐢',
    wolf: '🐺',
    bear: '🐻',
    fox: '🦊'
  }
  return icons[type] || '🐾'
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}

// 监听宠物变化，自动检查进化
watch(() => currentPet.value?.exp, () => {
  if (currentPet.value) {
    petAssetStore.autoEvolveIfPossible(currentPet.value.id, 'level_up')
  }
})
</script>

<template>
  <div class="student-my-pet">
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
        <p>领养和培养你的专属宠物</p>
      </header>
      
      <!-- 已领养宠物展示 -->
      <div v-if="currentPet && currentAsset" class="pet-showcase">
        <div class="pet-card main-pet">
          <div class="pet-evolution-stages">
            <div 
              v-for="tier in PET_ASSET_TIERS" 
              :key="tier.value"
              class="stage-item"
              :class="{ 
                unlocked: currentPet.unlockedTiers.includes(tier.value),
                current: currentPet.currentTier === tier.value
              }"
              :style="{ borderColor: tier.color }"
            >
              <span class="stage-dot" :style="{ backgroundColor: tier.color }"></span>
              <span class="stage-label">{{ tier.label }}</span>
            </div>
          </div>
          
          <div class="pet-display">
            <div 
              class="pet-avatar-large"
              :class="{ evolving: isEvolving, 'evolution-success': evolutionSuccess }"
            >
              <img :src="currentAsset.gifUrl" :alt="currentAsset.name" />
              <div v-if="isEvolving" class="evolution-effect">
                <span class="sparkle">✨</span>
                <span class="sparkle">⭐</span>
                <span class="sparkle">💫</span>
              </div>
            </div>
            
            <div class="pet-info">
              <h2>{{ currentPet.name }}</h2>
              <div class="pet-badges">
                <span 
                  class="tier-badge"
                  :style="{ backgroundColor: getTierColor(currentPet.currentTier) }"
                >
                  {{ getTierLabel(currentPet.currentTier) }}
                </span>
                <span class="type-badge">
                  {{ getTypeIcon(currentAsset.type) }} {{ currentAsset.type }}
                </span>
              </div>
              
              <div class="pet-level">
                <span class="level-text">Lv.{{ currentPet.level }}</span>
                <div class="exp-bar">
                  <div class="progress-bar">
                    <div 
                      class="progress-bar-fill"
                      :style="{ width: getExpProgress() + '%' }"
                    ></div>
                  </div>
                  <span class="exp-text">{{ currentPet.exp % 100 }} / 100 EXP</span>
                </div>
              </div>
              
              <div class="pet-stats">
                <div class="stat">
                  <span class="stat-icon">🏆</span>
                  <span class="stat-value">{{ currentPet.wins }} 胜</span>
                </div>
                <div class="stat">
                  <span class="stat-icon">📋</span>
                  <span class="stat-value">{{ currentPet.completedTasks }} 任务</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 进化按钮 -->
          <div v-if="evolutionCheck.canEvolve" class="evolution-section">
            <div class="evolution-hint">
              <span class="hint-icon">🎉</span>
              <span>宠物可以进化了！</span>
            </div>
            <button 
              class="btn btn-gold evolution-btn"
              @click="triggerEvolution"
              :disabled="isEvolving"
            >
              <span v-if="isEvolving">进化中...</span>
              <span v-else>✨ 立即进化</span>
            </button>
          </div>
          
          <div v-else-if="evolutionCheck.reasons" class="evolution-requirements">
            <h4>进化条件</h4>
            <ul>
              <li 
                v-for="reason in evolutionCheck.reasons" 
                :key="reason"
                class="requirement-item"
              >
                ❌ {{ reason }}
              </li>
            </ul>
          </div>
        </div>
        
        <!-- 已解锁形态 -->
        <div v-if="unlockedAssets.length > 1" class="unlocked-forms">
          <h3>已解锁形态</h3>
          <div class="forms-grid">
            <div 
              v-for="asset in unlockedAssets" 
              :key="asset.id"
              class="form-card"
              :class="{ active: asset.tier === currentPet.currentTier }"
            >
              <img :src="asset.gifUrl" :alt="asset.name" />
              <span 
                class="form-tier"
                :style="{ backgroundColor: getTierColor(asset.tier) }"
              >
                {{ getTierLabel(asset.tier) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 领养宠物 -->
      <div v-else class="adoption-section">
        <div class="adoption-header">
          <h2>选择你的第一只宠物</h2>
          <p>基础形态宠物，随着成长可以进化成更强大的形态！</p>
        </div>
        
        <div class="assets-grid">
          <div 
            v-for="asset in availableBasicAssets" 
            :key="asset.id"
            class="asset-card"
          >
            <div class="asset-preview">
              <img :src="asset.previewUrl" :alt="asset.name" />
            </div>
            
            <div class="asset-info">
              <h3>{{ asset.name }}</h3>
              <span class="asset-type">
                {{ getTypeIcon(asset.type) }} {{ asset.type }}
              </span>
              <p class="asset-desc">{{ asset.description }}</p>
              
              <div class="asset-stats">
                <div v-if="asset.statsBonus.attack" class="stat">
                  ⚔️ +{{ asset.statsBonus.attack }}
                </div>
                <div v-if="asset.statsBonus.defense" class="stat">
                  🛡️ +{{ asset.statsBonus.defense }}
                </div>
                <div v-if="asset.statsBonus.health" class="stat">
                  ❤️ +{{ asset.statsBonus.health }}
                </div>
              </div>
            </div>
            
            <button class="btn btn-primary adopt-btn" @click="openAdoptModal(asset)">
              领养
            </button>
          </div>
        </div>
        
        <div v-if="availableBasicAssets.length === 0" class="empty-assets">
          <span class="empty-icon">🐾</span>
          <p>暂无可领养的宠物，请等待老师上传宠物素材</p>
        </div>
      </div>
    </main>
    
    <!-- 领养模态框 -->
    <div v-if="showAdoptModal && selectedAsset" class="modal-overlay" @click.self="showAdoptModal = false">
      <div class="modal adopt-modal animate-scaleIn">
        <h2>领养宠物</h2>
        
        <div class="adopt-preview">
          <img :src="selectedAsset.gifUrl" :alt="selectedAsset.name" />
          <h3>{{ selectedAsset.name }}</h3>
          <p>{{ selectedAsset.description }}</p>
        </div>
        
        <div class="input-group">
          <label>给宠物起个名字 *</label>
          <input v-model="petName" type="text" placeholder="输入宠物名字" maxlength="10" />
        </div>
        
        <div class="evolution-preview">
          <h4>进化路线</h4>
          <div class="evolution-path">
            <div class="path-item basic">
              <span class="path-tier">基础</span>
              <span class="path-name">{{ selectedAsset.name }}</span>
            </div>
            <span class="path-arrow">→</span>
            <div class="path-item advanced">
              <span class="path-tier">进阶</span>
              <span class="path-name">?</span>
            </div>
            <span class="path-arrow">→</span>
            <div class="path-item master">
              <span class="path-tier">大师</span>
              <span class="path-name">?</span>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showAdoptModal = false">取消</button>
          <button 
            class="btn btn-primary" 
            @click="handleAdopt"
            :disabled="!petName.trim()"
          >
            确认领养
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-my-pet {
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

.pet-showcase {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pet-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.pet-evolution-stages {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  opacity: 0.4;
  transition: all var(--transition-fast);
}

.stage-item.unlocked {
  opacity: 1;
}

.stage-item.current {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.stage-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.stage-label {
  font-size: 12px;
  font-weight: 500;
}

.pet-display {
  display: flex;
  gap: 32px;
  align-items: center;
}

.pet-avatar-large {
  width: 200px;
  height: 200px;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.pet-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pet-avatar-large.evolving {
  animation: pulse-glow 1s ease-in-out infinite;
}

.pet-avatar-large.evolution-success {
  animation: evolution-flash 0.5s ease-out;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px var(--primary-color); }
  50% { box-shadow: 0 0 60px var(--primary-color), 0 0 100px var(--accent-color); }
}

@keyframes evolution-flash {
  0% { filter: brightness(1); }
  50% { filter: brightness(2) saturate(1.5); }
  100% { filter: brightness(1); }
}

.evolution-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 24px;
  animation: sparkle-float 1.5s ease-in-out infinite;
}

.sparkle:nth-child(1) { top: 20%; left: 20%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 30%; right: 20%; animation-delay: 0.5s; }
.sparkle:nth-child(3) { bottom: 20%; left: 50%; animation-delay: 1s; }

@keyframes sparkle-float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
}

.pet-info {
  flex: 1;
}

.pet-info h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.pet-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tier-badge,
.type-badge {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
}

.type-badge {
  background: var(--bg-secondary);
}

.pet-level {
  margin-bottom: 16px;
}

.level-text {
  font-size: 20px;
  font-weight: 700;
  display: block;
  margin-bottom: 8px;
}

.exp-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exp-bar .progress-bar {
  flex: 1;
  max-width: 300px;
}

.exp-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.pet-stats {
  display: flex;
  gap: 16px;
}

.pet-stats .stat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.stat-icon {
  font-size: 16px;
}

.evolution-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.evolution-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  color: var(--warning-color);
  margin-bottom: 12px;
}

.hint-icon {
  font-size: 24px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.evolution-btn {
  padding: 14px 48px;
  font-size: 16px;
}

.evolution-requirements {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.evolution-requirements h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.evolution-requirements ul {
  list-style: none;
  padding: 0;
}

.requirement-item {
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.unlocked-forms {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.unlocked-forms h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.forms-grid {
  display: flex;
  gap: 16px;
}

.form-card {
  width: 100px;
  text-align: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  opacity: 0.6;
  transition: all var(--transition-fast);
}

.form-card.unlocked {
  opacity: 1;
}

.form-card.active {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.form-card img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 8px;
}

.form-tier {
  display: block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  color: white;
}

.adoption-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 32px;
}

.adoption-header {
  text-align: center;
  margin-bottom: 32px;
}

.adoption-header h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.adoption-header p {
  color: var(--text-secondary);
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.asset-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  text-align: center;
  transition: all var(--transition-fast);
}

.asset-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.asset-preview {
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.asset-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.asset-info h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.asset-type {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.asset-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.asset-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.asset-stats .stat {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

.adopt-btn {
  width: 100%;
}

.empty-assets {
  text-align: center;
  padding: 60px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.empty-assets p {
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 450px;
  max-width: 90%;
}

.modal h2 {
  font-size: 20px;
  margin-bottom: 24px;
  text-align: center;
}

.adopt-preview {
  text-align: center;
  margin-bottom: 24px;
}

.adopt-preview img {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 12px;
}

.adopt-preview h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.adopt-preview p {
  font-size: 13px;
  color: var(--text-secondary);
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.evolution-preview {
  margin-bottom: 24px;
}

.evolution-preview h4 {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.evolution-path {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.path-item {
  text-align: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  min-width: 80px;
}

.path-item.basic {
  border: 2px solid var(--success-color);
}

.path-tier {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.path-name {
  font-size: 13px;
  font-weight: 600;
}

.path-arrow {
  font-size: 20px;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions .btn {
  flex: 1;
}
</style>
