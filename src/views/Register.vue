<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { CharacterAppearance } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const step = ref(1)
const isTeacher = ref(false)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const errorMsg = ref('')

const appearance = ref<CharacterAppearance>({
  hair: 1,
  face: 1,
  body: 1,
  accessory: 1
})

const hairOptions = [1, 2, 3, 4, 5]
const faceOptions = [1, 2, 3, 4, 5]
const bodyOptions = [1, 2, 3, 4, 5]
const accessoryOptions = [1, 2, 3, 4, 5]

const canProceed = computed(() => {
  if (step.value === 1) {
    return username.value && password.value && confirmPassword.value && name.value
  }
  return true
})

function nextStep() {
  if (step.value === 1) {
    if (password.value !== confirmPassword.value) {
      errorMsg.value = '两次密码输入不一致'
      return
    }
    if (userStore.users.find(u => u.username === username.value)) {
      errorMsg.value = '用户名已存在'
      return
    }
    errorMsg.value = ''
    step.value = 2
  }
}

function prevStep() {
  step.value = 1
}

function handleRegister() {
  let success = false
  
  if (isTeacher.value) {
    success = userStore.registerTeacher(username.value, password.value, name.value)
  } else {
    success = userStore.registerStudent(username.value, password.value, name.value, appearance.value)
  }
  
  if (success) {
    const route = isTeacher.value ? 'TeacherHome' : 'StudentHome'
    router.push({ name: route })
  } else {
    errorMsg.value = '注册失败，请重试'
  }
}

function goLogin() {
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="register-page">
    <div class="register-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>
    
    <div class="register-container animate-scaleIn">
      <div class="register-header">
        <h1>创建账号</h1>
        <p>加入我们，开启学习之旅</p>
      </div>
      
      <div class="role-selector">
        <button 
          class="role-btn" 
          :class="{ active: !isTeacher }"
          @click="isTeacher = false"
        >
          🎒 学生
        </button>
        <button 
          class="role-btn" 
          :class="{ active: isTeacher }"
          @click="isTeacher = true"
        >
          👨‍🏫 教师
        </button>
      </div>
      
      <div class="step-indicator">
        <div class="step" :class="{ active: step >= 1, completed: step > 1 }">1</div>
        <div class="step-line" :class="{ active: step > 1 }"></div>
        <div class="step" :class="{ active: step >= 2 }">2</div>
      </div>
      
      <div class="form-content">
        <div v-if="step === 1" class="step-content animate-slideUp">
          <div class="input-group">
            <label>用户名</label>
            <input v-model="username" type="text" placeholder="请输入用户名" />
          </div>
          
          <div class="input-group">
            <label>姓名</label>
            <input v-model="name" type="text" placeholder="请输入真实姓名" />
          </div>
          
          <div class="input-group">
            <label>密码</label>
            <input v-model="password" type="password" placeholder="请输入密码" />
          </div>
          
          <div class="input-group">
            <label>确认密码</label>
            <input v-model="confirmPassword" type="password" placeholder="请再次输入密码" />
          </div>
          
          <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
          
          <button class="btn btn-primary next-btn" :disabled="!canProceed" @click="nextStep">
            下一步
          </button>
        </div>
        
        <div v-else class="step-content animate-slideUp">
          <template v-if="!isTeacher">
            <h3>自定义角色外观</h3>
            <p class="appearance-hint">选择你喜欢的角色外观</p>
            
            <div class="appearance-section">
              <label>发型</label>
              <div class="option-grid">
                <button 
                  v-for="opt in hairOptions" 
                  :key="opt"
                  class="option-btn"
                  :class="{ selected: appearance.hair === opt }"
                  @click="appearance.hair = opt"
                >
                  💇 {{ opt }}
                </button>
              </div>
            </div>
            
            <div class="appearance-section">
              <label>脸型</label>
              <div class="option-grid">
                <button 
                  v-for="opt in faceOptions" 
                  :key="opt"
                  class="option-btn"
                  :class="{ selected: appearance.face === opt }"
                  @click="appearance.face = opt"
                >
                  😊 {{ opt }}
                </button>
              </div>
            </div>
            
            <div class="appearance-section">
              <label>服装</label>
              <div class="option-grid">
                <button 
                  v-for="opt in bodyOptions" 
                  :key="opt"
                  class="option-btn"
                  :class="{ selected: appearance.body === opt }"
                  @click="appearance.body = opt"
                >
                  👕 {{ opt }}
                </button>
              </div>
            </div>
            
            <div class="appearance-section">
              <label>配饰</label>
              <div class="option-grid">
                <button 
                  v-for="opt in accessoryOptions" 
                  :key="opt"
                  class="option-btn"
                  :class="{ selected: appearance.accessory === opt }"
                  @click="appearance.accessory = opt"
                >
                  🎀 {{ opt }}
                </button>
              </div>
            </div>
          </template>
          
          <template v-else>
            <div class="teacher-preview">
              <div class="teacher-icon">👨‍🏫</div>
              <h3>教师账号</h3>
              <p>您将获得教师权限，可以管理学生并进行奖惩操作</p>
            </div>
          </template>
          
          <div class="button-group">
            <button class="btn btn-secondary" @click="prevStep">上一步</button>
            <button class="btn btn-primary" @click="handleRegister">完成注册</button>
          </div>
        </div>
      </div>
      
      <div class="register-footer">
        <p>已有账号？</p>
        <button class="btn btn-secondary" @click="goLogin">返回登录</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.register-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-color);
  opacity: 0.3;
  top: -100px;
  right: -100px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: var(--secondary-color);
  opacity: 0.3;
  bottom: -50px;
  left: -50px;
}

.register-container {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 480px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.register-header {
  text-align: center;
  margin-bottom: 24px;
}

.register-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.register-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.role-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.role-btn {
  flex: 1;
  padding: 12px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.role-btn.active {
  border-color: var(--primary-color);
  color: var(--primary-light);
  background: rgba(102, 126, 234, 0.1);
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.step.active {
  border-color: var(--primary-color);
  color: var(--primary-light);
}

.step.completed {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.step-line {
  width: 60px;
  height: 2px;
  background: var(--border-color);
  margin: 0 12px;
  transition: all var(--transition-fast);
}

.step-line.active {
  background: var(--primary-color);
}

.form-content {
  min-height: 300px;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-message {
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid var(--danger-color);
  color: var(--danger-color);
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  text-align: center;
}

.next-btn {
  width: 100%;
  margin-top: 8px;
}

.appearance-hint {
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
}

.appearance-section {
  margin-bottom: 16px;
}

.appearance-section label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.option-btn {
  padding: 10px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.option-btn:hover {
  border-color: var(--primary-color);
}

.option-btn.selected {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.2);
}

.teacher-preview {
  text-align: center;
  padding: 40px 20px;
}

.teacher-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.button-group .btn {
  flex: 1;
}

.register-footer {
  margin-top: 24px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.register-footer p {
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-size: 14px;
}
</style>
