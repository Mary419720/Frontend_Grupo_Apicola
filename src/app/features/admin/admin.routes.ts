import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { CreateProductComponent } from './create-product/create-product.component'; // Importar el nuevo componente
import { SalesListComponent } from './sales/sales-list/sales-list.component';
import { SalesFormComponent } from './sales/sales-form/sales-form.component';
import { SaleDetailComponent } from './sales/sale-detail/sale-detail.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'manage-products',
        component: ManageProductsComponent
      },
      {
        path: 'create-product', // Nueva ruta para crear productos
        component: CreateProductComponent
      },
      // Aquí irán las rutas para editar productos, etc.
      {
        path: 'sales',
        component: SalesListComponent
      },
      {
        path: 'sales/new',
        component: SalesFormComponent
      },
      {
        path: 'sales/:id',
        component: SaleDetailComponent
      },
      {
        path: '',
        redirectTo: 'manage-products', // Redirigir a la gestión por defecto
        pathMatch: 'full'
      }
    ]
  }
];
