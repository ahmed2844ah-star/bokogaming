
export enum AppSection {
  HOME = 'HOME',
  AVIATOR = 'AVIATOR',
  CRASH = 'CRASH',
  ROULETTE = 'ROULETTE',
  POKER = 'POKER',
  MINES = 'MINES',
  DICE = 'DICE',
  PLINKO = 'PLINKO',
  SLOTS = 'SLOTS',
  BLACKJACK = 'BLACKJACK',
  LIMBO = 'LIMBO',
  CRYPTO = 'CRYPTO',
  WALLET = 'WALLET',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  REFERRAL = 'REFERRAL'
}

export interface DepositMethod {
  id: string;
  name: string;
  icon: string;
  value: string;
  enabled: boolean;
  color: string;
}

export interface GameConfig {
  enabled: boolean;
  houseEdge: number;
  minBet: number;
  maxBet: number;
}

export interface ReferredUser {
  id: string;
  username: string;
  avatar: string;
  joinedDate: string;
  status: 'active' | 'inactive';
  totalContributed: number;
  commissionEarned: number;
}

export interface User {
  id: string;
  username: string;
  password?: string; // أضيفت للتحقق
  balance: number;
  bonusBalance: number;
  hasClaimedFirstBonus: boolean;
  avatar: string;
  joinedDate: string;
  referralCode?: string;
  referralCount?: number;
  referralEarnings?: number;
  referralLevel?: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  referralHistory?: ReferredUser[];
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'referral_bonus' | 'bonus_credit';
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  destination?: string;
}

export interface AdminSettings {
  depositMethods: DepositMethod[];
  minDeposit: number;
  minWithdrawal: number;
  withdrawalFee: number;
  gameSettings: Record<string, GameConfig>;
}
