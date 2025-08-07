import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, catchError, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/favorites`;

  private favorites = new BehaviorSubject<string[]>([]);
  favorites$ = this.favorites.asObservable();

  constructor() {
    // Se dispara la carga inicial, esperando a que el estado de auth se resuelva
    console.log('FavoritesService: constructor');
    this.initialLoad();
  }

  private initialLoad(): void {
    console.log('FavoritesService: initialLoad A');
    this.authService.isAuthenticated$.pipe(
      take(1), // Tomamos solo el primer valor estable para evitar recargas innecesarias
      switchMap(isAuthenticated => {
        console.log('FavoritesService: isAuthenticated$', isAuthenticated);
        if (isAuthenticated) {
          console.log('FavoritesService: Usuario autenticado, cargando favoritos del servidor...');
          return this.syncAndLoadFavorites();
        } else {
          console.log('FavoritesService: Usuario no autenticado, cargando favoritos locales...');
          this.loadFromLocalStorage();
          return of(null);
        }
      })
    ).subscribe(ids => {
      console.log('FavoritesService: initialLoad subscribe, ids recibidos:', ids);
      if (ids) {
        this.favorites.next(ids);
        console.log('FavoritesService: BehaviorSubject de favoritos actualizado con:', ids);
      }
    });
  }

  private getLocalFavorites(): string[] {
    const localFavorites = localStorage.getItem('favorites');
    return localFavorites ? JSON.parse(localFavorites) : [];
  }

  private saveToLocalStorage(favorites: string[]): void {
    console.log('FavoritesService: saveToLocalStorage', favorites);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    this.favorites.next(favorites);
  }

  private loadFromLocalStorage(): void {
    console.log('FavoritesService: loadFromLocalStorage');
    const localFavorites = this.getLocalFavorites();
    this.favorites.next(localFavorites);
  }

  private syncAndLoadFavorites() {
    console.log('FavoritesService: syncAndLoadFavorites');
    const localFavorites = this.getLocalFavorites();
    if (localFavorites.length > 0) {
      // Si hay favoritos locales, sincronízalos primero
      return this.http.post<any>(`${this.apiUrl}/sync`, { favorites: localFavorites }).pipe(
        tap(() => {
          console.log('FavoritesService: Sincronización de favoritos exitosa');
          localStorage.removeItem('favorites');
        }),
        switchMap(() => this.fetchFavoritesFromServer().pipe(
          tap(ids => {
            console.log('FavoritesService: Favoritos del servidor cargados:', ids);
            this.favorites.next(ids);
          })
        )),
        catchError(() => {
          console.error('FavoritesService: Error al sincronizar favoritos');
          return this.fetchFavoritesFromServer().pipe(
            tap(ids => {
              console.log('FavoritesService: Favoritos del servidor cargados:', ids);
              this.favorites.next(ids);
            })
          );
        }) // Incluso si la sincronización falla, intenta cargar
      );
    } else {
      // Si no hay nada que sincronizar, solo carga los del servidor
      return this.fetchFavoritesFromServer().pipe(
        tap(ids => {
          console.log('FavoritesService: Favoritos del servidor cargados:', ids);
          this.favorites.next(ids);
        })
      );
    }
  }

  private fetchFavoritesFromServer(): Observable<string[]> {
    console.log('FavoritesService: fetchFavoritesFromServer A');
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('FavoritesService: Respuesta de API de favoritos:', response);
        const favoriteIds = response.data.map((fav: any) => fav._id);
        console.log('FavoritesService: IDs de favoritos extraídos:', favoriteIds);
        return favoriteIds;
      }),
      catchError(error => {
        console.error('FavoritesService: Error al obtener favoritos del servidor:', error);
        return of([]);
      })
    );
  }

  toggleFavorite(productId: string): void {
    console.log('FavoritesService: toggleFavorite', productId);
    const isAuthenticated = this.authService.isAuthenticated();
    const currentFavorites = this.favorites.getValue();
    const isFav = currentFavorites.includes(productId);

    if (isAuthenticated) {
      // Lógica para usuario autenticado (API)
            let request$: Observable<any>;

      if (isFav) {
        // Quitar de favoritos
        console.log(`[FavoriteService] Removing favorite: DELETE ${this.apiUrl}/${productId}`);
        request$ = this.http.delete(`${this.apiUrl}/${productId}`);
      } else {
        // Añadir a favoritos
        console.log(`[FavoriteService] Adding favorite: POST ${this.apiUrl} with body { productId: ${productId} }`);
        request$ = this.http.post(this.apiUrl, { productId: productId });
      }

      request$.pipe(
        catchError(error => {
          console.error('[FavoriteService] API Error on toggleFavorite', error);
          return of(null); // Evita que el observable se rompa
        })
      ).subscribe(response => {
        if (response === null) return; // No hacer nada si hubo un error

        console.log('[FavoriteService] API Response:', response);
        const updatedFavorites = isFav
          ? currentFavorites.filter(id => id !== productId)
          : [...currentFavorites, productId];
        this.favorites.next(updatedFavorites);
        console.log('[FavoriteService] Favorites list updated optimistically:', updatedFavorites);
      });
    } else {
      // Lógica para visitante (localStorage)
      const updatedFavorites = isFav
        ? currentFavorites.filter(id => id !== productId)
        : [...currentFavorites, productId];
      this.saveToLocalStorage(updatedFavorites);
    }
  }

  isFavorite(productId: string): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.includes(productId)),
      tap(isFav => console.log(`FavoritesService: Product ${productId} is favorite: ${isFav}`))
    );
  }

  getFavoriteProducts(): Observable<Product[]> {
    console.log('FavoritesService: getFavoriteProducts');
    return this.favorites$.pipe(
      switchMap(favoriteIds => {
        if (favoriteIds.length === 0) {
          return of([]); // Si no hay favoritos, devuelve un array vacío
        }
        // Este endpoint lo crearemos en el backend a continuación
        return this.http.post<Product[]>(`${environment.apiUrl}/products/by-ids`, { ids: favoriteIds });
      }),
      catchError(error => {
        console.error('Error al cargar los productos favoritos', error);
        return of([]); // En caso de error, devuelve un array vacío para no romper la UI
      })
    );
  }
}
