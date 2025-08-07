import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductActionsService } from '../../../core/services/product-actions.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category, Subcategory } from '../../../core/models/category.model';
import { APICULTURE_TYPES } from '../../../core/constants/apiculture.constants';
import { Product } from '../../../core/models/product.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  types: string[] = APICULTURE_TYPES;
  isLoading = true;
  errorMessage: string | null = null;
  imagePreviews: string[] = [];
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private productActionsService: ProductActionsService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      tipo: ['', Validators.required],
      categoria_id: ['', Validators.required],
      subcategoria_id: ['', Validators.required],
      estado_fisico: ['Líquido', Validators.required],
      activo: [true],
      presentaciones: this.fb.array([this.createPresentationGroup()])
    });

    this.loadInitialData();
    this.onCategoryChange();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.categoryService.loadCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las categorías. Por favor, intente más tarde.';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  private onCategoryChange(): void {
    this.productForm.get('categoria_id')!.valueChanges.subscribe((categoryId: string) => {
      if (categoryId) {
        this.categoryService.getSubcategories(categoryId).subscribe({
          next: (subcategories) => {
            this.subcategories = subcategories;
            this.productForm.get('subcategoria_id')!.setValue(''); // Resetea la selección de subcategoría
          },
          error: (err) => {
            console.error('Error al cargar subcategorías:', err);
            this.subcategories = []; // Limpia las subcategorías en caso de error
          }
        });
      } else {
        this.subcategories = []; // Limpia si no hay categoría seleccionada
      }
    });
  }

  createPresentationGroup(): FormGroup {
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    return this.fb.group({
      sku: ['', Validators.required],
      formato: ['', Validators.required],
      capacidad: ['', Validators.required],
      precio_venta: [0, [Validators.required, Validators.min(0)]],
      precio_compra: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.required, Validators.min(0)]],
      lote: [''],
      fecha_ingreso: [today],
      fecha_vencimiento: [''],
      proveedor: ['Melarium, Grupo Apicola de Oaxaca'],
      ubicacion: ['Av. Yucatán 402, Fraccionamiento San FELIPE, 68020 Oaxaca de Juárez, Oax.'],
      observaciones: [''],
      activo: [true]
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

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = [...this.selectedFiles, ...Array.from(files) as File[]];
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      console.error('Formulario no válido. Por favor, revisa los campos.');
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    const productData = this.productForm.value as Partial<Product>;
    const files = this.selectedFiles;

    this.productActionsService.createProduct(productData, files).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Producto guardado en MongoDB:', response.data);
          alert('¡Producto registrado exitosamente!');
          this.router.navigate(['/admin/manage-products']);
        } else {
          console.error('Error al guardar producto:', response.message);
          alert(`Error al guardar el producto: ${response.message || 'Intente nuevamente'}`);
        }
      },
      error: (error) => {
        console.error('Error de conexión al guardar producto:', error);
        alert('Error al conectar con el servidor. Por favor, intente nuevamente más tarde.');
      }
    });
  }
}
