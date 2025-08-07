import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para una entrada en la caché
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Servicio avanzado de caché para productos con:
 * - TTL (Time to Live) configurable
 * - Límite de tamaño máximo (LRU - Least Recently Used)
 * - Invalidación selectiva y global
 * - Diagnóstico de rendimiento
 */
@Injectable({
  providedIn: 'root'
})
export class ProductCacheService {
  /** Almacenamiento principal de la caché usando un Map para acceso O(1) */
  private cache = new Map<string, CacheEntry<any>>();
  
  /** Lista LRU para mantener el orden de uso de claves */
  private lruList: string[] = [];
  
  /** Tiempo de vida máximo de una entrada en caché (en milisegundos) */
  private maxAge: number = 5 * 60 * 1000; // 5 minutos por defecto
  
  /** Tamaño máximo de la caché (número de entradas) */
  private maxSize: number = 50;
  
  /** Estadísticas de rendimiento de la caché */
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor() {
    // Configurar valores según entorno
    if (environment.production) {
      this.maxAge = 10 * 60 * 1000; // 10 minutos en producción
      this.maxSize = 100; // Más entradas en producción
    }
    
    // Configurar limpieza automática cada minuto
    setInterval(() => this.cleanExpired(), 60 * 1000);
  }

  /**
   * Guarda un valor en la caché
   * @param key Clave única para el valor
   * @param data Datos a almacenar
   * @param customTtl TTL personalizado (opcional)
   */
  set<T>(key: string, data: T, customTtl?: number): void {
    // Si la caché está llena, eliminar el elemento menos usado
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Guardar datos con timestamp actual
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Actualizar la lista LRU
    this.updateLRU(key);
    
    if (environment.debugMode) {
      console.log(`[ProductCacheService] Guardado en caché: ${key}`);
    }
  }

  /**
   * Recupera un valor de la caché
   * @param key Clave del valor a recuperar
   * @returns Los datos almacenados o null si no existen o están expirados
   */
  /**
   * Obtiene las claves de caché que coincidan con un patrón
   * @param pattern Patrón para filtrar claves (puede ser string o RegExp)
   * @returns Array de claves de caché que coinciden con el patrón
   */
  getKeysByPattern(pattern: string | RegExp): string[] {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const matchingKeys: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        matchingKeys.push(key);
      }
    });

    if (environment.debugMode) {
      console.log(`[ProductCacheService] Encontradas ${matchingKeys.length} claves por patrón: ${pattern}`);
    }

    return matchingKeys;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    // Si no existe la entrada, es un miss
    if (!entry) {
      this.stats.misses++;
      if (environment.debugMode) {
        console.log(`[ProductCacheService] Cache miss: ${key}`);
      }
      return null;
    }
    
    // Verificar si la entrada ha expirado
    const now = Date.now();
    if (now - entry.timestamp > this.maxAge) {
      this.delete(key);
      this.stats.misses++;
      if (environment.debugMode) {
        console.log(`[ProductCacheService] Cache expired: ${key}`);
      }
      return null;
    }
    
    // Actualizar posición LRU al acceder
    this.updateLRU(key);
    
    // Contabilizar un hit
    this.stats.hits++;
    if (environment.debugMode) {
      console.log(`[ProductCacheService] Cache hit: ${key}`);
    }
    
    return entry.data as T;
  }

  /**
   * Elimina una entrada específica de la caché
   * @param key Clave a eliminar
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.lruList = this.lruList.filter(k => k !== key);
  }

  /**
   * Elimina entradas de caché que coincidan con un patrón
   * @param pattern Patrón para filtrar claves (puede ser string o RegExp)
   */
  invalidateByPattern(pattern: string | RegExp): void {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    
    // Crear lista de claves a eliminar
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    // Eliminar las claves
    keysToDelete.forEach(key => this.delete(key));
    
    if (environment.debugMode) {
      console.log(`[ProductCacheService] Invalidadas ${keysToDelete.length} entradas por patrón: ${pattern}`);
    }
  }

  /**
   * Limpia toda la caché
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.lruList = [];
    
    if (environment.debugMode) {
      console.log(`[ProductCacheService] Caché limpiada: ${count} entradas eliminadas`);
    }
  }

  /**
   * Elimina todas las entradas caducadas
   */
  cleanExpired(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.maxAge) {
        this.delete(key);
        expiredCount++;
      }
    });
    
    if (environment.debugMode && expiredCount > 0) {
      console.log(`[ProductCacheService] Limpieza automática: ${expiredCount} entradas caducadas eliminadas`);
    }
  }

  /**
   * Expulsa la entrada menos usada recientemente
   */
  private evictLRU(): void {
    if (this.lruList.length > 0) {
      const oldest = this.lruList.shift();
      if (oldest) {
        this.cache.delete(oldest);
        this.stats.evictions++;
        
        if (environment.debugMode) {
          console.log(`[ProductCacheService] Expulsada entrada LRU: ${oldest}`);
        }
      }
    }
  }

  /**
   * Actualiza la posición de una clave en la lista LRU
   * @param key Clave a actualizar
   */
  private updateLRU(key: string): void {
    // Eliminar la clave si ya existe en la lista
    this.lruList = this.lruList.filter(k => k !== key);
    
    // Añadir la clave al final (más recientemente usada)
    this.lruList.push(key);
  }

  /**
   * Obtiene estadísticas del rendimiento de la caché
   */
  getStats(): {hits: number, misses: number, size: number, hitRatio: number} {
    const total = this.stats.hits + this.stats.misses;
    const hitRatio = total > 0 ? this.stats.hits / total : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRatio: Math.round(hitRatio * 100) / 100 // Redondeo a 2 decimales
    };
  }

  /**
   * Establece el tiempo de vida máximo para las entradas
   * @param milliseconds TTL en milisegundos
   */
  setMaxAge(milliseconds: number): void {
    this.maxAge = milliseconds;
  }

  /**
   * Establece el tamaño máximo de la caché
   * @param size Número máximo de entradas
   */
  setMaxSize(size: number): void {
    this.maxSize = size;
    
    // Si la caché ya excede el nuevo tamaño, eliminar entradas
    while (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }
}
