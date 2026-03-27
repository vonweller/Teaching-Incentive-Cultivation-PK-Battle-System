<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const selectedStudent = ref<string | null>(null)

const students = computed(() => {
  let list = userStore.getAllStudents()
  if (searchQuery.value) {
    list = list.filter(s => 
      s.name.includes(searchQuery.value) || 
      s.username.includes(searchQuery.value)
    )
  }
  return list
})

function getLevelByExp(exp: number): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (exp >= thresholds[i]) return i + 1
  }
  return 1
}

function viewStudent(studentId: string) {
  selectedStudent.value = studentId
}



const menuItems = [
  { name: 'TeacherHome', icon: '🏠', label: '首页' },
  { name: 'TeacherStudents', icon: '👥', label: '学生管理' },
  { name: 'TeacherRewards', icon: '🏆', label: '奖惩系统' }
]

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="teacher-students">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">🎓</div>
        <h2>教学激励系统</h2>
        <span class="badge badge-primary">教师端</span>
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
          <div class="user-avatar">👨‍🏫</div>
          <div class="user-details">
            <span class="user-name">{{ userStore.currentUser?.name }}</span>
            <span class="user-role">教师</span>
          </div>
        </div>
        <button class="btn btn-secondary logout-btn" @click="handleLogout">
          退出登录
        </button>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="page-header">
        <h1>学生管理</h1>
        <p>查看和管理所有学生信息</p>
      </header>
      
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索学生姓名或用户名..."
          />
        </div>
        <div class="stats">
          <span class="stat">共 {{ students.length }} 名学生</span>
        </div>
      </div>
      
      <div class="students-grid">
        <div 
          v-for="student in students" 
          :key="student.id" 
          class="student-card animate-slideUp"
          @click="viewStudent(student.id)"
        >
          <div class="student-avatar">
            <span class="avatar-emoji">👨‍🎓</span>
            <span class="level-badge">Lv.{{ getLevelByExp(student.exp) }}</span>
          </div>
          <div class="student-info">
            <h3>{{ student.name }}</h3>
            <p class="username">@{{ student.username }}</p>
            <div class="student-stats">
              <div class="stat-item">
                <span class="stat-icon">⭐</span>
                <span>{{ student.points }} 积分</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💰</span>
                <span>{{ student.coins }} 金币</span>
              </div>
            </div>
          </div>
          <div class="student-actions">
            <button class="btn btn-primary btn-sm" @click.stop="router.push({ name: 'TeacherRewards', query: { studentId: student.id } })">
              奖惩操作
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="students.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>暂无学生</h3>
        <p>还没有学生注册，请先让学生注册账号</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.teacher-students {
  display: flex;
  width: 100%;
  height: 100%;
}

.sidebar {
  width: 260px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  font-size: 40px;
  margin-bottom: 12px;
}

.sidebar-header h2 {
  font-size: 18px;
  margin-bottom: 8px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 8px;
  transition: all var(--transition-fast);
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
  font-size: 20px;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-role {
  font-size: 12px;
  color: var(--text-secondary);
}

.logout-btn {
  width: 100%;
}

.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.page-header p {
  color: var(--text-secondary);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 16px;
  width: 300px;
}

.search-icon {
  font-size: 18px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 0;
  color: var(--text-primary);
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
}

.stats {
  color: var(--text-secondary);
  font-size: 14px;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.student-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.student-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.student-avatar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.avatar-emoji {
  font-size: 48px;
}

.level-badge {
  background: var(--gradient-primary);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

.student-info h3 {
  font-size: 18px;
  margin-bottom: 4px;
}

.username {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 12px;
}

.student-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 14px;
}

.student-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
}
</style>
