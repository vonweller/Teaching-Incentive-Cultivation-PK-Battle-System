<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useInventoryStore, type InventoryItem } from '@/stores/inventory'
import { usePetAssetStore } from '@/stores/petAsset'

const router = useRouter()
const userStore = useUserStore()
const inventoryStore = useInventoryStore()
const petAssetStore = usePetAssetStore()

const selectedSlot = ref<'all' | 'weapon' | 'armor' | 'accessory'>('all')
const showEquipModal = ref(false)
const showSellModal = ref(false)
const selectedItem = ref<InventoryItem | null>(null)
const sellQuantity = ref(1)

const menuItems = [
  { name: 'StudentHome', icon: '🏠', label: '首页' },
  { name: 'StudentMyPet', icon: '🐾', label: '我的宠物' },
  { name: 'StudentBattle', icon: '⚔️', label: 'PK对战' },
  { name: 'StudentShop', icon: '🛒', label: '商店' },
  { name: 'StudentTasks', icon: '📋', label: '任务' },
  { name: 'StudentRanking', icon: '🏆', label: '排行榜' },
  { name: 'StudentAchievements', icon: '🎖️', label: '成就' },
  { name: 'StudentSocial', icon: '💬', label: '社交' }
]

// 获取当前用户的宠物
const currentPet = computed(() => petAssetStore.currentUserPet)

// 过滤背包物品
const filteredItems = computed(() => {
  let items = inventoryStore.unequippedItems
  if (selectedSlot.value !== 'all') {
    items = items.filter(item => item.slot === selectedSlot.value)
  }
  return items
})

// 获取已装备的物品
const equippedItems = computed<Record<string, InventoryItem | null>>(() => {
  if (!currentPet.value) return { weapon: null, armor: null, accessory: null }
  return inventoryStore.getPetEquipment(currentPet.value.id)
})

// 获取装备槽位名称
function getSlotName(slot: string): string {
  const names: Record<string, string> = {
    weapon: '武器',
    armor: '护甲',
    accessory: '饰品'
  }
  return names[slot] || slot
}

// 获取稀有度颜色
function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'var(--rarity-common)'
    case 'rare': return 'var(--rarity-rare)'
    case 'epic': return 'var(--rarity-epic)'
    case 'legendary': return 'var(--rarity-legendary)'
    default: return 'var(--rarity-common)'
  }
}

// 获取装备图标
function getSlotIcon(slot: string): string {
  const icons: Record<string, string> = {
    weapon: '⚔️',
    armor: '🛡️',
    accessory: '💍'
  }
  return icons[slot] || '📦'
}

// 打开装备弹窗
function openEquipModal(item: InventoryItem) {
  selectedItem.value = item
  showEquipModal.value = true
}

// 打开出售弹窗
function openSellModal(item: InventoryItem) {
  selectedItem.value = item
  sellQuantity.value = 1
  showSellModal.value = true
}

// 装备物品
function equipItem() {
  if (!selectedItem.value || !currentPet.value) return
  
  const success = inventoryStore.equipItem(selectedItem.value.id, currentPet.value.id)
  if (success) {
    showEquipModal.value = false
    selectedItem.value = null
  }
}

// 卸下装备
function unequipItem(itemId: string) {
  inventoryStore.unequipItem(itemId)
}

// 出售物品
function sellItem() {
  if (!selectedItem.value) return
  
  const result = inventoryStore.sellItem(selectedItem.value.id)
  if (result.success) {
    showSellModal.value = false
    selectedItem.value = null
    alert(`出售成功！获得 ${result.coinsReceived} 金币`)
  }
}

