import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ClientContextService } from '../../../core/services/client-context.service';
import { WalletApiService } from '../../../core/services/wallet-api.service';

@Component({
  selector: 'app-client-transfer',
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './client-transfer.component.html',
  styleUrl: './client-transfer.component.css',
})
export class ClientTransferComponent {
  private readonly fb = inject(FormBuilder);
  private readonly walletApi = inject(WalletApiService);
  readonly clientContext = inject(ClientContextService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly balance = signal(0);

  readonly transferForm = this.fb.nonNullable.group({
    receiverPhone: ['', [Validators.required, Validators.pattern(/^\+221[0-9]{9}$/)]],
    amount: [1000, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.refreshBalance();
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const payload = {
      senderPhone: this.clientContext.phoneNumber(),
      receiverPhone: this.transferForm.controls.receiverPhone.value,
      amount: this.transferForm.controls.amount.value,
    };

    if (payload.senderPhone === payload.receiverPhone) {
      this.errorMessage.set("Le numero destinataire doit etre different de l'expediteur.");
      return;
    }

    this.isSubmitting.set(true);
    this.walletApi.getWalletByPhone(payload.receiverPhone).subscribe({
      next: () => {
        this.walletApi
          .transfer(payload)
          .pipe(finalize(() => this.isSubmitting.set(false)))
          .subscribe({
            next: () => {
              this.successMessage.set('Transfert effectue avec succes.');
              this.transferForm.controls.amount.setValue(1000);
              this.refreshBalance();
            },
            error: () => this.errorMessage.set("Le transfert n'a pas pu etre effectue."),
          });
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set("Le numero destinataire n'existe pas.");
      },
    });
  }

  hasError(controlName: keyof typeof this.transferForm.controls): boolean {
    const control = this.transferForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private refreshBalance(): void {
    this.walletApi.getBalance(this.clientContext.phoneNumber()).subscribe({
      next: (balance) => this.balance.set(balance),
    });
  }
}
