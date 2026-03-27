<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePetAssetStore } from '@/stores/petAsset'
import type { PetAsset, PetAssetForm, PetAssetTier } from '@/types'
import { PET_ASSET_TIERS, PET_ASSET_TYPES } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const petAssetStore = usePetAssetStore()

const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const selectedAsset = ref<PetAsset | null>(null)
const selectedType = ref<string>('all')
const selectedTier = ref<PetAssetTier | 'all'>('all')

const uploadForm = ref<PetAssetForm>({
  name: '',
  description: '',
  type: 'dragon',
  tier: 'basic',
  statsBonus: {
    attack: 0,
    defense: 0,
    speed: 0,
    health: 0,
    critical: 0
  },
  evolutionConditions: {
    requiredLevel: 1,
    requiredExp: 0,
    requiredWins: 0,
    requiredTasks: 0
  }
})

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const fileType = ref<'image' | 'gif'>('image')

const filteredAssets = computed(() => {
  let assets = petAssetStore.activeAssets
  
  if (selectedType.value !== 'all') {
    assets = assets.filter(a => a.type === selectedType.value)
  }
  
  if (selectedTier.value !== 'all') {
    assets = assets.filter(a => a.tier === selectedTier.value)
  }
  
  return assets.sort((a, b) => {
    const typeOrder = PET_ASSET_TYPES.map(t => t.value)
    const tierOrder = ['basic', 'advanced', 'intermediate', 'master', 'legendary']
    
    const typeDiff = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
    if (typeDiff !== 0) return typeDiff
    
    return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  })
})

const menuItems = [
  { name: 'TeacherHome', icon: '🏠', label: '首页' },
  { name: 'TeacherStudents', icon: '👥', label: '学生管理' },
  { name: 'TeacherRewards', icon: '🏆', label: '奖惩系统' },
  { name: 'TeacherPetAssets', icon: '🐾', label: '宠物素材' }
]

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    
    // 自动判断文件类型
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')
    fileType.value = isGif ? 'gif' : 'image'
  }
}

function handleUpload() {
  if (!selectedFile.value) return
  
  petAssetStore.createPetAsset(uploadForm.value, selectedFile.value, fileType.value)
  
  showUploadModal.value = false
  resetUploadForm()
}

function resetUploadForm() {
  uploadForm.value = {
    name: '',
    description: '',
    type: 'dragon',
    tier: 'basic',
    statsBonus: {
      attack: 0,
      defense: 0,
      speed: 0,
      health: 0,
      critical: 0
    },
    evolutionConditions: {
      requiredLevel: 1,
      requiredExp: 0,
      requiredWins: 0,
      requiredTasks: 0
    }
  }
  selectedFile.value = null
  previewUrl.value = ''
  fileType.value = 'image'
}

function deleteAsset(assetId: string) {
  if (confirm('确定要删除这个宠物素材吗？')) {
    petAssetStore.deletePetAsset(assetId)
  }
}

function previewAsset(asset: PetAsset) {
  selectedAsset.value = asset
  showPreviewModal.value = true
}

function getTierColor(tier: PetAssetTier): string {
  const tierInfo = PET_ASSET_TIERS.find(t => t.value === tier)
  return tierInfo?.color || '#9ca3af'
}

function getTierLabel(tier: PetAssetTier): string {
  const tierInfo = PET_ASSET_TIERS.find(t => t.value === tier)
  return tierInfo?.label || tier
}

function getTypeLabel(type: string): string {
  const typeInfo = PET_ASSET_TYPES.find(t => t.value === type)
  return typeInfo?.label || type
}

