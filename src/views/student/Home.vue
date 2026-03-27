<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePetAssetStore } from '@/stores/petAsset'
import { useGameStore } from '@/stores/game'
import { useTaskStore } from '@/stores/task'
import type { PetAsset } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const petAssetStore = usePetAssetStore()
const gameStore = useGameStore()
const taskStore = useTaskStore()

const showAdoptModal = ref(false)
const selectedAsset = ref<PetAsset | null>(null)
const adoptPetName = ref('')

onMounted(() => {
  gameStore.recordLogin()
  taskStore.resetDailyTasksIfNeeded()
})

// 宠物类型图标映射
const petTypeIcons: Record<string, string> = {
  dragon: '🐉',
  phoenix: '🦅',
  tiger: '�',
  rabbit: '🐰',
  turtle: '🐢'
}

// 宠物类型名称映射
const petTypeNames: Record<string, string> = {
  dragon: '龙系',
  phoenix: '凤系',
  tiger: '虎系',
  rabbit: '兔系',
  turtle: '龟系'
}

// 获取当前用户的宠物
const currentPet = computed(() => petAssetStore.currentUserPet)

// 可领养的基础宠物素材
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

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}

// 打开领养弹窗
function openAdoptModal() {
  if (availableBasicAssets.value.length === 0) {
    alert('暂时没有可领养的宠物，请联系老师上传宠物素材')
    return
  }
  selectedAsset.value = availableBasicAssets.value[0]
  adoptPetName.value = ''
  showAdoptModal.value = true
}

// 领养宠物
function adoptPet() {
  if (!selectedAsset.value || !adoptPetName.value.trim()) return
  
  const pet = petAssetStore.adoptPet(selectedAsset.value.id, adoptPetName.value.trim())
  if (pet) {
    showAdoptModal.value = false
    adoptPetName.value = ''
    selectedAsset.value = null
  } else {
    alert('领养失败，请重试')
  }
}

// 获取经验进度
function getExpProgress(exp: number, _level: number): number {
  return Math.min(100, (exp % 100) / 100 * 100)
}

// 获取等级颜色
function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    basic: '#9ca3af',
    advanced: '#3b82f6',
    intermediate: '#a855f7',
    master: '#f59e0b',
    legendary: '#ef4444'
  }
  return colors[tier] || '#9ca3af'
}

// 获取等级名称
function getTierName(tier: string): string {
  const names: Record<string, string> = {
    basic: '基础',
    advanced: '进阶',
    intermediate: '中级',
    master: '大师',
    legendary: '传说'
  }
  return names[tier] || tier
}
</script>

