<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePetStore } from '@/stores/pet'
import { useGameStore } from '@/stores/game'
import { useTaskStore } from '@/stores/task'

const router = useRouter()
const userStore = useUserStore()
const petStore = usePetStore()
const gameStore = useGameStore()
const taskStore = useTaskStore()

const showCreatePet = ref(false)
const newPetName = ref('')
const selectedPetType = ref<'dragon' | 'phoenix' | 'tiger' | 'rabbit' | 'turtle'>('rabbit')

onMounted(() => {
  gameStore.recordLogin()
  taskStore.resetDailyTasksIfNeeded()
})

const petTypes = [
  { type: 'dragon', name: '小火龙', icon: '🐉', rarity: 'rare' },
  { type: 'phoenix', name: '凤凰雏鸟', icon: '🦅', rarity: 'legendary' },
  { type: 'tiger', name: '小老虎', icon: '🐯', rarity: 'epic' },
  { type: 'rabbit', name: '萌萌兔', icon: '🐰', rarity: 'common' },
  { type: 'turtle', name: '玄龟', icon: '🐢', rarity: 'common' }
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

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}

function createPet() {
  if (!newPetName.value.trim()) return
  petStore.createPet(selectedPetType.value, newPetName.value)
  showCreatePet.value = false
  newPetName.value = ''
}

function getExpProgress(pet: { exp: number; level: number }): number {
  const thresholds = [0, 200, 600, 1200, 2000]
  const currentExp = pet.exp
  const currentThreshold = thresholds[Math.min(pet.level - 1, thresholds.length - 1)]
  const nextThreshold = thresholds[Math.min(pet.level, thresholds.length - 1)]
  return ((currentExp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
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
            <button v-if="!petStore.currentPet" class="btn btn-primary btn-sm" @click="showCreatePet = true">
              领养宠物
            </button>
          </div>
          
          <div v-if="petStore.currentPet" class="pet-display">
            <div class="pet-card">
              <div class="pet-avatar" :style="{ borderColor: getRarityColor(petStore.currentPet.rarity) }">
                <span class="pet-emoji">
                  {{ petTypes.find(p => p.type === petStore.currentPet?.type)?.icon || '🐾' }}
                </span>
                <span class="pet-level">Lv.{{ petStore.currentPet.level }}</span>
              </div>
              <div class="pet-info">
                <h3>{{ petStore.currentPet.name }}</h3>
                <span class="pet-rarity" :style="{ color: getRarityColor(petStore.currentPet.rarity) }">
                  {{ petStore.currentPet.rarity }}
                </span>
              </div>
              <div class="pet-exp">
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getExpProgress(petStore.currentPet) + '%' }"></div>
                </div>
                <span class="exp-text">{{ petStore.currentPet.exp }} EXP</span>
              </div>
              <div class="pet-stats">
                <div class="stat">
                  <span>⚔️ 攻击</span>
                  <span>{{ petStore.getPetTotalStats(petStore.currentPet.id).attack }}</span>
                </div>
                <div class="stat">
                  <span>🛡️ 防御</span>
                  <span>{{ petStore.getPetTotalStats(petStore.currentPet.id).defense }}</span>
                </div>
                <div class="stat">
                  <span>💨 速度</span>
                  <span>{{ petStore.getPetTotalStats(petStore.currentPet.id).speed }}</span>
                </div>
                <div class="stat">
                  <span>❤️ 生命</span>
                  <span>{{ petStore.getPetTotalStats(petStore.currentPet.id).health }}</span>
                </div>
              </div>
              <div class="pet-record">
                <span>🏆 胜: {{ petStore.currentPet.wins }}</span>
                <span>💔 负: {{ petStore.currentPet.losses }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="no-pet">
            <span class="no-pet-icon">🐾</span>
            <p>你还没有宠物</p>
            <button class="btn btn-primary" @click="showCreatePet = true">立即领养</button>
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
    
    <div v-if="showCreatePet" class="modal-overlay" @click.self="showCreatePet = false">
      <div class="modal animate-scaleIn">
        <h2>领养宠物</h2>
        <div class="pet-type-selector">
          <div 
            v-for="pet in petTypes" 
            :key="pet.type"
            class="pet-type-option"
            :class="{ selected: selectedPetType === pet.type }"
            @click="selectedPetType = pet.type as any"
          >
            <span class="pet-icon">{{ pet.icon }}</span>
            <span class="pet-name">{{ pet.name }}</span>
            <span class="pet-rarity" :style="{ color: getRarityColor(pet.rarity) }">
              {{ pet.rarity }}
            </span>
          </div>
        </div>
        <div class="input-group">
          <label>宠物名字</label>
          <input v-model="newPetName" type="text" placeholder="给你的宠物起个名字吧" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showCreatePet = false">取消</button>
          <button class="btn btn-primary" @click="createPet">确认领养</button>
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

.pet-type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.pet-type-option {
  padding: 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pet-type-option:hover {
  border-color: var(--primary-color);
}

.pet-type-option.selected {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.pet-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.pet-name {
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
}

.pet-rarity {
  font-size: 11px;
  text-transform: uppercase;
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
