import { Routes } from '@angular/router';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { CreateProductComponent } from './create-product/create-product.component'; // Importar el nuevo componente
import { EditProductPageComponent } from './edit-product-page/edit-product-page.component';
import { ProductDetailsComponent } from './product-details/product-details.component'; // Importar componente de detalles
import { SalesListComponent } from './sales/sales-list/sales-list.component';
import { SalesFormComponent } from './sales/sales-form/sales-form.component';
import { SaleDetailComponent } from './sales/sale-detail/sale-detail.component';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';

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
      {
        path: 'edit-product/:id',
        component: EditProductPageComponent
      },
      {
        path: 'product-details/:id',
        component: ProductDetailsComponent
      },
      {
        path: 'create-user',
        component: CreateUserComponent
      },
      // Aquí irán otras rutas de administración
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
        path: '', // Ruta por defecto para el dashboard
        component: DashboardOverviewComponent,
        pathMatch: 'full' // Asegura que esta ruta solo se active para '/admin' exacto
      }
    ]
  }
];
