<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePetStore } from '@/stores/pet'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const userStore = useUserStore()
const petStore = usePetStore()
const gameStore = useGameStore()

const selectedStudent = ref<string | null>(null)

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

const students = computed(() => {
  return userStore.getAllStudents()
    .filter(s => s.id !== userStore.currentUser?.id)
})

const selectedStudentInfo = computed(() => {
  if (!selectedStudent.value) return null
  return userStore.getUserById(selectedStudent.value)
})

const selectedStudentPet = computed(() => {
  if (!selectedStudent.value) return null
  return petStore.userPets.find(p => p.ownerId === selectedStudent.value)
})

function viewStudent(studentId: string) {
  selectedStudent.value = studentId
  gameStore.recordSocialInteraction()
}

function closeProfile() {
  selectedStudent.value = null
}

function getPetIcon(type: string): string {
  const icons: Record<string, string> = {
    dragon: '🐉',
    phoenix: '🦅',
    tiger: '🐯',
    rabbit: '🐰',
    turtle: '🐢'
  }
  return icons[type] || '🐾'
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="student-social">
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
        <h1>宠物社交</h1>
        <p>查看同学们的宠物，一起互动吧</p>
      </header>
      
      <div class="students-grid">
        <div 
          v-for="student in students" 
          :key="student.id"
          class="student-card"
          @click="viewStudent(student.id)"
        >
          <div class="student-avatar">
            <span class="avatar-emoji">👨‍🎓</span>
          </div>
          
          <div class="student-info">
            <h3>{{ student.name }}</h3>
            <span class="student-level">Lv.{{ userStore.userLevel }}</span>
          </div>
          
          <div class="student-stats">
            <div class="stat">
              <span class="stat-icon">⭐</span>
              <span class="stat-value">{{ student.points }}</span>
            </div>
            <div class="stat">
              <span class="stat-icon">💰</span>
              <span class="stat-value">{{ student.coins }}</span>
            </div>
          </div>
          
          <button class="btn btn-primary btn-sm view-btn">
            查看宠物
          </button>
        </div>
      </div>
      
      <div v-if="students.length === 0" class="empty-state">
        <span class="empty-icon">👥</span>
        <h3>暂无其他同学</h3>
        <p>邀请同学一起加入吧！</p>
      </div>
    </main>
    
    <div v-if="selectedStudent && selectedStudentInfo" class="modal-overlay" @click.self="closeProfile">
      <div class="profile-modal animate-scaleIn">
        <button class="close-btn" @click="closeProfile">✕</button>
        
        <div class="profile-header">
          <div class="profile-avatar">
            <span class="avatar-emoji">👨‍🎓</span>
          </div>
          <div class="profile-info">
            <h2>{{ selectedStudentInfo.name }}</h2>
            <span class="profile-level">Lv.{{ userStore.userLevel }}</span>
          </div>
        </div>
        
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">{{ selectedStudentInfo.points }}</span>
            <span class="stat-label">积分</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">💰</span>
            <span class="stat-value">{{ selectedStudentInfo.coins }}</span>
            <span class="stat-label">金币</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <span class="stat-value">{{ userStore.userLevel }}</span>
            <span class="stat-label">等级</span>
          </div>
        </div>
        
        <div v-if="selectedStudentPet" class="pet-section">
          <h3>宠物展示</h3>
          <div class="pet-display">
            <div class="pet-avatar-large">
              <span class="pet-emoji">{{ getPetIcon(selectedStudentPet.type) }}</span>
            </div>
            <div class="pet-info">
              <span class="pet-name">{{ selectedStudentPet.name }}</span>
              <span class="pet-level">Lv.{{ selectedStudentPet.level }}</span>
              <div class="pet-record">
                <span>🏆 胜: {{ selectedStudentPet.wins }}</span>
                <span>💔 负: {{ selectedStudentPet.losses }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-pet-section">
          <span class="no-pet-icon">🐾</span>
          <p>该同学还没有宠物</p>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="closeProfile">关闭</button>
          <router-link 
            :to="{ name: 'StudentBattle', query: { opponent: selectedStudent } }"
            class="btn btn-primary"
          >
            发起挑战
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-social {
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

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.student-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.student-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.student-avatar {
  width: 60px;
  height: 60px;
  background: var(--gradient-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.avatar-emoji {
  font-size: 28px;
}

.student-info h3 {
  font-size: 16px;
  margin-bottom: 4px;
}

.student-level {
  font-size: 12px;
  color: var(--text-secondary);
}

.student-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 12px 0;
}

.student-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.stat-icon {
  font-size: 14px;
}

.view-btn {
  margin-top: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
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

.profile-modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 400px;
  max-width: 90%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: var(--bg-secondary);
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--danger-color);
  color: white;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  background: var(--gradient-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar .avatar-emoji {
  font-size: 32px;
}

.profile-info h2 {
  font-size: 20px;
  margin-bottom: 4px;
}

.profile-level {
  font-size: 14px;
  color: var(--text-secondary);
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.profile-stats .stat-item {
  text-align: center;
}

.profile-stats .stat-icon {
  font-size: 20px;
  display: block;
  margin-bottom: 4px;
}

.profile-stats .stat-value {
  font-size: 18px;
  font-weight: 700;
  display: block;
}

.profile-stats .stat-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.pet-section h3 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.pet-display {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.pet-avatar-large {
  width: 64px;
  height: 64px;
  background: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-emoji {
  font-size: 36px;
}

.pet-info {
  display: flex;
  flex-direction: column;
}

.pet-name {
  font-size: 16px;
  font-weight: 600;
}

.pet-level {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.pet-record {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.no-pet-section {
  text-align: center;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.no-pet-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.no-pet-section p {
  font-size: 13px;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-buttons .btn {
  flex: 1;
}
</style>
