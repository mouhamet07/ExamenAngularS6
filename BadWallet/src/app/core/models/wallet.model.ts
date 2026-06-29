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

export interface TransferPayload {
  senderPhone: string;
  receiverPhone: string;
  amount: number;
}

export interface Facture {
  reference: string;
  serviceName?: string;
  amount: number;
  status?: string;
  unit?: string;
  dueDate?: string;
}

export interface PayFacturesPayload {
  phoneNumber: string;
  serviceName: string;
  factureReferences: string[];
}

export interface Transaction {
  id?: number;
  reference?: string;
  type?: string;
  amount?: number;
  status?: string;
  description?: string;
  createdAt?: string;
  date?: string;
  senderPhone?: string;
  receiverPhone?: string;
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
