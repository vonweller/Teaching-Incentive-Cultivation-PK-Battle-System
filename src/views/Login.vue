<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

function handleLogin() {
  errorMsg.value = ''
  
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  
  setTimeout(() => {
    if (userStore.login(username.value, password.value)) {
      const route = userStore.currentUser?.role === 'teacher' ? 'TeacherHome' : 'StudentHome'
      router.push({ name: route })
    } else {
      errorMsg.value = '用户名或密码错误'
    }
    isLoading.value = false
  }, 500)
}

function goRegister() {
  router.push({ name: 'Register' })
}
</script>

<template>
  <div class="login-page">
    <div class="login-background">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
    </div>
    
    <div class="login-container animate-scaleIn">
      <div class="login-header">
        <div class="logo">🎓</div>
        <h1>教学激励系统</h1>
        <p>让学习更有趣，让成长更精彩</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label>用户名</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        
        <div class="input-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        
        <div v-if="errorMsg" class="error-message animate-shake">
          {{ errorMsg }}
        </div>
        
        <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="login-footer">
        <p>还没有账号？</p>
        <button class="btn btn-secondary" @click="goRegister">立即注册</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-primary);
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: white;
  top: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: white;
  top: 50%;
  right: -50px;
  animation: float 6s ease-in-out infinite reverse;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: white;
  bottom: -50px;
  left: 30%;
  animation: float 7s ease-in-out infinite;
}

.shape-4 {
  width: 100px;
  height: 100px;
  background: white;
  top: 30%;
  left: 10%;
  animation: float 5s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(10deg); }
}

.login-container {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 40px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 10px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.login-footer p {
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-size: 14px;
}
</style>
