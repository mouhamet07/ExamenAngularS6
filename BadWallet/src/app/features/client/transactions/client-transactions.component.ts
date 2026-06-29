import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../core/models/wallet.model';
import { ClientContextService } from '../../../core/services/client-context.service';
import { WalletApiService } from '../../../core/services/wallet-api.service';

@Component({
  selector: 'app-client-transactions',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './client-transactions.component.html',
  styleUrl: './client-transactions.component.css',
})
export class ClientTransactionsComponent implements OnInit {
  private readonly walletApi = inject(WalletApiService);
  readonly clientContext = inject(ClientContextService);

  readonly transactions = signal<Transaction[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly typeFilter = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');

  readonly filteredTransactions = computed(() => {
    return this.transactions().filter((transaction) => {
      const type = (transaction.type ?? '').toUpperCase();
      const date = transaction.createdAt ?? transaction.date ?? '';
      const typeMatches = this.typeFilter() ? type === this.typeFilter() : true;
      const startMatches = this.startDate() ? date >= this.startDate() : true;
      const endMatches = this.endDate() ? date <= this.endDate() : true;
      return typeMatches && startMatches && endMatches;
    });
  });

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.walletApi.getTransactions(this.clientContext.phoneNumber()).subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set("Impossible de charger l'historique des transactions.");
        this.isLoading.set(false);
      },
    });
  }

  transactionDate(transaction: Transaction): string {
    return transaction.createdAt ?? transaction.date ?? '';
  }
}
