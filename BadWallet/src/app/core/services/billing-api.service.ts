import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Facture } from '../models/wallet.model';

interface ApiResponse<T> {
  success?: boolean;
  status?: number;
  message?: string;
  data?: T;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly baseUrl = '/api/external/factures';

  constructor(private readonly http: HttpClient) {}

  getCurrentFactures(walletCode: string, unit?: string): Observable<Facture[]> {
    let params = new HttpParams();
    if (unit) {
      params = params.set('unite', unit);
    }

    return this.http
      .get<Facture[] | ApiResponse<Facture[]>>(`${this.baseUrl}/${walletCode}/current`, { params })
      .pipe(map((response) => this.unwrapData(response)));
  }

  private unwrapData<T>(response: T | ApiResponse<T>): T {
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
