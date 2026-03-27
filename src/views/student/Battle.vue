<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePetStore } from '@/stores/pet'
import { useGameStore } from '@/stores/game'
import type { BattleState, BattleLogEntry } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const petStore = usePetStore()
const gameStore = useGameStore()

const battleState = ref<BattleState | null>(null)
const isBattling = ref(false)
const selectedOpponent = ref<string | null>(null)
const battleSpeed = ref(1)

const opponents = computed(() => {
  return userStore.getAllStudents()
    .filter(s => s.id !== userStore.currentUser?.id)
    .slice(0, 5)
    .map(student => {
      const pet = petStore.userPets.find(p => p.ownerId === student.id)
      return {
        ...student,
        pet,
        petStats: pet ? petStore.getPetTotalStats(pet.id) : null
      }
    })
    .filter(o => o.pet)
})

const currentPet = computed(() => petStore.currentPet)
const currentPetStats = computed(() => 
  currentPet.value ? petStore.getPetTotalStats(currentPet.value.id) : null
)

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

function selectOpponent(opponentId: string) {
  selectedOpponent.value = opponentId
}

async function startBattle() {
  if (!currentPet.value || !selectedOpponent.value) return
  
  const opponent = opponents.value.find(o => o.id === selectedOpponent.value)
  if (!opponent || !opponent.pet || !opponent.petStats) return

  isBattling.value = true
  battleState.value = {
    playerPetId: currentPet.value.id,
    enemyPetId: opponent.pet.id,
    playerHp: currentPetStats.value!.health,
    enemyHp: opponent.petStats.health,
    currentRound: 0,
    isPlayerTurn: true,
    battleLog: [],
    isFinished: false,
    winner: null
  }

  await runBattle()
}

async function runBattle() {
  if (!battleState.value || !currentPetStats.value) return

  const opponent = opponents.value.find(o => o.id === selectedOpponent.value)
  if (!opponent || !opponent.petStats) return

  while (!battleState.value.isFinished) {
    battleState.value.currentRound++
    
    const attackerStats = battleState.value.isPlayerTurn ? currentPetStats.value! : opponent.petStats
    const defenderStats = battleState.value.isPlayerTurn ? opponent.petStats : currentPetStats.value!
    
    const isCritical = Math.random() * 100 < attackerStats.critical
    let damage = Math.max(1, attackerStats.attack - defenderStats.defense / 2)
    if (isCritical) damage *= 1.5
    damage = Math.floor(damage * (0.9 + Math.random() * 0.2))

    const logEntry: BattleLogEntry = {
      round: battleState.value.currentRound,
      attackerId: battleState.value.isPlayerTurn ? battleState.value.playerPetId : battleState.value.enemyPetId,
      skillId: 'basic_attack',
      skillName: '普通攻击',
      damage,
      remainingHp: 0,
      isCritical
    }

    if (battleState.value.isPlayerTurn) {
      battleState.value.enemyHp = Math.max(0, battleState.value.enemyHp - damage)
      logEntry.remainingHp = battleState.value.enemyHp
    } else {
      battleState.value.playerHp = Math.max(0, battleState.value.playerHp - damage)
      logEntry.remainingHp = battleState.value.playerHp
    }

    battleState.value.battleLog.push(logEntry)

    if (battleState.value.playerHp <= 0 || battleState.value.enemyHp <= 0) {
      battleState.value.isFinished = true
      battleState.value.winner = battleState.value.playerHp > 0 
        ? battleState.value.playerPetId 
        : battleState.value.enemyPetId
    }

    battleState.value.isPlayerTurn = !battleState.value.isPlayerTurn

    await new Promise(resolve => setTimeout(resolve, 800 / battleSpeed.value))
  }

  endBattle()
}

function endBattle() {
  if (!battleState.value || !currentPet.value) return

  const isWin = battleState.value.winner === battleState.value.playerPetId
  
  if (isWin) {
    petStore.recordBattleResult(currentPet.value.id, true)
    petStore.addExpToPet(currentPet.value.id, 30)
    userStore.addCoins(20)
    userStore.addExp(15)
    gameStore.recordPkWin()
  } else {
    petStore.recordBattleResult(currentPet.value.id, false)
    petStore.addExpToPet(currentPet.value.id, 10)
    userStore.addExp(5)
  }
}

