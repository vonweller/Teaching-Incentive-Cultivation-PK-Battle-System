import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/student',
    name: 'StudentHome',
    component: () => import('@/views/student/Home.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/pet',
    name: 'StudentPet',
    component: () => import('@/views/student/Pet.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/battle',
    name: 'StudentBattle',
    component: () => import('@/views/student/Battle.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/shop',
    name: 'StudentShop',
    component: () => import('@/views/student/Shop.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/tasks',
    name: 'StudentTasks',
    component: () => import('@/views/student/Tasks.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/ranking',
    name: 'StudentRanking',
    component: () => import('@/views/student/Ranking.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/achievements',
    name: 'StudentAchievements',
    component: () => import('@/views/student/Achievements.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/social',
    name: 'StudentSocial',
    component: () => import('@/views/student/Social.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/teacher',
    name: 'TeacherHome',
    component: () => import('@/views/teacher/Home.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/students',
    name: 'TeacherStudents',
    component: () => import('@/views/teacher/Students.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/rewards',
    name: 'TeacherRewards',
    component: () => import('@/views/teacher/Rewards.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login' })
    return
  }
  
  if (to.meta.role && userStore.currentUser?.role !== to.meta.role) {
    const homeRoute = userStore.currentUser?.role === 'teacher' ? 'TeacherHome' : 'StudentHome'
    next({ name: homeRoute })
    return
  }
  
  if (!to.meta.requiresAuth && userStore.isLoggedIn) {
    const homeRoute = userStore.currentUser?.role === 'teacher' ? 'TeacherHome' : 'StudentHome'
    next({ name: homeRoute })
    return
  }
  
  next()
})

export default router
