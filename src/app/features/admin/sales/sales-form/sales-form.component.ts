import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SalesService, Product as ProductInterface, Sale } from '../../../../core/services/sales.service'; // Ajusta la ruta si es necesario
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './sales-form.component.html',
  styleUrl: './sales-form.component.scss'
})
export class SalesFormComponent implements OnInit {
  saleForm!: FormGroup;
  availableProducts$: Observable<ProductInterface[]> | undefined;
  private allProducts: ProductInterface[] = []; // Para búsqueda local

  constructor(private fb: FormBuilder, private salesService: SalesService) {}

  ngOnInit(): void {
    this.availableProducts$ = this.salesService.getProducts();
    this.availableProducts$.subscribe(products => {
      this.allProducts = products;
    });

    this.saleForm = this.fb.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required], // Fecha actual por defecto
      cliente: this.fb.group({
        tipo: ['visitante', Validators.required],
        usuario_id: [''],
        nombre: ['', Validators.required],
        email: ['', [Validators.email]]
      }),
      productos: this.fb.array([this.crearProductoFormGroup()]),
      totales: this.fb.group({
        descuento: [0, [Validators.min(0)]],
        moneda: ['MXN', Validators.required],
        // Estos se calcularán y se podrían mostrar o solo enviar
        subtotalGeneral: [{ value: 0, disabled: true }],
        totalGeneral: [{ value: 0, disabled: true }]
      }),
      metodo_pago: ['', Validators.required],
      observaciones: [''],
      ubicacion_venta: ['']
    });

    this.productos.valueChanges.subscribe(() => this.calcularTotales());
    this.saleForm.get('totales.descuento')?.valueChanges.subscribe(() => this.calcularTotales());
  }

  get productos(): FormArray {
    return this.saleForm.get('productos') as FormArray;
  }

  crearProductoFormGroup(): FormGroup {
    const productoFormGroup = this.fb.group({
      producto_id: ['', Validators.required],
      nombre: [{ value: '', disabled: true }],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      unidad: [{ value: '', disabled: true }],
      precio_unitario: [{ value: 0, disabled: true }],
      subtotal_producto: [{ value: 0, disabled: true }]
    });

    // Escuchar cambios en producto_id para autocompletar
    productoFormGroup.get('producto_id')?.valueChanges.subscribe(productId => {
      const selectedProduct = this.allProducts.find(p => p._id === productId);
      if (selectedProduct) {
        productoFormGroup.patchValue({
          nombre: selectedProduct.nombre,
          unidad: selectedProduct.unidad,
          precio_unitario: selectedProduct.precio_unitario
        }, { emitEvent: false }); // Evitar bucle infinito de valueChanges
      }
      this.calcularTotales(); // Recalcular si el producto cambia
    });

    // Escuchar cambios en cantidad o precio_unitario para recalcular subtotal del producto
    productoFormGroup.get('cantidad')?.valueChanges.subscribe(() => this.calcularTotales());
    // precio_unitario está deshabilitado, pero si se habilita, también debería recalcular
    // productoFormGroup.get('precio_unitario')?.valueChanges.subscribe(() => this.calcularTotales()); 

    return productoFormGroup;
  }

  agregarProducto(): void {
    this.productos.push(this.crearProductoFormGroup());
  }

  removerProducto(index: number): void {
    this.productos.removeAt(index);
    this.calcularTotales(); // Recalcular totales si se remueve un producto
  }

  calcularTotales(): void {
    let subtotalGeneral = 0;
    this.productos.controls.forEach(productoForm => {
      const cantidad = productoForm.get('cantidad')?.value || 0;
      const precioUnitario = productoForm.get('precio_unitario')?.value || 0;
      const subtotalProducto = cantidad * precioUnitario;
      productoForm.get('subtotal_producto')?.setValue(subtotalProducto, { emitEvent: false });
      subtotalGeneral += subtotalProducto;
    });

    const descuento = this.saleForm.get('totales.descuento')?.value || 0;
    const totalGeneral = subtotalGeneral - descuento; // Añadir lógica de impuestos si es necesario

    this.saleForm.get('totales.subtotalGeneral')?.setValue(subtotalGeneral, { emitEvent: false });
    this.saleForm.get('totales.totalGeneral')?.setValue(totalGeneral, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.saleForm.valid) {
      const saleData: Sale = {
        ...this.saleForm.value,
        // Asegurarse de que los productos tengan la estructura correcta de SaleProduct
        // y que los totales también estén bien formados.
        // El _id de la venta se generaría en el backend.
        // El estado también podría ser manejado por el backend.
        productos: this.saleForm.value.productos.map((p: any) => ({
          producto_id: p.producto_id,
          nombre: this.allProducts.find(ap => ap._id === p.producto_id)?.nombre || p.nombre, // Tomar nombre del producto original
          cantidad: p.cantidad,
          unidad: this.allProducts.find(ap => ap._id === p.producto_id)?.unidad || p.unidad,
          precio_unitario: this.allProducts.find(ap => ap._id === p.producto_id)?.precio_unitario || p.precio_unitario,
          subtotal_producto: p.subtotal_producto
        })),
        totales: {
          descuento: this.saleForm.value.totales.descuento,
          moneda: this.saleForm.value.totales.moneda,
          total: this.saleForm.value.totales.totalGeneral // Usar el total calculado
          // subtotal: this.saleForm.value.totales.subtotalGeneral, // Podrías incluirlo si es necesario
        }
      };

      console.log('Enviando Venta:', saleData);
      this.salesService.createSale(saleData).subscribe({
        next: (response) => {
          console.log('Venta creada exitosamente (simulado):', response);
          alert('Venta registrada exitosamente!');
          this.saleForm.reset();
          // Podrías redirigir a la lista de ventas o al detalle de la venta creada
          // this.router.navigate(['/admin/sales']);
        },
        error: (error) => {
          console.error('Error al crear la venta:', error);
          alert('Hubo un error al registrar la venta.');
        }
      });
    } else {
      console.error('Formulario inválido');
      this.saleForm.markAllAsTouched();
    }
  }
}


