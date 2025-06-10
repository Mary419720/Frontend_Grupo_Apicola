import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { CreateProductComponent } from './create-product/create-product.component'; // Importar el nuevo componente

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
        path: '',
        redirectTo: 'manage-products', // Redirigir a la gestión por defecto
        pathMatch: 'full'
      }
    ]
  }
];
