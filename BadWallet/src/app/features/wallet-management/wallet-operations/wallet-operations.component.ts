import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Wallet } from '../../../core/models/wallet.model';
import { WalletApiService } from '../../../core/services/wallet-api.service';

@Component({
  selector: 'app-wallet-operations',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './wallet-operations.component.html',
  styleUrl: './wallet-operations.component.css',
})
export class WalletOperationsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly walletApi = inject(WalletApiService);

  readonly wallet = signal<Wallet | null>(null);
  readonly isSearching = signal(false);
  readonly isDepositing = signal(false);
  readonly isWithdrawing = signal(false);
  readonly searchError = signal('');
  readonly operationMessage = signal('');
  readonly operationError = signal('');

  readonly currentBalance = computed(() => {
    const wallet = this.wallet();
    return wallet ? wallet.balance ?? wallet.currentBalance ?? 0 : 0;
  });

  readonly searchForm = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+221[0-9]{9}$/)]],
  });

  readonly depositForm = this.fb.nonNullable.group({
    amount: [1000, [Validators.required, Validators.min(1)]],
    paymentMethod: ['CREDIT_CARD', [Validators.required]],
  });

  readonly withdrawForm = this.fb.nonNullable.group({
    amount: [1000, [Validators.required, Validators.min(1)]],
  });

  searchWallet(): void {
    this.searchError.set('');
    this.operationError.set('');
    this.operationMessage.set('');

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.isSearching.set(true);

    this.walletApi
      .getWalletByPhone(this.searchForm.controls.phoneNumber.value)
      .pipe(finalize(() => this.isSearching.set(false)))
      .subscribe({
        next: (wallet) => {
          this.wallet.set(wallet);
          this.withdrawForm.controls.amount.setValue(1000);
          this.depositForm.controls.amount.setValue(1000);
        },
        error: () => {
          this.wallet.set(null);
          this.searchError.set('Aucun portefeuille trouve pour ce numero.');
        },
      });
  }

  deposit(): void {
    this.operationError.set('');
    this.operationMessage.set('');

    const wallet = this.wallet();
    if (!wallet?.id) {
      this.operationError.set("Recherchez d'abord un portefeuille valide.");
      return;
    }

    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    this.isDepositing.set(true);

    this.walletApi
      .deposit(wallet.id, this.depositForm.getRawValue())
      .pipe(finalize(() => this.isDepositing.set(false)))
      .subscribe({
        next: () => {
          this.operationMessage.set('Depot effectue avec succes.');
          this.refreshSelectedWallet();
        },
        error: () => {
          this.operationError.set("Le depot n'a pas pu etre effectue.");
        },
      });
  }

  withdraw(): void {
    this.operationError.set('');
    this.operationMessage.set('');

    const wallet = this.wallet();
    if (!wallet?.phoneNumber) {
      this.operationError.set("Recherchez d'abord un portefeuille valide.");
      return;
    }

    if (this.withdrawForm.invalid) {
      this.withdrawForm.markAllAsTouched();
      return;
    }

    this.isWithdrawing.set(true);

    this.walletApi
      .withdraw({
        phoneNumber: wallet.phoneNumber,
        amount: this.withdrawForm.controls.amount.value,
      })
      .pipe(finalize(() => this.isWithdrawing.set(false)))
      .subscribe({
        next: () => {
          this.operationMessage.set('Retrait effectue avec succes.');
          this.refreshSelectedWallet();
        },
        error: () => {
          this.operationError.set("Le retrait n'a pas pu etre effectue.");
        },
      });
  }

  hasSearchError(): boolean {
    const control = this.searchForm.controls.phoneNumber;
    return control.invalid && (control.dirty || control.touched);
  }

  hasDepositAmountError(): boolean {
    const control = this.depositForm.controls.amount;
    return control.invalid && (control.dirty || control.touched);
  }

  hasWithdrawAmountError(): boolean {
    const control = this.withdrawForm.controls.amount;
    return control.invalid && (control.dirty || control.touched);
  }

  private refreshSelectedWallet(): void {
    const phoneNumber = this.wallet()?.phoneNumber;
    if (!phoneNumber) {
      return;
    }

    this.walletApi.getWalletByPhone(phoneNumber).subscribe({
      next: (wallet) => this.wallet.set(wallet),
    });
  }
}
