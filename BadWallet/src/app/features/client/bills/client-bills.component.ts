import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Facture } from '../../../core/models/wallet.model';
import { BillingApiService } from '../../../core/services/billing-api.service';
import { ClientContextService } from '../../../core/services/client-context.service';
import { WalletApiService } from '../../../core/services/wallet-api.service';

@Component({
  selector: 'app-client-bills',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './client-bills.component.html',
  styleUrl: './client-bills.component.css',
})
export class ClientBillsComponent implements OnInit {
  private readonly billingApi = inject(BillingApiService);
  private readonly walletApi = inject(WalletApiService);
  readonly clientContext = inject(ClientContextService);

  readonly factures = signal<Facture[]>([]);
  readonly selectedReferences = signal<string[]>([]);
  readonly unitFilter = signal('');
  readonly isLoading = signal(false);
  readonly isPaying = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly selectedFactures = computed(() =>
    this.factures().filter((facture) => this.selectedReferences().includes(facture.reference)),
  );
  readonly selectedTotal = computed(() =>
    this.selectedFactures().reduce((total, facture) => total + facture.amount, 0),
  );

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedReferences.set([]);

    this.billingApi
      .getCurrentFactures(this.clientContext.walletCode(), this.unitFilter())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (factures) => this.factures.set(factures),
        error: () => this.errorMessage.set('Impossible de charger les factures impayees.'),
      });
  }

  toggleReference(reference: string, checked: boolean): void {
    const selected = this.selectedReferences();
    this.selectedReferences.set(
      checked ? [...selected, reference] : selected.filter((item) => item !== reference),
    );
  }

  paySelected(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const selected = this.selectedFactures();
    if (selected.length === 0) {
      this.errorMessage.set('Selectionnez au moins une facture.');
      return;
    }

    const serviceName = selected[0].unit || 'ISM';
    this.isPaying.set(true);

    this.walletApi
      .payFactures({
        phoneNumber: this.clientContext.phoneNumber(),
        serviceName,
        factureReferences: selected.map((facture) => facture.reference),
      })
      .pipe(finalize(() => this.isPaying.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Factures payees avec succes.');
          this.loadFactures();
        },
        error: () => this.errorMessage.set("Le paiement des factures n'a pas pu etre effectue."),
      });
  }
}
