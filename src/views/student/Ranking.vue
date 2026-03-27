<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGameStore } from '@/stores/game'
import type { RankingType } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const selectedType = ref<RankingType>('points')

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

const rankingTypes = [
  { type: 'points' as RankingType, label: '积分榜', icon: '⭐' },
  { type: 'level' as RankingType, label: '等级榜', icon: '📊' },
  { type: 'petLevel' as RankingType, label: '宠物榜', icon: '🐾' }
]

const ranking = computed(() => gameStore.getRanking(selectedType.value))

const myRank = computed(() => {
  return ranking.value.find(r => r.userId === userStore.currentUser?.id)
})

function getRankStyle(rank: number): string {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

function getRankIcon(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return rank.toString()
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="student-ranking">
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
        <h1>排行榜</h1>
        <p>查看班级排名，争取更好的成绩</p>
      </header>
      
      <div class="ranking-tabs">
        <button 
          v-for="type in rankingTypes" 
          :key="type.type"
          class="ranking-tab"
          :class="{ active: selectedType === type.type }"
          @click="selectedType = type.type"
        >
          <span class="tab-icon">{{ type.icon }}</span>
          {{ type.label }}
        </button>
      </div>
      
      <div v-if="myRank" class="my-rank-card">
        <div class="my-rank-info">
          <span class="my-rank-label">我的排名</span>
          <span class="my-rank-value">第 {{ myRank.rank }} 名</span>
        </div>
        <div class="my-rank-stats">
          <span v-if="selectedType === 'points'">⭐ {{ myRank.points }} 积分</span>
          <span v-else-if="selectedType === 'level'">📊 Lv.{{ myRank.level }}</span>
          <span v-else>🐾 Lv.{{ myRank.petLevel }}</span>
        </div>
      </div>
      
      <div class="ranking-list">
        <div 
          v-for="entry in ranking" 
          :key="entry.userId"
          class="ranking-item"
          :class="{ me: entry.userId === userStore.currentUser?.id, [getRankStyle(entry.rank)]: entry.rank <= 3 }"
        >
          <div class="rank-number">
            {{ getRankIcon(entry.rank) }}
          </div>
          
          <div class="player-avatar">
            <span class="avatar-emoji">👨‍🎓</span>
          </div>
          
          <div class="player-info">
            <span class="player-name">{{ entry.userName }}</span>
            <span class="player-level">Lv.{{ entry.level }}</span>
          </div>
          
          <div class="player-score">
            <span v-if="selectedType === 'points'" class="score">
              <span class="score-icon">⭐</span>
              {{ entry.points }}
            </span>
            <span v-else-if="selectedType === 'level'" class="score">
              <span class="score-icon">📊</span>
              Lv.{{ entry.level }}
            </span>
            <span v-else class="score">
              <span class="score-icon">🐾</span>
              Lv.{{ entry.petLevel }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="ranking.length === 0" class="empty-ranking">
        <span class="empty-icon">🏆</span>
        <p>暂无排名数据</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.student-ranking {
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

.ranking-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.ranking-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ranking-tab:hover {
  border-color: var(--primary-color);
}

.ranking-tab.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.tab-icon {
  font-size: 18px;
}

.my-rank-card {
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.my-rank-info {
  display: flex;
  flex-direction: column;
}

.my-rank-label {
  font-size: 13px;
  opacity: 0.8;
}

.my-rank-value {
  font-size: 24px;
  font-weight: 700;
}

.my-rank-stats {
  font-size: 18px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.ranking-item:hover {
  border-color: var(--primary-color);
}

.ranking-item.me {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

.ranking-item.gold {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%);
  border-color: #f59e0b;
}

.ranking-item.silver {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, rgba(156, 163, 175, 0.05) 100%);
  border-color: #9ca3af;
}

.ranking-item.bronze {
  background: linear-gradient(135deg, rgba(180, 83, 9, 0.2) 0%, rgba(180, 83, 9, 0.05) 100%);
  border-color: #b45309;
}

.rank-number {
  width: 40px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.player-avatar {
  width: 44px;
  height: 44px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-emoji {
  font-size: 24px;
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.player-name {
  font-size: 15px;
  font-weight: 600;
}

.player-level {
  font-size: 12px;
  color: var(--text-secondary);
}

.player-score {
  display: flex;
  align-items: center;
}

.score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 18px;
  font-weight: 600;
}

.score-icon {
  font-size: 16px;
}

.empty-ranking {
  text-align: center;
  padding: 60px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.empty-ranking p {
  color: var(--text-secondary);
}
</style>
