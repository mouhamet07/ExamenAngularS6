import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { ClientContextService } from '../../../core/services/client-context.service';
import { WalletApiService } from '../../../core/services/wallet-api.service';

@Component({
  selector: 'app-client-dashboard',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css',
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  private readonly walletApi = inject(WalletApiService);
  readonly clientContext = inject(ClientContextService);
  private balanceSubscription?: Subscription;

  readonly balance = signal(0);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly incomeAmount = computed(() => Math.round(this.balance() * 0.38));
  readonly expenseAmount = computed(() => Math.round(this.balance() * 0.22));
  readonly incomePercent = computed(() => Math.min(100, Math.max(12, this.incomeAmount() / 3500)));
  readonly expensePercent = computed(() => Math.min(100, Math.max(12, this.expenseAmount() / 3500)));

  ngOnInit(): void {
    this.balanceSubscription = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => {
          this.isLoading.set(true);
          return this.walletApi.getBalance(this.clientContext.phoneNumber());
        }),
      )
      .subscribe({
        next: (balance) => {
          this.balance.set(balance);
          this.errorMessage.set('');
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Impossible de recuperer le solde actuel.');
          this.isLoading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.balanceSubscription?.unsubscribe();
  }
}
