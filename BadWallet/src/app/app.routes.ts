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
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/client/dashboard/client-dashboard.component').then(
        (m) => m.ClientDashboardComponent,
      ),
  },
  {
    path: 'transfer',
    loadComponent: () =>
      import('./features/client/transfer/client-transfer.component').then(
        (m) => m.ClientTransferComponent,
      ),
  },
  {
    path: 'bills',
    loadComponent: () =>
      import('./features/client/bills/client-bills.component').then((m) => m.ClientBillsComponent),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/client/transactions/client-transactions.component').then(
        (m) => m.ClientTransactionsComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
