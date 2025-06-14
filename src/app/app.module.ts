import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Importante para hacer peticiones HTTP

// AppComponent es standalone, no se importa aquí para declarations/bootstrap
// import { AppComponent } from './app.component';
// Si tienes un AppRoutingModule, impórtalo aquí también:
// import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    // AppComponent es standalone, no se declara aquí
    // ...otros componentes, directivas, pipes (que no sean standalone)
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Añadido para que AuthService funcione
    // AppRoutingModule // Descomenta si tienes routing
    // ...otros módulos
  ],
  providers: [
    // ...tus servicios, si no están con providedIn: 'root'
  ],
  bootstrap: [] // AppComponent es standalone, se arranca con bootstrapApplication en main.ts
})
export class AppModule { }