function getTypeIcon(type: string): string {
  const typeInfo = PET_ASSET_TYPES.find(t => t.value === type)
  return typeInfo?.icon || '🐾'
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="teacher-pet-assets">
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
        <div class="header-left">
          <h1>宠物素材管理</h1>
          <p>上传和管理宠物素材，支持多形态等级</p>
        </div>
        <button class="btn btn-primary" @click="showUploadModal = true">
          <span>📤</span> 上传素材
        </button>
      </header>
      
      <div class="filter-bar">
        <div class="filter-group">
          <label>宠物类型</label>
          <select v-model="selectedType">
            <option value="all">全部类型</option>
            <option v-for="type in PET_ASSET_TYPES" :key="type.value" :value="type.value">
              {{ type.icon }} {{ type.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>形态等级</label>
          <select v-model="selectedTier">
            <option value="all">全部等级</option>
            <option v-for="tier in PET_ASSET_TIERS" :key="tier.value" :value="tier.value">
              {{ tier.label }}
            </option>
          </select>
        </div>
        
        <div class="stats">
          共 {{ filteredAssets.length }} 个素材
        </div>
      </div>
      
      <div class="assets-grid">
        <div 
          v-for="asset in filteredAssets" 
          :key="asset.id"
          class="asset-card"
        >
          <div class="asset-preview" @click="previewAsset(asset)">
            <img :src="asset.previewUrl" :alt="asset.name" />
            <div class="asset-overlay">
              <span class="preview-text">👁️ 预览</span>
            </div>
          </div>
          
          <div class="asset-info">
            <div class="asset-header">
              <h3>{{ asset.name }}</h3>
              <span 
                class="tier-badge"
                :style="{ backgroundColor: getTierColor(asset.tier) }"
              >
                {{ getTierLabel(asset.tier) }}
              </span>
            </div>
            
            <div class="asset-type">
              <span class="type-icon">{{ getTypeIcon(asset.type) }}</span>
              <span>{{ getTypeLabel(asset.type) }}</span>
            </div>
            
            <p class="asset-desc">{{ asset.description }}</p>
            
            <div class="asset-stats">
              <div v-if="asset.statsBonus.attack" class="stat">
                <span>⚔️ +{{ asset.statsBonus.attack }}</span>
              </div>
              <div v-if="asset.statsBonus.defense" class="stat">
                <span>🛡️ +{{ asset.statsBonus.defense }}</span>
              </div>
              <div v-if="asset.statsBonus.speed" class="stat">
                <span>💨 +{{ asset.statsBonus.speed }}</span>
              </div>
              <div v-if="asset.statsBonus.health" class="stat">
                <span>❤️ +{{ asset.statsBonus.health }}</span>
              </div>
            </div>
            
            <div class="evolution-conditions">
              <div class="condition">
                <span class="condition-label">进化条件:</span>
                <span class="condition-value">
                  Lv.{{ asset.evolutionConditions.requiredLevel }}
                  <template v-if="asset.evolutionConditions.requiredExp">
                    / {{ asset.evolutionConditions.requiredExp }} EXP
                  </template>
                </span>
              </div>
            </div>
          </div>
          
          <div class="asset-actions">
            <button class="btn btn-secondary btn-sm" @click="previewAsset(asset)">
              预览
            </button>
            <button class="btn btn-danger btn-sm" @click="deleteAsset(asset.id)">
              删除
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="filteredAssets.length === 0" class="empty-state">
        <span class="empty-icon">🐾</span>
        <h3>暂无宠物素材</h3>
        <p>点击"上传素材"按钮添加新的宠物素材</p>
      </div>
    </main>
    
    <!-- 上传模态框 -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
      <div class="modal upload-modal animate-scaleIn">
        <h2>上传宠物素材</h2>
        
        <div class="upload-form">
          <div class="form-section">
            <h3>基本信息</h3>
            
            <div class="input-group">
              <label>素材名称 *</label>
              <input v-model="uploadForm.name" type="text" placeholder="输入宠物名称" />
            </div>
            
            <div class="input-group">
              <label>描述</label>
              <textarea v-model="uploadForm.description" rows="3" placeholder="输入宠物描述"></textarea>
            </div>
            
            <div class="form-row">
              <div class="input-group">
                <label>宠物类型 *</label>
                <select v-model="uploadForm.type">
                  <option v-for="type in PET_ASSET_TYPES" :key="type.value" :value="type.value">
                    {{ type.icon }} {{ type.label }}
                  </option>
                </select>
              </div>
              
              <div class="input-group">
                <label>形态等级 *</label>
                <select v-model="uploadForm.tier">
                  <option v-for="tier in PET_ASSET_TIERS" :key="tier.value" :value="tier.value">
                    {{ tier.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>属性加成</h3>
            
            <div class="stats-grid">
              <div class="input-group">
                <label>攻击力</label>
                <input v-model.number="uploadForm.statsBonus.attack" type="number" min="0" />
              </div>
              <div class="input-group">
                <label>防御力</label>
                <input v-model.number="uploadForm.statsBonus.defense" type="number" min="0" />
              </div>
              <div class="input-group">
                <label>速度</label>
                <input v-model.number="uploadForm.statsBonus.speed" type="number" min="0" />
              </div>
              <div class="input-group">
                <label>生命值</label>
                <input v-model.number="uploadForm.statsBonus.health" type="number" min="0" />
              </div>
              <div class="input-group">
                <label>暴击率</label>
                <input v-model.number="uploadForm.statsBonus.critical" type="number" min="0" />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>进化条件</h3>
            
            <div class="form-row">
              <div class="input-group">
                <label>所需等级</label>
                <input v-model.number="uploadForm.evolutionConditions.requiredLevel" type="number" min="1" />
              </div>
              <div class="input-group">
                <label>所需经验</label>
                <input v-model.number="uploadForm.evolutionConditions.requiredExp" type="number" min="0" />
              </div>
              <div class="input-group">
                <label>所需胜场</label>
                <input v-model.number="uploadForm.evolutionConditions.requiredWins" type="number" min="0" />
              </div>
              <div class="input-group">
                <label>所需任务</label>
                <input v-model.number="uploadForm.evolutionConditions.requiredTasks" type="number" min="0" />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>宠物图片上传</h3>
            
            <div class="file-upload">
              <input 
                type="file" 
                accept="image/png,image/jpeg,image/jpg,image/gif" 
                @change="handleFileChange"
                id="pet-image-upload"
                class="file-input"
              />
              <label for="pet-image-upload" class="file-label">
                <span v-if="!selectedFile">📁 选择图片文件 (PNG, JPG, GIF)</span>
                <span v-else>✅ {{ selectedFile.name }} ({{ fileType === 'gif' ? '动态图' : '静态图' }})</span>
              </label>
            </div>
            
            <div v-if="previewUrl" class="preview-section">
              <label>预览</label>
              <img :src="previewUrl" class="gif-preview" />
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showUploadModal = false">取消</button>
          <button 
            class="btn btn-primary" 
            @click="handleUpload"
            :disabled="!uploadForm.name || !selectedFile"
          >
            确认上传
          </button>
        </div>
      </div>
    </div>
    
    <!-- 预览模态框 -->
    <div v-if="showPreviewModal && selectedAsset" class="modal-overlay" @click.self="showPreviewModal = false">
      <div class="modal preview-modal animate-scaleIn">
        <button class="close-btn" @click="showPreviewModal = false">✕</button>
        
        <div class="preview-content">
          <div class="preview-image">
            <img :src="selectedAsset.gifUrl" :alt="selectedAsset.name" />
          </div>
          
          <div class="preview-info">
            <h2>{{ selectedAsset.name }}</h2>
            <span 
              class="preview-tier"
              :style="{ backgroundColor: getTierColor(selectedAsset.tier) }"
            >
              {{ getTierLabel(selectedAsset.tier) }}
            </span>
            
            <div class="preview-type">
              <span class="type-icon">{{ getTypeIcon(selectedAsset.type) }}</span>
              <span>{{ getTypeLabel(selectedAsset.type) }}</span>
            </div>
            
            <p class="preview-desc">{{ selectedAsset.description }}</p>
            
            <div class="preview-stats">
              <h4>属性加成</h4>
              <div class="stats-list">
                <div v-if="selectedAsset.statsBonus.attack" class="stat-item">
                  <span>⚔️ 攻击力</span>
                  <span>+{{ selectedAsset.statsBonus.attack }}</span>
                </div>
                <div v-if="selectedAsset.statsBonus.defense" class="stat-item">
                  <span>🛡️ 防御力</span>
                  <span>+{{ selectedAsset.statsBonus.defense }}</span>
                </div>
                <div v-if="selectedAsset.statsBonus.speed" class="stat-item">
                  <span>💨 速度</span>
                  <span>+{{ selectedAsset.statsBonus.speed }}</span>
                </div>
                <div v-if="selectedAsset.statsBonus.health" class="stat-item">
                  <span>❤️ 生命值</span>
                  <span>+{{ selectedAsset.statsBonus.health }}</span>
                </div>
                <div v-if="selectedAsset.statsBonus.critical" class="stat-item">
                  <span>💥 暴击率</span>
                  <span>+{{ selectedAsset.statsBonus.critical }}</span>
                </div>
              </div>
            </div>
            
            <div class="preview-conditions">
              <h4>进化条件</h4>
              <ul>
                <li>等级达到 {{ selectedAsset.evolutionConditions.requiredLevel }} 级</li>
                <li v-if="selectedAsset.evolutionConditions.requiredExp">
                  经验达到 {{ selectedAsset.evolutionConditions.requiredExp }}
                </li>
                <li v-if="selectedAsset.evolutionConditions.requiredWins">
                  胜利场次达到 {{ selectedAsset.evolutionConditions.requiredWins }}
                </li>
                <li v-if="selectedAsset.evolutionConditions.requiredTasks">
                  完成任务数达到 {{ selectedAsset.evolutionConditions.requiredTasks }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teacher-pet-assets {
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

.logout-btn {
  width: 100%;
}

.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  color: var(--text-secondary);
}

.filter-group select {
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  min-width: 150px;
}

.stats {
  margin-left: auto;
  color: var(--text-secondary);
  font-size: 14px;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.asset-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.asset-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.asset-preview {
  position: relative;
  height: 180px;
  background: var(--bg-secondary);
  cursor: pointer;
  overflow: hidden;
}

.asset-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.asset-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.asset-preview:hover .asset-overlay {
  opacity: 1;
}

.preview-text {
  color: white;
  font-size: 14px;
}

.asset-info {
  padding: 16px;
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.asset-header h3 {
  font-size: 16px;
}

.tier-badge {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.asset-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.type-icon {
  font-size: 16px;
}

.asset-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.asset-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.asset-stats .stat {
  font-size: 12px;
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.evolution-conditions {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.condition {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.condition-label {
  color: var(--text-secondary);
}

.condition-value {
  color: var(--primary-light);
}

.asset-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.asset-actions .btn {
  flex: 1;
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  max-height: 90vh;
  overflow-y: auto;
}

.upload-modal {
  width: 600px;
}

.preview-modal {
  width: 800px;
}

.modal h2 {
  font-size: 20px;
  padding: 24px 24px 0;
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
}

.upload-form {
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 13px;
  color: var(--text-secondary);
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.file-upload {
  margin-bottom: 16px;
}

.file-input {
  display: none;
}

.file-label {
  display: block;
  padding: 40px;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-label:hover {
  border-color: var(--primary-color);
}

.preview-section {
  margin-top: 16px;
}

.preview-section label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.gif-preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.modal-actions .btn {
  flex: 1;
}

.preview-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
}

.preview-image {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.preview-info h2 {
  font-size: 24px;
  margin-bottom: 12px;
}

.preview-tier {
  display: inline-block;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
}

.preview-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin-bottom: 16px;
}

.preview-desc {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.preview-stats h4,
.preview-conditions h4 {
  font-size: 14px;
  margin-bottom: 12px;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.preview-conditions {
  margin-top: 20px;
}

.preview-conditions ul {
  list-style: none;
  padding: 0;
}

.preview-conditions li {
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.preview-conditions li::before {
  content: '•';
  color: var(--primary-color);
  margin-right: 8px;
}
</style>