// 计算出售价格
function getSellPrice(price: number): number {
  return Math.floor(price * 0.5)
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="student-inventory">
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
          <h1>我的背包</h1>
          <p>管理你的装备和物品</p>
        </div>
        <div class="coins-display">
          <span class="coins-icon">💰</span>
          <span class="coins-value">{{ userStore.currentUser?.coins || 0 }}</span>
          <span class="coins-label">金币</span>
        </div>
      </header>

      <!-- 已装备区域 -->
      <div v-if="currentPet" class="equipped-section">
        <h2>已装备</h2>
        <div class="equipped-grid">
          <div 
            v-for="(item, slot) in equippedItems" 
            :key="slot"
            class="equipped-slot"
            :class="{ empty: !item }"
          >
            <div class="slot-label">{{ getSlotName(slot) }}</div>
            <div v-if="item" class="equipped-item">
              <div class="item-icon">{{ getSlotIcon(item.slot) }}</div>
              <div class="item-info">
                <span class="item-name" :style="{ color: getRarityColor(item.rarity) }">
                  {{ item.name }}
                </span>
                <div class="item-stats">
                  <span v-if="item.stats.attack">⚔️+{{ item.stats.attack }}</span>
                  <span v-if="item.stats.defense">🛡️+{{ item.stats.defense }}</span>
                  <span v-if="item.stats.health">❤️+{{ item.stats.health }}</span>
                </div>
              </div>
              <button class="btn btn-sm btn-secondary" @click="unequipItem(item.id)">
                卸下
              </button>
            </div>
            <div v-else class="empty-slot">
              <span class="empty-icon">{{ getSlotIcon(slot) }}</span>
              <span class="empty-text">未装备</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 背包物品区域 -->
      <div class="inventory-section">
        <div class="section-header">
          <h2>背包物品</h2>
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
              ⚔️ 武器
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
        </div>

        <div v-if="filteredItems.length > 0" class="items-grid">
          <div 
            v-for="item in filteredItems" 
            :key="item.id"
            class="inventory-item"
          >
            <div class="item-header">
              <span class="item-icon">{{ getSlotIcon(item.slot) }}</span>
              <span class="item-rarity" :style="{ color: getRarityColor(item.rarity) }">
                {{ item.rarity }}
              </span>
            </div>
            <div class="item-body">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-stats">
                <span v-if="item.stats.attack">⚔️ +{{ item.stats.attack }}</span>
                <span v-if="item.stats.defense">🛡️ +{{ item.stats.defense }}</span>
                <span v-if="item.stats.speed">💨 +{{ item.stats.speed }}</span>
                <span v-if="item.stats.health">❤️ +{{ item.stats.health }}</span>
                <span v-if="item.stats.critical">🎯 +{{ item.stats.critical }}%</span>
              </div>
            </div>
            <div class="item-actions">
              <button 
                v-if="currentPet"
                class="btn btn-sm btn-primary" 
                @click="openEquipModal(item)"
              >
                装备
              </button>
              <button class="btn btn-sm btn-secondary" @click="openSellModal(item)">
                出售
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-inventory">
          <span class="empty-icon">📦</span>
          <p>背包是空的</p>
          <router-link :to="{ name: 'StudentShop' }" class="btn btn-primary">
            去商店购买
          </router-link>
        </div>
      </div>
    </main>

    <!-- 装备确认弹窗 -->
    <div v-if="showEquipModal && selectedItem" class="modal-overlay" @click.self="showEquipModal = false">
      <div class="modal">
        <h3>装备物品</h3>
        <div class="modal-content">
          <div class="item-preview">
            <span class="preview-icon">{{ getSlotIcon(selectedItem.slot) }}</span>
            <span class="preview-name" :style="{ color: getRarityColor(selectedItem.rarity) }">
              {{ selectedItem.name }}
            </span>
          </div>
          <p>确定要装备 <strong>{{ selectedItem.name }}</strong> 到 {{ currentPet?.name }} 吗？</p>
          <p class="hint">这将替换当前已装备的{{ getSlotName(selectedItem.slot) }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showEquipModal = false">取消</button>
          <button class="btn btn-primary" @click="equipItem">确认装备</button>
        </div>
      </div>
    </div>

    <!-- 出售确认弹窗 -->
    <div v-if="showSellModal && selectedItem" class="modal-overlay" @click.self="showSellModal = false">
      <div class="modal">
        <h3>出售物品</h3>
        <div class="modal-content">
          <div class="item-preview">
            <span class="preview-icon">{{ getSlotIcon(selectedItem.slot) }}</span>
            <span class="preview-name" :style="{ color: getRarityColor(selectedItem.rarity) }">
              {{ selectedItem.name }}
            </span>
          </div>
          <div class="sell-info">
            <p>原价: <del>{{ selectedItem.price }} 金币</del></p>
            <p>出售价格: <strong class="sell-price">{{ getSellPrice(selectedItem.price) }} 金币</strong> (50%)</p>
          </div>
          <p class="warning">⚠️ 出售后物品将无法恢复</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showSellModal = false">取消</button>
          <button class="btn btn-danger" @click="sellItem">确认出售</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-inventory {
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
  background: var(--bg-card);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.coins-icon {
  font-size: 20px;
}

.coins-value {
  font-size: 18px;
  font-weight: 700;
}

.coins-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 已装备区域 */
.equipped-section {
  margin-bottom: 32px;
}

.equipped-section h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.equipped-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.equipped-slot {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.equipped-slot.empty {
  opacity: 0.6;
}

.slot-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
}

.equipped-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  font-size: 32px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.item-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.empty-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
}

.empty-icon {
  font-size: 32px;
  opacity: 0.5;
}

.empty-text {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 背包区域 */
.inventory-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 18px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13px;
}

.filter-tab:hover {
  border-color: var(--primary-color);
}

.filter-tab.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.inventory-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  transition: all var(--transition-fast);
}

.inventory-item:hover {
  border-color: var(--primary-color);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-rarity {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
}

.item-body {
  margin-bottom: 12px;
}

.item-body .item-name {
  font-size: 14px;
  margin-bottom: 8px;
}

.item-body .item-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-body .item-stats span {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-card);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.item-actions {
  display: flex;
  gap: 8px;
}

.item-actions .btn {
  flex: 1;
  font-size: 12px;
  padding: 6px;
}

.empty-inventory {
  text-align: center;
  padding: 60px;
}

.empty-inventory .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.empty-inventory p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

/* 弹窗样式 */
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

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 24px;
  width: 400px;
  max-width: 90%;
}

.modal h3 {
  font-size: 18px;
  margin-bottom: 16px;
  text-align: center;
}

.modal-content {
  margin-bottom: 20px;
}

.item-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.preview-icon {
  font-size: 32px;
}

.preview-name {
  font-size: 16px;
  font-weight: 600;
}

.modal-content p {
  text-align: center;
  margin-bottom: 8px;
}

.modal-content .hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.modal-content .warning {
  color: var(--danger-color);
  font-size: 13px;
}

.sell-info {
  text-align: center;
  margin: 16px 0;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.sell-info p {
  margin-bottom: 4px;
}

.sell-price {
  color: var(--success-color);
  font-size: 18px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions .btn {
  flex: 1;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}
</style>