<template>
  <div class="student-home">
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
            <span class="user-level">Lv.{{ userStore.userLevel }} {{ userStore.userTitle }}</span>
          </div>
        </div>
        <button class="btn btn-secondary logout-btn" @click="handleLogout">
          退出登录
        </button>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="page-header">
        <div class="welcome-section">
          <h1>欢迎回来，{{ userStore.currentUser?.name }}！</h1>
          <p>今天也要加油学习哦~</p>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">{{ userStore.currentUser?.points }}</span>
            <span class="stat-label">积分</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">💰</span>
            <span class="stat-value">{{ userStore.currentUser?.coins }}</span>
            <span class="stat-label">金币</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <span class="stat-value">Lv.{{ userStore.userLevel }}</span>
            <span class="stat-label">等级</span>
          </div>
        </div>
      </header>
      
      <div class="content-grid">
        <div class="panel pet-panel">
          <div class="panel-header">
            <h2>我的宠物</h2>
            <button v-if="!currentPet" class="btn btn-primary btn-sm" @click="openAdoptModal">
              领养宠物
            </button>
          </div>
          
          <div v-if="currentPet" class="pet-display">
            <div class="pet-card">
              <div class="pet-avatar" :style="{ borderColor: getTierColor(currentPet.currentTier) }">
                <img 
                  v-if="petAssetStore.getAssetById(currentPet.assetId)?.previewUrl" 
                  :src="petAssetStore.getAssetById(currentPet.assetId)?.previewUrl" 
                  class="pet-image"
                  alt="宠物"
                />
                <span v-else class="pet-emoji">{{ petTypeIcons[petAssetStore.getAssetById(currentPet.assetId)?.type || 'dragon'] }}</span>
                <span class="pet-level">Lv.{{ currentPet.level }}</span>
              </div>
              <div class="pet-info">
                <h3>{{ currentPet.name }}</h3>
                <span class="pet-tier" :style="{ color: getTierColor(currentPet.currentTier) }">
                  {{ getTierName(currentPet.currentTier) }}
                </span>
              </div>
              <div class="pet-exp">
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getExpProgress(currentPet.exp, currentPet.level) + '%' }"></div>
                </div>
                <span class="exp-text">{{ currentPet.exp }} EXP</span>
              </div>
              <div class="pet-stats">
                <div class="stat">
                  <span>⚔️ 攻击</span>
                  <span>{{ petAssetStore.getAssetById(currentPet.assetId)?.statsBonus.attack || 0 }}</span>
                </div>
                <div class="stat">
                  <span>🛡️ 防御</span>
                  <span>{{ petAssetStore.getAssetById(currentPet.assetId)?.statsBonus.defense || 0 }}</span>
                </div>
                <div class="stat">
                  <span>💨 速度</span>
                  <span>{{ petAssetStore.getAssetById(currentPet.assetId)?.statsBonus.speed || 0 }}</span>
                </div>
                <div class="stat">
                  <span>❤️ 生命</span>
                  <span>{{ petAssetStore.getAssetById(currentPet.assetId)?.statsBonus.health || 0 }}</span>
                </div>
              </div>
              <div class="pet-record">
                <span>🏆 胜: {{ currentPet.wins }}</span>
                <span>💔 负: {{ currentPet.losses }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="no-pet">
            <span class="no-pet-icon">🐾</span>
            <p>你还没有宠物</p>
            <button class="btn btn-primary" @click="openAdoptModal">立即领养</button>
          </div>
        </div>
        
        <div class="panel tasks-panel">
          <div class="panel-header">
            <h2>今日任务</h2>
            <router-link to="/student/tasks" class="view-all">查看全部 →</router-link>
          </div>
          
          <div class="daily-tasks">
            <div 
              v-for="task in taskStore.getDailyTasks().slice(0, 3)" 
              :key="task.id"
              class="task-item"
            >
              <div class="task-info">
                <span class="task-title">{{ task.title }}</span>
                <div class="task-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-bar-fill" 
                      :style="{ width: (task.progress / task.target * 100) + '%' }"
                    ></div>
                  </div>
                  <span>{{ task.progress }}/{{ task.target }}</span>
                </div>
              </div>
              <div class="task-reward">
                <span>+{{ task.reward.exp }} EXP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="quick-actions">
        <h2>快捷入口</h2>
        <div class="action-grid">
          <div class="action-card" @click="router.push({ name: 'StudentBattle' })">
            <span class="action-icon">⚔️</span>
            <span class="action-label">PK对战</span>
          </div>
          <div class="action-card" @click="router.push({ name: 'StudentShop' })">
            <span class="action-icon">🛒</span>
            <span class="action-label">商店</span>
          </div>
          <div class="action-card" @click="router.push({ name: 'StudentRanking' })">
            <span class="action-icon">🏆</span>
            <span class="action-label">排行榜</span>
          </div>
          <div class="action-card" @click="router.push({ name: 'StudentAchievements' })">
            <span class="action-icon">🎖️</span>
            <span class="action-label">成就</span>
          </div>
        </div>
      </div>
    </main>
    
    <div v-if="showAdoptModal" class="modal-overlay" @click.self="showAdoptModal = false">
      <div class="modal animate-scaleIn">
        <h2>选择你的第一只宠物</h2>
        <p class="modal-subtitle">基础形态宠物，随着成长可以进化成更强大的形态！</p>
        
        <div v-if="availableBasicAssets.length > 0" class="pet-asset-selector">
          <div 
            v-for="asset in availableBasicAssets" 
            :key="asset.id"
            class="pet-asset-option"
            :class="{ selected: selectedAsset?.id === asset.id }"
            @click="selectedAsset = asset"
          >
            <div class="pet-asset-image">
              <img v-if="asset.previewUrl" :src="asset.previewUrl" :alt="asset.name" />
              <span v-else class="pet-icon">{{ petTypeIcons[asset.type] || '🐾' }}</span>
            </div>
            <span class="pet-name">{{ asset.name }}</span>
            <span class="pet-type">{{ petTypeNames[asset.type] || asset.type }}</span>
            <div class="pet-stats-preview">
              <span>⚔️ {{ asset.statsBonus.attack || 0 }}</span>
              <span>🛡️ {{ asset.statsBonus.defense || 0 }}</span>
              <span>❤️ {{ asset.statsBonus.health || 0 }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="no-assets-message">
          <p>暂时没有可领养的宠物素材</p>
          <p>请联系老师上传宠物素材</p>
        </div>
        
        <div class="input-group">
          <label>宠物名字</label>
          <input v-model="adoptPetName" type="text" placeholder="给你的宠物起个名字吧" maxlength="10" />
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showAdoptModal = false">取消</button>
          <button 
            class="btn btn-primary" 
            @click="adoptPet"
            :disabled="!selectedAsset || !adoptPetName.trim()"
          >
            确认领养
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-home {
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
  overflow-y: auto;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.welcome-section h1 {
  font-size: 24px;
  margin-bottom: 4px;
}

.welcome-section p {
  color: var(--text-secondary);
  font-size: 14px;
}

.user-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h2 {
  font-size: 16px;
}

.view-all {
  font-size: 13px;
  color: var(--primary-light);
  text-decoration: none;
}

.pet-display {
  display: flex;
  justify-content: center;
}

.pet-card {
  text-align: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 280px;
}

.pet-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  background: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
  position: relative;
}

.pet-emoji {
  font-size: 48px;
}

.pet-level {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: var(--gradient-primary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}

.pet-info {
  margin-bottom: 12px;
}

.pet-info h3 {
  font-size: 18px;
  margin-bottom: 4px;
}

.pet-rarity {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.pet-exp {
  margin-bottom: 16px;
}

.exp-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  display: block;
}

.pet-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.pet-stats .stat {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.pet-record {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 13px;
}

.no-pet {
  text-align: center;
  padding: 40px;
}

.no-pet-icon {
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
}

.no-pet p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.daily-tasks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-progress .progress-bar {
  width: 100px;
}

.task-progress span {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-reward {
  font-size: 13px;
  color: var(--success-color);
  font-weight: 500;
}

.quick-actions h2 {
  font-size: 16px;
  margin-bottom: 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.action-label {
  font-size: 14px;
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
  padding: 32px;
  width: 480px;
  max-width: 90%;
}

.modal h2 {
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.modal-subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 14px;
}

.pet-asset-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.pet-asset-option {
  padding: 12px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pet-asset-option:hover {
  border-color: var(--primary-color);
}

.pet-asset-option.selected {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.pet-asset-image {
  width: 80px;
  height: 80px;
  margin: 0 auto 8px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pet-asset-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-icon {
  font-size: 32px;
}

.pet-name {
  font-size: 14px;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.pet-type {
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 8px;
}

.pet-stats-preview {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-secondary);
}

.no-assets-message {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.no-assets-message p {
  margin-bottom: 8px;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.pet-tier {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions .btn {
  flex: 1;
}
</style>
