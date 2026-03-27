export interface BattleResult {
  winnerId: string
  loserId: string
  battleLog: BattleLogEntry[]
  rewards: {
    exp: number
    coins: number
  }
  timestamp: number
}

export interface BattleLogEntry {
  round: number
  attackerId: string
  skillId: string
  skillName: string
  damage: number
  remainingHp: number
  isCritical: boolean
}

export interface BattleState {
  playerPetId: string
  enemyPetId: string
  playerHp: number
  enemyHp: number
  currentRound: number
  isPlayerTurn: boolean
  battleLog: BattleLogEntry[]
  isFinished: boolean
  winner: string | null
}

export interface RankingEntry {
  userId: string
  userName: string
  avatar: string
  level: number
  points: number
  petLevel: number
  rank: number
}

export type RankingType = 'points' | 'level' | 'petLevel' | 'pkWins'
