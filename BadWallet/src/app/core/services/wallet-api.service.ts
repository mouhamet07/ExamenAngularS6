import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  CreateWalletPayload,
  DepositPayload,
  PayFacturesPayload,
  PageResponse,
  Transaction,
  TransferPayload,
  Wallet,
  WithdrawPayload,
} from '../models/wallet.model';

type WalletPageApiResponse =
  | PageResponse<Wallet>
  | {
      data?: Wallet[] | PageResponse<Wallet>;
      content?: Wallet[];
      totalElements?: number;
      totalPages?: number;
      size?: number;
      number?: number;
      first?: boolean;
      last?: boolean;
    }
  | ApiResponse<WalletPagePayload>;

interface ApiResponse<T> {
  success?: boolean;
  status?: number;
  message?: string;
  data?: T;
  timestamp?: string;
}

interface WalletPagePayload {
  data?: Wallet[];
  content?: Wallet[];
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
}

type WalletApiResponse = Wallet | ApiResponse<Wallet>;
type NumberApiResponse = number | ApiResponse<number>;
type TransactionsApiResponse = Transaction[] | ApiResponse<Transaction[]>;

@Injectable({ providedIn: 'root' })
export class WalletApiService {
  private readonly baseUrl = '/api/wallets';

  constructor(private readonly http: HttpClient) {}

  getWallets(page: number, size: number): Observable<PageResponse<Wallet>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http
      .get<WalletPageApiResponse>(this.baseUrl, { params })
      .pipe(map((response) => this.normalizePage(response, page, size)));
  }

  createWallet(payload: CreateWalletPayload): Observable<Wallet> {
    return this.http
      .post<WalletApiResponse>(this.baseUrl, payload)
      .pipe(map((response) => this.unwrapData(response)));
  }

  getWalletByPhone(phoneNumber: string): Observable<Wallet> {
    return this.http
      .get<WalletApiResponse>(`${this.baseUrl}/${encodeURIComponent(phoneNumber)}`)
      .pipe(map((response) => this.unwrapData(response)));
  }

  deposit(walletId: number, payload: DepositPayload): Observable<Wallet> {
    return this.http
      .post<WalletApiResponse>(`${this.baseUrl}/${walletId}/deposit`, payload)
      .pipe(map((response) => this.unwrapData(response)));
  }

  withdraw(payload: WithdrawPayload): Observable<Wallet> {
    return this.http
      .post<WalletApiResponse>(`${this.baseUrl}/withdraw`, payload)
      .pipe(map((response) => this.unwrapData(response)));
  }

  getBalance(phoneNumber: string): Observable<number> {
    return this.http
      .get<NumberApiResponse>(`${this.baseUrl}/${encodeURIComponent(phoneNumber)}/balance`)
      .pipe(map((response) => this.unwrapData(response)));
  }

  transfer(payload: TransferPayload): Observable<Wallet> {
    return this.http
      .post<WalletApiResponse>(`${this.baseUrl}/transfer`, payload)
      .pipe(map((response) => this.unwrapData(response)));
  }

  payFactures(payload: PayFacturesPayload): Observable<Wallet> {
    return this.http
      .post<WalletApiResponse>(`${this.baseUrl}/pay-factures`, payload)
      .pipe(map((response) => this.unwrapData(response)));
  }

  getTransactions(phoneNumber: string): Observable<Transaction[]> {
    return this.http
      .get<TransactionsApiResponse>(`${this.baseUrl}/${encodeURIComponent(phoneNumber)}/transactions`)
      .pipe(map((response) => this.unwrapData(response)));
  }

  private normalizePage(
    response: WalletPageApiResponse,
    requestedPage: number,
    requestedSize: number,
  ): PageResponse<Wallet> {
    const payload = this.unwrapData(response);

    if (Array.isArray(payload)) {
      return {
        content: payload,
        totalElements: payload.length,
        totalPages: payload.length > 0 ? 1 : 0,
        size: requestedSize,
        number: requestedPage,
      };
    }

    const pagePayload = payload as WalletPagePayload;
    const content = pagePayload.content ?? pagePayload.data ?? [];

    return {
      content,
      totalElements: pagePayload.totalElements ?? content.length,
      totalPages:
        pagePayload.totalPages ??
        Math.ceil((pagePayload.totalElements ?? content.length) / requestedSize),
      size: pagePayload.size ?? pagePayload.pageSize ?? requestedSize,
      number: pagePayload.number ?? pagePayload.currentPage ?? requestedPage,
      first: pagePayload.first,
      last: pagePayload.last,
    };
  }

  unwrapData<T>(response: T | ApiResponse<T>): T {
    if (
      response &&
      typeof response === 'object' &&
      'success' in response &&
      'data' in response &&
      response.data !== undefined
    ) {
      return response.data as T;
    }

    return response as T;
  }
}
