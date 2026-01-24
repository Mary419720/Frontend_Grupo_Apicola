import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { SalesService, Sale } from '../../../../core/services/sales.service';
import { ProductStore } from '../../../../core/services/product.store';
import { ProductActionsService } from '../../../../core/services/product-actions.service';
import { Product, Presentation } from '../../../../core/models/product.model';
import { LucideAngularModule, Trash2, PlusCircle, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.scss']
})
export class SalesFormComponent implements OnInit {
  saleForm!: FormGroup;
  allProducts: Product[] = [];
  // Almacena las presentaciones disponibles para cada fila del formulario
  availablePresentations: { [key: number]: Presentation[] } = {};

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private productStore: ProductStore,
    private productActionsService: ProductActionsService
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Cargar todos los productos para el formulario de ventas
    this.productActionsService.fetchFilteredProducts(1, { limit: 1000 }).subscribe();
    this.productStore.products$.subscribe(products => {
      this.allProducts = products.filter(p => p.activo && p.presentaciones.some(pres => pres.activo));
    });
  }

  private initForm(): void {
    this.saleForm = this.fb.group({
      cliente: this.fb.group({
        tipo: ['invitado', Validators.required],
        nombre: ['', Validators.required],
        email: ['', Validators.email],
        rfc: [''],
        direccion: ['']
      }),
      productos: this.fb.array([this.createProductFormGroup()]),
      totales: this.fb.group({
        subtotal: [{ value: 0, disabled: true }],
        descuento: [0, [Validators.min(0)]],
        aplica_iva: [true], // Control para el checkbox de IVA
        iva: [{ value: 0, disabled: true }],
        total: [{ value: 0, disabled: true }],
        moneda: ['MXN'],
        metodo_pago: ['', Validators.required]
      }),
      notas: [''],
      ubicacion_venta: ['']
    });

    // Recalcular totales cuando cambien los productos, el descuento o la opción de IVA
    this.productos.valueChanges.subscribe(() => this.calculateTotals());
    this.saleForm.get('totales.descuento')?.valueChanges.subscribe(() => this.calculateTotals());
    this.saleForm.get('totales.aplica_iva')?.valueChanges.subscribe(() => this.calculateTotals());
  }



  get productos(): FormArray {
    return this.saleForm.get('productos') as FormArray;
  }

  createProductFormGroup(): FormGroup {
    const group = this.fb.group({
      producto_id: ['', Validators.required],
      presentacion_id: ['', Validators.required],
      nombre: [{ value: '', disabled: true }],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      stock_disponible: [{ value: 0, disabled: true }],
      precio_unitario: [{ value: 0, disabled: true }],
      subtotal_producto: [{ value: 0, disabled: true }]
    });

    // Cuando se selecciona un producto, cargar sus presentaciones
    group.get('producto_id')?.valueChanges.subscribe(productId => {
      const rowIndex = this.productos.controls.indexOf(group);
      const selectedProduct = this.allProducts.find(p => p._id === productId);
      this.availablePresentations[rowIndex] = selectedProduct ? selectedProduct.presentaciones.filter(p => p.activo) : [];
      group.get('presentacion_id')?.reset('');
    });

    // Cuando se selecciona una presentación, autocompletar datos
    group.get('presentacion_id')?.valueChanges.subscribe(presentationId => {
      const rowIndex = this.productos.controls.indexOf(group);
      const presentations = this.availablePresentations[rowIndex] || [];
      const selectedPresentation = presentations.find(p => p._id === presentationId);

      if (selectedPresentation) {
        group.patchValue({
          nombre: `${this.allProducts.find(p => p._id === group.value.producto_id)?.nombre} (${selectedPresentation.formato})`,
          precio_unitario: selectedPresentation.precio_venta,
          stock_disponible: selectedPresentation.stock
        }, { emitEvent: false });
      }
      this.calculateTotals();
    });

    return group;
  }

  addProduct(): void {
    this.productos.push(this.createProductFormGroup());
  }

  removeProduct(index: number): void {
    this.productos.removeAt(index);
    delete this.availablePresentations[index];
  }

  calculateTotals(): void {
    let subtotal = 0;
    this.productos.controls.forEach(group => {
      const cantidad = group.get('cantidad')?.value || 0;
      const precio = group.get('precio_unitario')?.value || 0;
      const subtotalProducto = cantidad * precio;
      group.get('subtotal_producto')?.setValue(subtotalProducto, { emitEvent: false });
      subtotal += subtotalProducto;
    });

    const descuento = this.saleForm.get('totales.descuento')?.value || 0;
    const aplica_iva = this.saleForm.get('totales.aplica_iva')?.value;
    const iva = aplica_iva ? subtotal * 0.16 : 0;
    const total = subtotal - descuento + iva;

    this.saleForm.get('totales')?.patchValue({ subtotal, iva, total }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      console.error('Formulario inválido.');
      return;
    }

    const formValue = this.saleForm.getRawValue();
    const saleData: Sale = {
      cliente: formValue.cliente,
      productos: formValue.productos.map((p: any) => ({
        producto_id: p.producto_id,
        presentacion_id: p.presentacion_id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
        subtotal_producto: p.subtotal_producto,
        unidad: '' // La unidad se puede obtener de la presentación si es necesario
      })),
      totales: {
        subtotal: formValue.totales.subtotal,
        descuento: formValue.totales.descuento,
        iva: formValue.totales.iva,
        total: formValue.totales.total,
        moneda: formValue.totales.moneda
      },
      metodo_pago: formValue.totales.metodo_pago, // Corregido para leer desde el grupo 'totales'
      notas: formValue.notas,
      ubicacion_venta: formValue.ubicacion_venta
    };

    this.salesService.createSale(saleData).subscribe({
      next: (response) => {
        console.log('Venta creada exitosamente:', response);
        alert('Venta registrada con éxito!');
        this.saleForm.reset();
        this.productos.clear();
        this.addProduct();
      },
      error: (error) => {
        console.error('Error al crear la venta:', error);
        alert(`Error: ${error.error?.message || 'No se pudo registrar la venta.'}`);
      }
    });
  }
}



