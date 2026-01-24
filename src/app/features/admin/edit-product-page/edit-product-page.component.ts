import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ProductActionsService } from '../../../core/services/product-actions.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category, Subcategory } from '../../../core/models/category.model';
import { APICULTURE_TYPES } from '../../../core/constants/apiculture.constants';
import { Product } from '../../../core/models/product.model';
import { forkJoin } from 'rxjs';
import { switchMap, map, take, finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-product-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-product-page.component.html',
  styleUrls: ['./edit-product-page.component.scss']
})
export class EditProductPageComponent implements OnInit {
  isSubmitting = false;
  productForm!: FormGroup;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  types: string[] = APICULTURE_TYPES;

  imagePreviews: { url: string; source: 'Existente' | 'Nueva'; file?: File, originalUrl?: string }[] = [];
  filesToUpload: File[] = [];

  isLoading = true;
  errorMessage: string | null = null;
  productId: string | null = null;
  
  // URL base para acceder a las imágenes del backend
  private apiBaseUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private productActionsService: ProductActionsService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (!this.productId) {
      this.errorMessage = 'No se encontró el ID del producto.';
      this.isLoading = false;
      return;
    }

    this.initForm();
    this.loadInitialData();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      tipo: ['', Validators.required],
      categoria_id: ['', Validators.required],
      subcategoria_id: ['', Validators.required],
      estado: ['Activo', Validators.required],
      estado_fisico: ['Sólido', Validators.required],

      activo: [true],
      presentaciones: this.fb.array([])
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    const categories$ = this.categoryService.loadCategories().pipe(take(1));
    const product$ = this.productService.getProductById(this.productId!);

