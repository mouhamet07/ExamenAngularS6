import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Wallet } from '../../../core/models/wallet.model';
import { WalletApiService } from '../../../core/services/wallet-api.service';

@Component({
  selector: 'app-wallet-list',
  imports: [CurrencyPipe],
  templateUrl: './wallet-list.component.html',
  styleUrl: './wallet-list.component.css',
})
export class WalletListComponent implements OnInit {
  readonly wallets = signal<Wallet[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  readonly firstItem = computed(() =>
    this.totalElements() === 0 ? 0 : this.page() * this.size() + 1,
  );
  readonly lastItem = computed(() =>
    Math.min((this.page() + 1) * this.size(), this.totalElements()),
  );
  readonly canGoPrevious = computed(() => this.page() > 0 && !this.isLoading());
  readonly canGoNext = computed(() => this.page() + 1 < this.totalPages() && !this.isLoading());

  constructor(private readonly walletApi: WalletApiService) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets(page = this.page()): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.walletApi
      .getWallets(page, this.size())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.wallets.set(response.content);
          this.page.set(response.number);
          this.size.set(response.size);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);
        },
        error: () => {
          this.wallets.set([]);
          this.errorMessage.set(
            "Impossible de charger les portefeuilles. Verifiez que l'API BadWallet est demarree sur le port 8080.",
          );
        },
      });
  }

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.loadWallets(this.page() - 1);
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.loadWallets(this.page() + 1);
    }
  }

  formatBalance(wallet: Wallet): number {
    return wallet.balance ?? wallet.currentBalance ?? 0;
  }

  trackWallet(_index: number, wallet: Wallet): number | string {
    return wallet.id ?? wallet.code ?? wallet.phoneNumber ?? _index;
  }
}
