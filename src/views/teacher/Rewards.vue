<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const taskStore = useTaskStore()

const selectedStudentId = ref<string>('')
const rewardType = ref<'praise' | 'homework' | 'attendance' | 'punish'>('praise')
const rewardAmount = ref(10)
const punishType = ref<'points' | 'coins' | 'exp'>('points')
const punishAmount = ref(5)
const reason = ref('')
const showResult = ref(false)
const resultMessage = ref('')

const students = computed(() => userStore.getAllStudents())

const selectedStudent = computed(() => {
  if (!selectedStudentId.value) return null
  return userStore.getUserById(selectedStudentId.value)
})

const rewardOptions = [
  { type: 'praise', label: '课堂表扬', icon: '⭐', defaultAmount: 10 },
  { type: 'homework', label: '作业完成', icon: '📝', defaultAmount: 20 },
  { type: 'attendance', label: '出勤奖励', icon: '✅', defaultAmount: 5 }
]

const punishOptions = [
  { type: 'points', label: '扣除积分', icon: '📉' },
  { type: 'coins', label: '扣除金币', icon: '💸' },
  { type: 'exp', label: '扣除经验', icon: '⬇️' }
]

onMounted(() => {
  if (route.query.studentId) {
    selectedStudentId.value = route.query.studentId as string
  }
})

function selectReward(type: 'praise' | 'homework' | 'attendance') {
  rewardType.value = type
  const option = rewardOptions.find(o => o.type === type)
  if (option) {
    rewardAmount.value = option.defaultAmount
  }
}

function giveReward() {
  if (!selectedStudent.value) return
  
  const student = selectedStudent.value
  userStore.currentUser = student
  
  switch (rewardType.value) {
    case 'praise':
      userStore.addPoints(rewardAmount.value)
      userStore.addExp(rewardAmount.value * 2)
      userStore.addCoins(rewardAmount.value)
      taskStore.recordClassPerformance(student.id)
      break
    case 'homework':
      userStore.addPoints(rewardAmount.value)
      userStore.addExp(rewardAmount.value * 3)
      userStore.addCoins(rewardAmount.value * 2)
      taskStore.completeHomework(student.id, {
        exp: rewardAmount.value * 3,
        coins: rewardAmount.value * 2,
        points: rewardAmount.value
      })
      break
    case 'attendance':
      userStore.addPoints(rewardAmount.value)
      userStore.addExp(rewardAmount.value)
      taskStore.recordAttendance(student.id)
      break
  }
  
  resultMessage.value = `已为 ${student.name} 添加奖励！获得 ${rewardAmount.value} 积分`
  showResult.value = true
  setTimeout(() => {
    showResult.value = false
  }, 3000)
}

function givePunishment() {
  if (!selectedStudent.value) return
  
  const student = selectedStudent.value
  userStore.currentUser = student
  
  switch (punishType.value) {
    case 'points':
      userStore.deductPoints(punishAmount.value)
      break
    case 'coins':
      userStore.deductCoins(punishAmount.value)
      break
    case 'exp':
      userStore.deductExp(punishAmount.value)
      break
  }
  
  resultMessage.value = `已对 ${student.name} 执行处罚！扣除 ${punishAmount.value} ${punishType.value === 'points' ? '积分' : punishType.value === 'coins' ? '金币' : '经验'}`
  showResult.value = true
  setTimeout(() => {
    showResult.value = false
  }, 3000)
}

