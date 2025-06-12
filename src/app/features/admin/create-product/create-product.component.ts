import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, Presentation } from '../../../core/models/product.model';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit {
  productForm!: FormGroup;
  categories: { categoria: string; subcategorias: string[] }[] = [];
  subcategories: string[] = [];
  types: string[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categories = this.productService.getCategories();
    this.types = this.productService.getTypes();
    this.productForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      tipo: ['', Validators.required],
      categoria: ['', Validators.required],
      subcategoria: ['', Validators.required],
      estado: ['Activo', Validators.required],
      presentaciones: this.fb.array([this.createPresentationGroup()])
    });

    // Inicializar subcategorías y tipos si hay una categoría seleccionada
    this.productForm.get('categoria')!.valueChanges.subscribe((categoria: string) => {
      const found = this.categories.find(cat => cat.categoria === categoria);
      this.subcategories = found ? found.subcategorias : [];
      // Resetear subcategoría si cambia la categoría
      this.productForm.get('subcategoria')!.setValue('');
    });
  }

  createPresentationGroup(): FormGroup {
    return this.fb.group({
      sku: ['', Validators.required],
      formato: ['', Validators.required],
      capacidad: ['', Validators.required],
      precio_venta: [0, [Validators.required, Validators.min(0)]],
      precio_compra: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.required, Validators.min(0)]],
      lote: [''],
      fecha_ingreso: [''],
      fecha_vencimiento: [''],
      proveedor: [''],
      ubicacion: [''],
      observaciones: ['']
    });
  }

  get presentaciones(): FormArray {
    return this.productForm.get('presentaciones') as FormArray;
  }

  addPresentation(): void {
    this.presentaciones.push(this.createPresentationGroup());
  }

  removePresentation(index: number): void {
    this.presentaciones.removeAt(index);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProductData = this.productForm.value;
      
      // El servicio se encarga de los IDs, fecha_creacion e imagenes
      this.productService.addProduct(newProductData as Omit<Product, 'id' | 'fecha_creacion' | 'imagenes'> & { presentaciones: Omit<Presentation, 'id'>[] });
      
      alert('¡Producto registrado exitosamente!'); // O un toast/snackbar más elegante
      this.router.navigate(['/admin/manage-products']);
    } else {
      console.error('Formulario no válido. Por favor, revisa los campos.');
      // Marcar campos como tocados para mostrar errores de validación en la UI
      this.productForm.markAllAsTouched();
    }
  }
}
