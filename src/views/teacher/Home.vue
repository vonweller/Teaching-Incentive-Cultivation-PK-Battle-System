<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}

const menuItems = [
  { name: 'TeacherHome', icon: '🏠', label: '首页' },
  { name: 'TeacherStudents', icon: '👥', label: '学生管理' },
  { name: 'TeacherRewards', icon: '🏆', label: '奖惩系统' }
]

const stats = [
  { label: '学生总数', value: userStore.getAllStudents().length, icon: '👨‍🎓' },
  { label: '今日表扬', value: 12, icon: '⭐' },
  { label: '待处理', value: 5, icon: '📋' }
]
</script>

<template>
  <div class="teacher-home">
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
        <h1>欢迎回来，{{ userStore.currentUser?.name }}老师</h1>
        <p>管理您的学生，激励他们更好地学习</p>
      </header>
      
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card animate-slideUp">
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-info">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
      
      <div class="quick-actions">
        <h2>快捷操作</h2>
        <div class="action-grid">
          <div class="action-card" @click="router.push({ name: 'TeacherStudents' })">
            <div class="action-icon">👥</div>
            <h3>学生管理</h3>
            <p>查看和管理所有学生信息</p>
          </div>
          <div class="action-card" @click="router.push({ name: 'TeacherRewards' })">
            <div class="action-icon">🏆</div>
            <h3>奖惩系统</h3>
            <p>对学生进行积分奖惩操作</p>
          </div>
          <div class="action-card">
            <div class="action-icon">📊</div>
            <h3>数据统计</h3>
            <p>查看学生学习数据统计</p>
          </div>
          <div class="action-card">
            <div class="action-icon">📢</div>
            <h3>发布公告</h3>
            <p>发布班级公告和通知</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.teacher-home {
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
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.page-header p {
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.quick-actions h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
}

.action-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.action-card h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.action-card p {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
