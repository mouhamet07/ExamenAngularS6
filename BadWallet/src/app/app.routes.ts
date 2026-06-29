import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin/wallets',
    loadComponent: () =>
      import('./features/wallet-management/wallet-list/wallet-list.component').then(
        (m) => m.WalletListComponent,
      ),
  },
  {
    path: 'admin/wallets/new',
    loadComponent: () =>
      import('./features/wallet-management/wallet-create/wallet-create.component').then(
        (m) => m.WalletCreateComponent,
      ),
  },
  {
    path: 'admin/operations',
    loadComponent: () =>
      import('./features/wallet-management/wallet-operations/wallet-operations.component').then(
        (m) => m.WalletOperationsComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'admin/wallets' },
  { path: '**', redirectTo: 'admin/wallets' },
];
