import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClientContextService {
  readonly phoneNumber = signal('+221770000003');
  readonly walletCode = computed(() => {
    const suffix = this.phoneNumber().replace(/\D/g, '').slice(-7);
    return `WLT-${suffix.padStart(7, '0')}`;
  });

  updatePhoneNumber(phoneNumber: string): void {
    this.phoneNumber.set(phoneNumber);
  }
}