    forkJoin({ categories: categories$, product: product$ }).pipe(
      switchMap(({ categories, product }) => {
        this.categories = categories;
        if (product.success && product.data) {
          return this.categoryService.getSubcategories(product.data.categoria_id).pipe(
            map(subcategories => ({ product: product.data, subcategories }))
          );
        } else {
          throw new Error(`No se pudo encontrar el producto con ID: ${this.productId}`);
        }
      }),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ product, subcategories }) => {
        this.subcategories = subcategories;
        this.patchForm(product);
        this.setupInitialImages(product.imagenes || []);
        this.onCategoryChange();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar los datos iniciales.';
      }
    });
  }

  private patchForm(product: Product): void {
    this.productForm.patchValue({
      ...product,
      categoria_id: product.categoria_id,
      subcategoria_id: product.subcategoria_id
    }, { emitEvent: false });

    const presentacionesArray = this.productForm.get('presentaciones') as FormArray;
    presentacionesArray.clear();
    product.presentaciones.forEach(p => {
      presentacionesArray.push(this.createPresentationGroup(p));
    });
  }

  private setupInitialImages(imageUrls: string[]): void {
    this.imagePreviews = imageUrls.map(url => ({
      url: this.getFullImageUrl(url),
      source: 'Existente',
      originalUrl: url
    }));
  }
  
  /**
   * Convierte una ruta relativa de imagen en una URL completa
   * @param imagePath Ruta de la imagen (relativa o absoluta)
   * @returns URL completa para acceder a la imagen
   */
  private getFullImageUrl(imagePath: string): string {
    // Si la imagen es vacía o undefined, usar placeholder
    if (!imagePath) {
      return 'assets/images/placeholder-product.jpg';
    }
    
    // Si ya es una URL completa (comienza con http:// o https://), devolverla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si es una ruta de activos estáticos, devolverla tal cual
    if (imagePath.startsWith('assets/')) {
      return imagePath;
    }
    
    // Si es una ruta que comienza con /uploads/, construir la URL correcta
    if (imagePath.startsWith('/uploads/')) {
      return `${this.apiBaseUrl}${imagePath}`;
    }
    
    // De lo contrario, asumir que es una ruta relativa y añadir / antes
    return `${this.apiBaseUrl}/${imagePath}`;
  }

  private onCategoryChange(): void {
    this.productForm.get('categoria_id')!.valueChanges.subscribe((categoryId: string) => {
      if (categoryId) {
        this.categoryService.getSubcategories(categoryId).subscribe({
          next: (subcategories) => {
            this.subcategories = subcategories;
            const currentSubcategoryId = this.productForm.get('subcategoria_id')!.value;
            if (!subcategories.some(s => s._id === currentSubcategoryId)) {
                this.productForm.get('subcategoria_id')!.setValue('');
            }
          },
          error: (err) => {
            console.error('Error al cargar subcategorías:', err);
            this.subcategories = [];
          }
        });
      } else {
        this.subcategories = [];
        this.productForm.get('subcategoria_id')!.setValue('');
      }
    });
  }

  createPresentationGroup(presentation?: any): FormGroup {
    return this.fb.group({
      _id: [presentation?._id || null],
      sku: [presentation?.sku || '', Validators.required],
      formato: [presentation?.formato || '', Validators.required],
      capacidad: [presentation?.capacidad || '', Validators.required],
      precio_venta: [presentation?.precio_venta || 0, [Validators.required, Validators.min(0)]],
      precio_compra: [presentation?.precio_compra || 0, [Validators.required, Validators.min(0)]],
      stock: [presentation?.stock || 0, [Validators.required, Validators.min(0)]],
      stock_minimo: [presentation?.stock_minimo || 0, [Validators.required, Validators.min(0)]],
      lote: [presentation?.lote || ''],
      fecha_ingreso: [presentation?.fecha_ingreso ? new Date(presentation.fecha_ingreso).toISOString().split('T')[0] : ''],
      fecha_vencimiento: [presentation?.fecha_vencimiento ? new Date(presentation.fecha_vencimiento).toISOString().split('T')[0] : ''],
      proveedor: [presentation?.proveedor || ''],
      ubicacion: [presentation?.ubicacion || ''],
      observaciones: [presentation?.observaciones || ''],
      activo: [presentation?.activo ?? true]
    });
  }

  get presentaciones(): FormArray {
    return this.productForm.get('presentaciones') as FormArray;
  }

  addPresentation(): void {
    this.presentaciones.push(this.createPresentationGroup());
  }

  onDeletePresentation(index: number): void {
    const presentationFormGroup = this.presentaciones.at(index) as FormGroup;
    const presentationId = presentationFormGroup.get('_id')?.value;
    const productId = this.productId;

    // Si la presentación no tiene ID, es nueva y solo existe en el formulario.
    if (!presentationId || !productId) {
      this.presentaciones.removeAt(index);
      return;
    }

    // Si es la última presentación, advertir al usuario.
    if (this.presentaciones.length === 1) {
      if (!confirm('Esta es la última presentación. ¿Estás seguro? Es recomendable eliminar el producto completo en su lugar.')) {
        return;
      }
    } else {
      if (!confirm('¿Estás seguro de que quieres eliminar esta presentación?')) {
        return;
      }
    }

    this.isSubmitting = true;
    this.productService.deletePresentation(productId, presentationId).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        this.presentaciones.removeAt(index);
        alert('Presentación eliminada correctamente.');
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Error al eliminar la presentación.';
        alert(this.errorMessage);
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
        if (this.imagePreviews.length + files.length > 5) {
            alert('No puedes subir más de 5 imágenes en total.');
            return;
        }
      for (const file of files) {
        this.filesToUpload.push(file);
        this.imagePreviews.push({
          url: URL.createObjectURL(file),
          source: 'Nueva',
          file
        });
      }
    }
  }

  onDeleteProduct(): void {
    if (!this.productId) {
      this.errorMessage = 'No se puede eliminar un producto que aún no ha sido guardado.';
      alert(this.errorMessage);
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción lo marcará como inactivo y no aparecerá en las listas públicas.')) {
      this.isSubmitting = true;
      this.productService.deleteProduct(this.productId).pipe(
        finalize(() => this.isSubmitting = false)
      ).subscribe({
        next: () => {
          alert('Producto eliminado correctamente.');
          this.router.navigate(['/admin/manage-products']);
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Error al eliminar el producto.';
          alert(this.errorMessage);
        }
      });
    }
  }

  removeImage(index: number): void {
    const image = this.imagePreviews[index];
    if (image.source === 'Nueva') {
      this.filesToUpload = this.filesToUpload.filter(f => f !== image.file);
    }
    this.imagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    if (!this.productId) {
      this.errorMessage = "Error crítico: No se encontró el ID del producto para la actualización.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    // Obtener los datos del formulario y castear a un objeto de producto parcial
    const productData = this.productForm.getRawValue() as Partial<Product>;

    // Asignar solo las URLs de las imágenes existentes al payload
    productData.imagenes = this.imagePreviews
      .filter(p => p.source === 'Existente')
      .map(p => p.originalUrl!);

    // Los nuevos archivos se pasarán por separado
    const filesToUpload = this.filesToUpload;

    this.productActionsService.updateProduct(this.productId, productData, filesToUpload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        console.log('Producto actualizado con éxito', response);
        alert('¡Producto actualizado exitosamente!');
        this.router.navigate(['/admin/manage-products']);
      },
      error: (error) => {
        console.error('Error al actualizar el producto', error);
        this.errorMessage = error?.error?.message || 'Ocurrió un error al actualizar el producto. Por favor, inténtalo de nuevo.';
        alert(this.errorMessage);
      }
    });
  }
}

