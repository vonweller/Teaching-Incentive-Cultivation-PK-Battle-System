<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

onMounted(() => {
  gameStore.initAchievements()
  gameStore.checkAchievements()
})

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

const achievements = computed(() => gameStore.achievements)

const unlockedCount = computed(() => 
  achievements.value.filter(a => a.unlocked).length
)

const totalCount = computed(() => achievements.value.length)

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'bronze': return '#cd7f32'
    case 'silver': return '#c0c0c0'
    case 'gold': return '#ffd700'
    case 'diamond': return '#b9f2ff'
    default: return 'var(--text-secondary)'
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="student-achievements">
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
        <h1>成就系统</h1>
        <p>解锁成就，展示你的学习成果</p>
      </header>
      
      <div class="achievement-summary">
        <div class="summary-item">
          <span class="summary-icon">🎖️</span>
          <div class="summary-info">
            <span class="summary-value">{{ unlockedCount }} / {{ totalCount }}</span>
            <span class="summary-label">已解锁</span>
          </div>
        </div>
        <div class="summary-progress">
          <div class="progress-bar">
            <div 
              class="progress-bar-fill" 
              :style="{ width: (unlockedCount / totalCount * 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="achievements-grid">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlocked }"
        >
          <div class="achievement-icon" :style="{ borderColor: getRarityColor(achievement.rarity) }">
            <span>{{ achievement.icon }}</span>
          </div>
          
          <div class="achievement-info">
            <div class="achievement-header">
              <h3>{{ achievement.name }}</h3>
              <span class="achievement-rarity" :style="{ color: getRarityColor(achievement.rarity) }">
                {{ achievement.rarity.toUpperCase() }}
              </span>
            </div>
            
            <p class="achievement-desc">{{ achievement.description }}</p>
            
            <div class="achievement-reward">
              <span class="reward-item">+{{ achievement.reward.exp }} EXP</span>
              <span class="reward-item">+{{ achievement.reward.coins }} 金币</span>
              <span v-if="achievement.reward.title" class="reward-item title">
                称号: {{ achievement.reward.title }}
              </span>
            </div>
            
            <div v-if="achievement.unlocked && achievement.unlockedAt" class="unlock-date">
              解锁于 {{ formatDate(achievement.unlockedAt) }}
            </div>
          </div>
          
          <div v-if="!achievement.unlocked" class="locked-overlay">
            <span class="lock-icon">🔒</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.student-achievements {
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

.achievement-summary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  font-size: 32px;
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
}

.summary-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.summary-progress {
  flex: 1;
}

.summary-progress .progress-bar {
  height: 12px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.achievement-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  gap: 16px;
  position: relative;
  transition: all var(--transition-fast);
}

.achievement-card:hover {
  border-color: var(--primary-color);
}

.achievement-card.unlocked {
  border-color: var(--success-color);
  background: rgba(72, 187, 120, 0.05);
}

.achievement-icon {
  width: 60px;
  height: 60px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
  flex-shrink: 0;
}

.achievement-icon span {
  font-size: 28px;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.achievement-header h3 {
  font-size: 16px;
}

.achievement-rarity {
  font-size: 10px;
  font-weight: 600;
}

.achievement-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.achievement-reward {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reward-item {
  font-size: 11px;
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--success-color);
}

.reward-item.title {
  color: var(--warning-color);
}

.unlock-date {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 32px;
}
</style>
