export interface Wallet {
  id?: number;
  code?: string;
  phoneNumber?: string;
  email?: string;
  balance?: number;
  currentBalance?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
}

export interface CreateWalletPayload {
  phoneNumber: string;
  email: string;
  initialBalance: number;
  code: string;
  currency: string;
}

export interface DepositPayload {
  amount: number;
  paymentMethod: string;
}

export interface WithdrawPayload {
  phoneNumber: string;
  amount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}
