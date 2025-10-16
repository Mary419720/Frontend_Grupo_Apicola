import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api.model';
import { environment } from 'src/environments/environment';

export interface DashboardData {
  months: string[];
  salesData: number[];
  profitData: number[];
  revenueData: number[];
  totalSales: number;
  newCustomers: number;
  totalProducts: number;
  monthlyRevenueGrowth: string;
}

export type SalesPeriod = 'day'|'week'|'month'|'year';

export interface SalesPeriodData {
  labels: string[];
  sales: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/sales`;
  private http = inject(HttpClient);

  constructor() { }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashboard`).pipe(
      map(response => response.data)
    );
  }

  getSalesByPeriod(period: SalesPeriod): Observable<SalesPeriodData> {
    return this.http.get<SalesPeriodData>(`${this.apiUrl}/sales-by-period`, {
      params: new HttpParams().set('period', period)
    });
  }

  getSalesByDateRange(startDate: string, endDate: string): Observable<SalesPeriodData> {
    if (!startDate || !endDate) {
      return new Observable(observer => observer.complete());
    }

    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<SalesPeriodData>(`${this.apiUrl}/history`, { params });
  }
} 