function getLevelByExp(exp: number): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (exp >= thresholds[i]) return i + 1
  }
  return 1
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
  <div class="teacher-rewards">
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
        <h1>奖惩系统</h1>
        <p>对学生的表现进行奖励或处罚</p>
      </header>
      
      <div v-if="showResult" class="result-toast animate-slideDown">
        {{ resultMessage }}
      </div>
      
      <div class="content-grid">
        <div class="panel student-select-panel">
          <h2>选择学生</h2>
          <div class="student-list">
            <div 
              v-for="student in students" 
              :key="student.id"
              class="student-item"
              :class="{ selected: selectedStudentId === student.id }"
              @click="selectedStudentId = student.id"
            >
              <span class="student-avatar">👨‍🎓</span>
              <div class="student-info">
                <span class="student-name">{{ student.name }}</span>
                <span class="student-level">Lv.{{ getLevelByExp(student.exp) }}</span>
              </div>
              <span class="student-points">{{ student.points }} 积分</span>
            </div>
          </div>
        </div>
        
        <div class="panel action-panel">
          <div v-if="selectedStudent" class="selected-info">
            <span class="selected-avatar">👨‍🎓</span>
            <div class="selected-details">
              <h3>{{ selectedStudent.name }}</h3>
              <div class="selected-stats">
                <span>⭐ {{ selectedStudent.points }} 积分</span>
                <span>💰 {{ selectedStudent.coins }} 金币</span>
                <span>📊 Lv.{{ getLevelByExp(selectedStudent.exp) }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="no-selection">
            <span class="no-selection-icon">👈</span>
            <p>请先选择一个学生</p>
          </div>
          
          <div v-if="selectedStudent" class="action-sections">
            <div class="action-section">
              <h3>🎁 奖励操作</h3>
              <div class="reward-options">
                <div 
                  v-for="option in rewardOptions" 
                  :key="option.type"
                  class="reward-option"
                  :class="{ active: rewardType === option.type }"
                  @click="selectReward(option.type as 'praise' | 'homework' | 'attendance')"
                >
                  <span class="option-icon">{{ option.icon }}</span>
                  <span class="option-label">{{ option.label }}</span>
                </div>
              </div>
              
              <div class="amount-input">
                <label>奖励数值</label>
                <div class="input-with-controls">
                  <button class="control-btn" @click="rewardAmount = Math.max(1, rewardAmount - 5)">-</button>
                  <input v-model.number="rewardAmount" type="number" min="1" />
                  <button class="control-btn" @click="rewardAmount += 5">+</button>
                </div>
              </div>
              
              <div class="input-group">
                <label>奖励原因（可选）</label>
                <input v-model="reason" type="text" placeholder="输入奖励原因..." />
              </div>
              
              <button class="btn btn-success reward-btn" @click="giveReward">
                确认奖励
              </button>
            </div>
            
            <div class="divider"></div>
            
            <div class="action-section punish-section">
              <h3>⚠️ 处罚操作</h3>
              <div class="punish-options">
                <div 
                  v-for="option in punishOptions" 
                  :key="option.type"
                  class="punish-option"
                  :class="{ active: punishType === option.type }"
                  @click="punishType = option.type as 'points' | 'coins' | 'exp'"
                >
                  <span class="option-icon">{{ option.icon }}</span>
                  <span class="option-label">{{ option.label }}</span>
                </div>
              </div>
              
              <div class="amount-input">
                <label>处罚数值</label>
                <div class="input-with-controls">
                  <button class="control-btn" @click="punishAmount = Math.max(1, punishAmount - 5)">-</button>
                  <input v-model.number="punishAmount" type="number" min="1" />
                  <button class="control-btn" @click="punishAmount += 5">+</button>
                </div>
              </div>
              
              <div class="input-group">
                <label>处罚原因</label>
                <input v-model="reason" type="text" placeholder="输入处罚原因..." />
              </div>
              
              <button class="btn btn-danger punish-btn" @click="givePunishment">
                确认处罚
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.teacher-rewards {
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
  position: relative;
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

.result-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--success-color);
  color: white;
  padding: 16px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(72, 187, 120, 0.4);
}

.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.panel h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.student-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: 8px;
}

.student-item:hover {
  background: var(--bg-secondary);
}

.student-item.selected {
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid var(--primary-color);
}

.student-avatar {
  font-size: 28px;
}

.student-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.student-name {
  font-size: 14px;
  font-weight: 600;
}

.student-level {
  font-size: 12px;
  color: var(--text-secondary);
}

.student-points {
  font-size: 12px;
  color: var(--primary-light);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 24px;
}

.selected-avatar {
  font-size: 48px;
}

.selected-details h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.selected-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.no-selection {
  text-align: center;
  padding: 40px;
}

.no-selection-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.action-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.action-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.reward-options, .punish-options {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.reward-option, .punish-option {
  flex: 1;
  padding: 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.reward-option:hover, .punish-option:hover {
  border-color: var(--primary-color);
}

.reward-option.active {
  border-color: var(--success-color);
  background: rgba(72, 187, 120, 0.1);
}

.punish-option.active {
  border-color: var(--danger-color);
  background: rgba(245, 101, 101, 0.1);
}

.option-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.option-label {
  font-size: 13px;
}

.amount-input {
  margin-bottom: 16px;
}

.amount-input label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.input-with-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-controls input {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 16px;
}

.control-btn {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.control-btn:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

.punish-section {
  background: rgba(245, 101, 101, 0.05);
  padding: 20px;
  border-radius: var(--radius-md);
}

.reward-btn, .punish-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}
</style>
