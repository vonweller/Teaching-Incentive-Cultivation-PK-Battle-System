<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'

const router = useRouter()
const userStore = useUserStore()
const taskStore = useTaskStore()

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

const dailyTasks = computed(() => taskStore.getDailyTasks())

function claimReward(taskId: string) {
  taskStore.claimTaskReward(taskId)
}

function getProgressPercent(task: { progress: number; target: number }): number {
  return Math.min(100, (task.progress / task.target) * 100)
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="student-tasks">
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
        <h1>每日任务</h1>
        <p>完成任务获取丰厚奖励</p>
      </header>
      
      <div class="tasks-container">
        <div class="tasks-list">
          <div 
            v-for="task in dailyTasks" 
            :key="task.id"
            class="task-card"
            :class="{ completed: task.completed, claimed: task.claimed }"
          >
            <div class="task-header">
              <h3>{{ task.title }}</h3>
              <span v-if="task.claimed" class="claimed-badge">已领取</span>
              <span v-else-if="task.completed" class="complete-badge">可领取</span>
            </div>
            
            <p class="task-desc">{{ task.description }}</p>
            
            <div class="task-progress-section">
              <div class="progress-bar">
                <div 
                  class="progress-bar-fill" 
                  :style="{ width: getProgressPercent(task) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ task.progress }} / {{ task.target }}</span>
            </div>
            
            <div class="task-rewards">
              <div class="reward-item">
                <span class="reward-icon">⭐</span>
                <span>{{ task.reward.exp }} 经验</span>
              </div>
              <div class="reward-item">
                <span class="reward-icon">💰</span>
                <span>{{ task.reward.coins }} 金币</span>
              </div>
              <div class="reward-item">
                <span class="reward-icon">📊</span>
                <span>{{ task.reward.points }} 积分</span>
              </div>
            </div>
            
            <button 
              v-if="task.completed && !task.claimed"
              class="btn btn-gold claim-btn"
              @click="claimReward(task.id)"
            >
              领取奖励
            </button>
            <button 
              v-else-if="task.claimed"
              class="btn btn-secondary claim-btn"
              disabled
            >
              已完成
            </button>
            <button 
              v-else
              class="btn btn-secondary claim-btn"
              disabled
            >
              进行中
            </button>
          </div>
        </div>
        
        <div class="tasks-summary">
          <div class="summary-card">
            <h3>今日进度</h3>
            <div class="summary-stats">
              <div class="summary-item">
                <span class="summary-value">{{ dailyTasks.filter(t => t.completed).length }}</span>
                <span class="summary-label">已完成</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ dailyTasks.filter(t => t.claimed).length }}</span>
                <span class="summary-label">已领取</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ dailyTasks.length }}</span>
                <span class="summary-label">总任务</span>
              </div>
            </div>
          </div>
          
          <div class="tips-card">
            <h3>💡 小提示</h3>
            <ul>
              <li>每日任务会在每天零点重置</li>
              <li>完成任务后记得领取奖励</li>
              <li>积极参与课堂可获得更多积分</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.student-tasks {
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

.tasks-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all var(--transition-fast);
}

.task-card.completed {
  border-color: var(--success-color);
}

.task-card.claimed {
  opacity: 0.7;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-header h3 {
  font-size: 16px;
}

.complete-badge {
  background: var(--success-color);
  color: white;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
}

.claimed-badge {
  background: var(--text-secondary);
  color: white;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
}

.task-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.task-progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.task-progress-section .progress-bar {
  flex: 1;
  height: 8px;
}

.progress-text {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 60px;
  text-align: right;
}

.task-rewards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.reward-icon {
  font-size: 14px;
}

.claim-btn {
  width: 100%;
}

.tasks-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card, .tips-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.summary-card h3, .tips-card h3 {
  font-size: 14px;
  margin-bottom: 16px;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  display: block;
  color: var(--primary-light);
}

.summary-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.tips-card ul {
  list-style: none;
  padding: 0;
}

.tips-card li {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
}

.tips-card li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}
</style>
