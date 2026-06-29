import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CreateWalletPayload } from '../../../core/models/wallet.model';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { PhoneInputComponent } from '../../../shared/phone-input/phone-input.component';

@Component({
  selector: 'app-wallet-create',
  imports: [ReactiveFormsModule, RouterLink, PhoneInputComponent],
  templateUrl: './wallet-create.component.html',
  styleUrl: './wallet-create.component.css',
})
export class WalletCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly walletApi = inject(WalletApiService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly walletForm = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+221[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
    code: ['', [Validators.required, Validators.minLength(3)]],
    currency: ['XOF', [Validators.required]],
  });

  constructor() {
    this.walletForm.controls.code.setValue(this.generateWalletCode());
    this.walletForm.controls.code.disable();
    this.refreshBalance();
  }

  submit(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.walletForm.invalid) {
      this.walletForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.walletApi
      .createWallet(this.walletForm.getRawValue() as CreateWalletPayload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Portefeuille cree avec succes.');
          void this.router.navigate(['/admin/wallets']);
        },
        error: () => {
          this.errorMessage.set(
            "Creation impossible. Verifiez les informations saisies et que l'API BadWallet est demarree sur le port 8080.",
          );
        },
      });
  }

  hasError(controlName: keyof typeof this.walletForm.controls): boolean {
    const control = this.walletForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private generateWalletCode(): string {
    const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `WLT-${randomPart}`;
  }
}
