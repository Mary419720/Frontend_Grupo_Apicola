import { Injectable } from '@angular/core';
import { Presentation, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductAdapterService {

  constructor() { }

  /**
   * Adapta una presentación del formato del backend al formato del frontend.
   */
  private adaptBackendPresentation(backendPresentation: any): Presentation {
    return {
      _id: backendPresentation._id,
      id: backendPresentation._id, // Usamos _id para ambos en el frontend para simplicidad
      sku: backendPresentation.sku || '',
      formato: backendPresentation.formato || '',
      capacidad: backendPresentation.capacidad || '',
      precio_venta: backendPresentation.precio_venta || 0,
      precio_compra: backendPresentation.precio_compra,
      stock: backendPresentation.stock || 0,
      stock_minimo: backendPresentation.stock_minimo,
      lote: backendPresentation.lote,
      fecha_ingreso: backendPresentation.fecha_ingreso,
      fecha_vencimiento: backendPresentation.fecha_vencimiento,
      proveedor: backendPresentation.proveedor,
      ubicacion: backendPresentation.ubicacion,
      observaciones: backendPresentation.observaciones,
      activo: backendPresentation.activo
    };
  }

  /**
   * Adapta un producto del formato del backend al formato del frontend.
   */
  adaptBackendProduct(backendProduct: any): Product {
    if (!backendProduct) {
      return null as any;
    }
  
    const {
      _id,
      codigo = '',
      nombre = '',
      descripcion = '',
      tipo = '',
      categoria_id,
      subcategoria_id,
      estado_fisico = '',
      activo = false,
      fecha_creacion,
      fecha_actualizacion,
      presentaciones = [],
      imagenes = [],
      atributos = {}
    } = backendProduct;
  
    const getObjectId = (field: any): string => {
      if (!field) return '';
      return typeof field === 'object' && field !== null && field._id ? field._id : String(field);
    };
    
    return {
      _id,
      id: _id,
      codigo,
      nombre,
      descripcion,
      tipo,
      categoria_id: getObjectId(categoria_id),
      subcategoria_id: getObjectId(subcategoria_id),
      estado_fisico,
      activo,
      fecha_creacion,
      fecha_actualizacion,
      presentaciones: Array.isArray(presentaciones)
        ? presentaciones.filter(p => p.eliminado !== true).map(p => this.adaptBackendPresentation(p))
        : [],
      imagenes: Array.isArray(imagenes) ? imagenes : [],
      atributos
    };
  }

  /**
   * Adapta un producto del formato del frontend para enviarlo al backend.
   */
  adaptProductForBackend(product: Partial<Product>): any {
    if (!product) return {};

    const adaptedProduct: any = { ...product };
    
    delete adaptedProduct.id;
    delete adaptedProduct.atributos;
    delete adaptedProduct.fecha_creacion;
    delete adaptedProduct.fecha_actualizacion;

    if (adaptedProduct.presentaciones && Array.isArray(adaptedProduct.presentaciones)) {
      adaptedProduct.presentaciones = adaptedProduct.presentaciones.map((p: any) => {
        const cleanPresentation = { ...p };
        delete cleanPresentation.id;
        return cleanPresentation;
      });
    }

    return adaptedProduct;
  }

  adaptProductToFormData(product: Partial<Product>, files: File[], productId?: string): FormData {
    const formData = new FormData();
    const productToSend = this.adaptProductForBackend(product);

    if (productId) {
      formData.append('_id', productId);
    }

        // Convertir todo el objeto del producto a un string JSON y añadirlo bajo una única clave 'producto'.
    // El backend está configurado para leer los datos del producto desde este campo.
    formData.append('producto', JSON.stringify(productToSend));

    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        formData.append('imagenes', file, file.name);
      } else {
        console.warn('Archivo ignorado por tipo inválido (sólo se permiten imágenes):', file?.name);
      }
    });

    return formData;
  }
}