function closeBattle() {
  battleState.value = null
  isBattling.value = false
  selectedOpponent.value = null
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
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
</script>

<template>
  <div class="student-battle">
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
        <h1>PK对战</h1>
        <p>选择对手，开始激烈的宠物对战！</p>
      </header>
      
      <div v-if="!isBattling" class="battle-setup">
        <div v-if="currentPet" class="my-pet-section">
          <h2>我的宠物</h2>
          <div class="pet-card my-pet">
            <div class="pet-avatar">
              <span class="pet-emoji">{{ getPetIcon(currentPet.type) }}</span>
              <span class="pet-level">Lv.{{ currentPet.level }}</span>
            </div>
            <div class="pet-info">
              <h3>{{ currentPet.name }}</h3>
              <div v-if="currentPetStats" class="pet-stats">
                <span>⚔️ {{ currentPetStats.attack }}</span>
                <span>🛡️ {{ currentPetStats.defense }}</span>
                <span>❤️ {{ currentPetStats.health }}</span>
                <span>💨 {{ currentPetStats.speed }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-pet-warning">
          <span class="warning-icon">⚠️</span>
          <p>你还没有宠物，请先领养一只</p>
          <button class="btn btn-primary" @click="router.push({ name: 'StudentHome' })">
            去领养
          </button>
        </div>
        
        <div v-if="currentPet" class="opponents-section">
          <h2>选择对手</h2>
          <div class="opponents-grid">
            <div 
              v-for="opponent in opponents" 
              :key="opponent.id"
              class="opponent-card"
              :class="{ selected: selectedOpponent === opponent.id }"
              @click="selectOpponent(opponent.id)"
            >
              <div class="opponent-avatar">
                <span class="avatar-emoji">👨‍🎓</span>
              </div>
              <div class="opponent-info">
                <span class="opponent-name">{{ opponent.name }}</span>
                <span class="opponent-level">Lv.{{ opponent.pet?.level }}</span>
              </div>
              <div class="opponent-pet">
                <span class="pet-icon">{{ getPetIcon(opponent.pet?.type || '') }}</span>
                <span class="pet-name">{{ opponent.pet?.name }}</span>
              </div>
              <div v-if="opponent.petStats" class="opponent-stats">
                <span>⚔️{{ opponent.petStats.attack }}</span>
                <span>🛡️{{ opponent.petStats.defense }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="opponents.length === 0" class="no-opponents">
            <span class="no-opponents-icon">🔍</span>
            <p>暂无可挑战的对手</p>
          </div>
        </div>
        
        <div v-if="currentPet && selectedOpponent" class="battle-actions">
          <button class="btn btn-gold start-battle-btn" @click="startBattle">
            ⚔️ 开始对战
          </button>
        </div>
      </div>
      
      <div v-else class="battle-arena">
        <div class="arena-header">
          <div class="fighter player">
            <div class="fighter-avatar">
              <span class="fighter-emoji">{{ getPetIcon(currentPet?.type || '') }}</span>
            </div>
            <div class="fighter-info">
              <span class="fighter-name">{{ currentPet?.name }}</span>
              <div class="hp-bar">
                <div 
                  class="hp-fill player-hp" 
                  :style="{ width: (battleState!.playerHp / currentPetStats!.health * 100) + '%' }"
                ></div>
              </div>
              <span class="hp-text">{{ battleState?.playerHp }} / {{ currentPetStats?.health }}</span>
            </div>
          </div>
          
          <div class="vs-badge">
            <span>VS</span>
          </div>
          
          <div class="fighter enemy">
            <div class="fighter-avatar">
              <span class="fighter-emoji">{{ getPetIcon(opponents.find(o => o.id === selectedOpponent)?.pet?.type || '') }}</span>
            </div>
            <div class="fighter-info">
              <span class="fighter-name">{{ opponents.find(o => o.id === selectedOpponent)?.pet?.name }}</span>
              <div class="hp-bar">
                <div 
                  class="hp-fill enemy-hp" 
                  :style="{ width: (battleState!.enemyHp / opponents.find(o => o.id === selectedOpponent)?.petStats!.health! * 100) + '%' }"
                ></div>
              </div>
              <span class="hp-text">{{ battleState?.enemyHp }} / {{ opponents.find(o => o.id === selectedOpponent)?.petStats?.health }}</span>
            </div>
          </div>
        </div>
        
        <div class="battle-log">
          <h3>战斗日志</h3>
          <div class="log-entries">
            <div 
              v-for="(log, index) in battleState?.battleLog" 
              :key="index"
              class="log-entry"
              :class="{ player: log.attackerId === battleState?.playerPetId, critical: log.isCritical }"
            >
              <span class="round">回合 {{ log.round }}</span>
              <span class="action">
                {{ log.attackerId === battleState?.playerPetId ? currentPet?.name : opponents.find(o => o.id === selectedOpponent)?.pet?.name }}
                使用 {{ log.skillName }}
                <span v-if="log.isCritical" class="critical-text">暴击！</span>
              </span>
              <span class="damage">造成 {{ log.damage }} 点伤害</span>
            </div>
          </div>
        </div>
        
        <div v-if="battleState?.isFinished" class="battle-result">
          <div class="result-content" :class="{ win: battleState.winner === battleState.playerPetId }">
            <span class="result-icon">{{ battleState.winner === battleState.playerPetId ? '🏆' : '💔' }}</span>
            <h2>{{ battleState.winner === battleState.playerPetId ? '胜利！' : '失败' }}</h2>
            <p v-if="battleState.winner === battleState.playerPetId">
              获得 30 经验，20 金币
            </p>
            <p v-else>
              获得 10 经验
            </p>
            <button class="btn btn-primary" @click="closeBattle">
              返回
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.student-battle {
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

.battle-setup {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.my-pet-section h2, .opponents-section h2 {
  font-size: 16px;
  margin-bottom: 16px;
}

.pet-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.pet-avatar {
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pet-emoji {
  font-size: 40px;
}

.pet-level {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: var(--gradient-primary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
}

.pet-info h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.pet-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.no-pet-warning {
  text-align: center;
  padding: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.no-pet-warning p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.opponents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.opponent-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.opponent-card:hover {
  border-color: var(--primary-color);
}

.opponent-card.selected {
  border-color: var(--warning-color);
  background: rgba(237, 137, 54, 0.1);
}

.opponent-avatar {
  width: 50px;
  height: 50px;
  background: var(--gradient-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.avatar-emoji {
  font-size: 24px;
}

.opponent-info {
  margin-bottom: 12px;
}

.opponent-name {
  font-size: 14px;
  font-weight: 600;
  display: block;
}

.opponent-level {
  font-size: 12px;
  color: var(--text-secondary);
}

.opponent-pet {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pet-icon {
  font-size: 24px;
}

.pet-name {
  font-size: 13px;
}

.opponent-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.no-opponents {
  text-align: center;
  padding: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.no-opponents-icon {
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
}

.battle-actions {
  text-align: center;
  padding: 20px;
}

.start-battle-btn {
  padding: 16px 48px;
  font-size: 18px;
}

.battle-arena {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.arena-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.fighter {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.fighter.enemy {
  flex-direction: row-reverse;
}

.fighter-avatar {
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fighter-emoji {
  font-size: 48px;
}

.fighter-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fighter-name {
  font-size: 16px;
  font-weight: 600;
}

.hp-bar {
  width: 200px;
  height: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.player-hp {
  background: var(--success-color);
}

.enemy-hp {
  background: var(--danger-color);
}

.hp-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.vs-badge {
  width: 60px;
  height: 60px;
  background: var(--gradient-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.battle-log {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.battle-log h3 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-entry {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 13px;
  display: flex;
  gap: 12px;
}

.log-entry.player {
  border-left: 3px solid var(--success-color);
}

.log-entry:not(.player) {
  border-left: 3px solid var(--danger-color);
}

.log-entry.critical {
  background: rgba(245, 158, 11, 0.2);
}

.round {
  color: var(--text-secondary);
  min-width: 60px;
}

.action {
  flex: 1;
}

.critical-text {
  color: var(--warning-color);
  font-weight: 600;
}

.damage {
  color: var(--danger-color);
  font-weight: 500;
}

.battle-result {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.result-content {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 40px;
  text-align: center;
}

.result-content.win {
  border: 2px solid var(--success-color);
}

.result-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.result-content h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.result-content p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}
</style>
