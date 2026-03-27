<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useEquipmentStore } from '@/stores/equipment'

const router = useRouter()
const userStore = useUserStore()
const equipmentStore = useEquipmentStore()

const selectedSlot = ref<'all' | 'weapon' | 'armor' | 'accessory'>('all')
const purchaseSuccess = ref<string | null>(null)

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

const filteredEquipment = computed(() => {
  let items = equipmentStore.availableEquipment
  if (selectedSlot.value !== 'all') {
    items = items.filter(e => e.slot === selectedSlot.value)
  }
  return items
})

const userCoins = computed(() => userStore.currentUser?.coins || 0)

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'var(--rarity-common)'
    case 'rare': return 'var(--rarity-rare)'
    case 'epic': return 'var(--rarity-epic)'
    case 'legendary': return 'var(--rarity-legendary)'
    default: return 'var(--rarity-common)'
  }
}

function canBuy(item: { price: number; requiredLevel: number }): boolean {
  return userCoins.value >= item.price && userStore.userLevel >= item.requiredLevel
}

function buyItem(item: { id: string; name: string; price: number }) {
  if (equipmentStore.buyEquipment(item.id)) {
    purchaseSuccess.value = item.name
    setTimeout(() => {
      purchaseSuccess.value = null
    }, 2000)
  }
}

function isOwned(item: { id: string }): boolean {
  return equipmentStore.hasEquipment(item.id)
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="student-shop">
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
        <div class="header-left">
          <h1>装备商店</h1>
          <p>购买装备提升宠物战斗力</p>
        </div>
        <div class="coins-display">
          <span class="coins-icon">💰</span>
          <span class="coins-value">{{ userCoins }}</span>
          <span class="coins-label">金币</span>
        </div>
      </header>
      
      <div v-if="purchaseSuccess" class="success-toast animate-slideDown">
        ✅ 成功购买 {{ purchaseSuccess }}！
      </div>
      
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: selectedSlot === 'all' }"
          @click="selectedSlot = 'all'"
        >
          全部
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: selectedSlot === 'weapon' }"
          @click="selectedSlot = 'weapon'"
        >
          🗡️ 武器
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: selectedSlot === 'armor' }"
          @click="selectedSlot = 'armor'"
        >
          🛡️ 护甲
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: selectedSlot === 'accessory' }"
          @click="selectedSlot = 'accessory'"
        >
          💍 饰品
        </button>
      </div>
      
      <div class="shop-grid">
        <div 
          v-for="item in filteredEquipment" 
          :key="item.id"
          class="shop-item"
          :class="{ owned: isOwned(item), locked: userStore.userLevel < item.requiredLevel }"
        >
          <div class="item-header">
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-rarity" :style="{ color: getRarityColor(item.rarity) }">
              {{ item.rarity.toUpperCase() }}
            </span>
          </div>
          
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-desc">{{ item.description }}</p>
          </div>
          
          <div class="item-stats">
            <span v-for="(value, stat) in item.stats" :key="stat" class="stat">
              {{ stat }}: +{{ value }}
            </span>
          </div>
          
          <div class="item-footer">
            <div class="item-price">
              <span class="price-icon">💰</span>
              <span class="price-value">{{ item.price }}</span>
            </div>
            <div class="item-level">
              需要 Lv.{{ item.requiredLevel }}
            </div>
          </div>
          
          <button 
            v-if="!isOwned(item)"
            class="btn buy-btn"
            :class="{ 'btn-primary': canBuy(item), 'btn-secondary': !canBuy(item) }"
            :disabled="!canBuy(item)"
            @click="buyItem(item)"
          >
            {{ userStore.userLevel < item.requiredLevel ? '等级不足' : userCoins < item.price ? '金币不足' : '购买' }}
          </button>
          <button v-else class="btn btn-success owned-btn" disabled>
            已拥有
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.student-shop {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 24px;
  margin-bottom: 4px;
}

.header-left p {
  color: var(--text-secondary);
  font-size: 14px;
}

.coins-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--gradient-gold);
  padding: 12px 20px;
  border-radius: var(--radius-full);
}

.coins-icon {
  font-size: 20px;
}

.coins-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.coins-label {
  font-size: 14px;
  color: #1a1a2e;
}

.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--success-color);
  color: white;
  padding: 16px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  z-index: 100;
}

.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-tab {
  padding: 10px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-tab:hover {
  border-color: var(--primary-color);
}

.filter-tab.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.shop-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
}

.shop-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.shop-item.owned {
  border-color: var(--success-color);
  background: rgba(72, 187, 120, 0.05);
}

.shop-item.locked {
  opacity: 0.6;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-icon {
  font-size: 36px;
}

.item-rarity {
  font-size: 11px;
  font-weight: 600;
}

.item-info {
  margin-bottom: 12px;
}

.item-info h3 {
  font-size: 16px;
  margin-bottom: 4px;
}

.item-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.item-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.item-stats .stat {
  font-size: 12px;
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--success-color);
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-icon {
  font-size: 16px;
}

.price-value {
  font-size: 16px;
  font-weight: 600;
}

.item-level {
  font-size: 12px;
  color: var(--text-secondary);
}

.buy-btn {
  width: 100%;
}

.owned-btn {
  width: 100%;
}
</style>
