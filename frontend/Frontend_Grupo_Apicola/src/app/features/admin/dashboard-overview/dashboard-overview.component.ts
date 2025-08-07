import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { DashboardService, SalesPeriod, SalesPeriodData } from '../../../core/services/dashboard.service';
import { LucideAngularModule } from 'lucide-angular';
import { Subject } from 'rxjs';
import { catchError, takeUntil, finalize } from 'rxjs/operators';

interface SalesPeriodOption {
  key: SalesPeriod;
  label: string;
}

interface YAxisLabel {
  y: number;
  value: string;
}

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule], // Añadir FormsModule
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss'],
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // General state
  loading = true;
  error: string | null = null;

  // KPI data
  totalSales = 0;
  totalProducts = 0;
  newCustomers: number = 0;
  monthlyRevenueGrowth: string = '0.0%';
  revenueGrowthClass: 'positive' | 'negative' | 'neutral' = 'neutral';

  // Sales by period chart state
  isLoadingSales = false;
  errorSales: string | null = null;
  selectedSalesPeriod: SalesPeriod = 'week';
  salesPeriods: SalesPeriodOption[] = [
    { key: 'day', label: 'Día' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
    { key: 'year', label: 'Año' },
  ];
  showSalesBar = true; // true for bar chart, false for line chart

  // Sales by period chart data
  salesPeriodData: number[] = [];
  salesPeriodLabels: string[] = [];
  salesPeriodMax = 0;
  salesLinePath: string = '';

  // Propiedades para el tooltip
  tooltipVisible: boolean = false;
  tooltipText: string = '';
  tooltipX: number = 0;
  tooltipY: number = 0;

  // Propiedades para el historial de ventas
  historicalStartDate: string = '';
  historicalEndDate: string = '';
  historicalSalesData: SalesPeriodData | null = null;
  loadingHistorical: boolean = false;
  maxHistoricalSale: number = 0;
  errorHistorical: string | null = null;

  // Chart dimensions and properties
  salesChartWidth = 800;
  salesChartHeight = 300;
  yAxisLabelWidth = 50;
  chartPadding = { top: 40, right: 20, bottom: 40, left: 60 }; // Space for Y-axis labels
  xAxisLabelHeight = 30; // Space for X-axis labels
  barWidth = 20;
  yAxisLabels: YAxisLabel[] = [];
  yAxisGridLines: number[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.selectedSalesPeriod = 'year'; // Establece el período por defecto
    this.loadSalesByPeriod(); // Carga los datos del gráfico de ventas
    this.initializeDates(); // Inicializa las fechas para el historial
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Métodos para el Tooltip ---

  showTooltip(event: MouseEvent, index: number): void {
    const data = this.salesPeriodData[index];
    // Formateamos el texto como moneda
    this.tooltipText = `$${data.toLocaleString('es-AR')}`;

    // Posicionamos el tooltip cerca del cursor
    const svgRect = (event.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
    if (svgRect) {
      this.tooltipX = event.clientX - svgRect.left + 15;
      this.tooltipY = event.clientY - svgRect.top - 30; // Desplazamos un poco arriba del cursor
    }

    this.tooltipVisible = true;
  }

  hideTooltip(): void {
    this.tooltipVisible = false;
  }

  loadHistoricalData(): void {
    this.loadingHistorical = true;
    this.errorHistorical = null;
    this.historicalSalesData = null;

    this.dashboardService.getSalesByDateRange(this.historicalStartDate, this.historicalEndDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.historicalSalesData = data;
          if (data && data.sales && data.sales.length > 0) {
            this.maxHistoricalSale = Math.max(...data.sales);
          } else {
            this.maxHistoricalSale = 0;
          }
          this.loadingHistorical = false;
        },
        error: (err) => {
          this.errorHistorical = 'Error al cargar el historial de ventas.';
          this.loadingHistorical = false;
          console.error(err);
        }
      });
  }

  private initializeDates(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7); // Rango por defecto: últimos 7 días

    this.historicalEndDate = this.formatDate(endDate);
    this.historicalStartDate = this.formatDate(startDate);
  }

  private formatDate(date: Date): string {
    // Formato YYYY-MM-DD para el input type="date"
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // Métodos para calcular el gráfico de historial
  getHistoricalMaxSale(): number {
    if (!this.historicalSalesData || this.historicalSalesData.sales.length === 0) {
      return 0;
    }
    return Math.max(...this.historicalSalesData.sales);
  }

  getHistoricalBarWidth(): number {
    if (!this.historicalSalesData?.sales?.length) {
      return 0;
    }
    const chartDrawableWidth = this.salesChartWidth - this.chartPadding.left - this.chartPadding.right;
    const bandWidth = chartDrawableWidth / this.historicalSalesData.sales.length;
    return bandWidth * 0.8; // La barra ocupa el 80% de su espacio asignado
  }

  getHistoricalBarX(index: number): number {
    if (!this.historicalSalesData?.sales?.length) {
      return 0;
    }
    const chartDrawableWidth = this.salesChartWidth - this.chartPadding.left - this.chartPadding.right;
    const bandWidth = chartDrawableWidth / this.historicalSalesData.sales.length;
    // Se posiciona la barra en su 'slot' y se centra añadiendo el 10% del espacio (la mitad del 20% sobrante)
    return this.chartPadding.left + (index * bandWidth) + (bandWidth * 0.1);
  }

  getHistoricalBarHeight(sale: number): number {
    const maxSale = this.getHistoricalMaxSale();
    if (maxSale === 0) {
      return 0;
    }
    const availableHeight = this.salesChartHeight - this.chartPadding.top - this.chartPadding.bottom;
    return (sale / maxSale) * availableHeight;
  }

  getHistoricalBarY(sale: number): number {
    const barHeight = this.getHistoricalBarHeight(sale);
    return this.salesChartHeight - this.chartPadding.bottom - barHeight;
  }

  private loadInitialData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.error = 'No se pudieron cargar los datos del panel.';
        throw err;
      }),
      finalize(() => this.loading = false)
    ).subscribe(data => {
      this.totalSales = data.totalSales;
      this.totalProducts = data.totalProducts;
      this.newCustomers = data.newCustomers;
            const growth = data.monthlyRevenueGrowth || 0;
      this.monthlyRevenueGrowth = `${growth > 0 ? '+' : ''}${growth}%`;

      if (growth > 0) {
        this.revenueGrowthClass = 'positive';
      } else if (growth < 0) {
        this.revenueGrowthClass = 'negative';
      } else {
        this.revenueGrowthClass = 'neutral';
      }
    });
  }

  onSalesPeriodChange(period: SalesPeriod): void {
    this.selectedSalesPeriod = period;
    this.loadSalesByPeriod();
  }

  setSalesChartType(isBar: boolean): void {
    this.showSalesBar = isBar;
  }

  private loadSalesByPeriod(): void {
    this.isLoadingSales = true;
    this.errorSales = null;
    this.dashboardService.getSalesByPeriod(this.selectedSalesPeriod).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.errorSales = 'No se pudieron cargar los datos de ventas.';
        this.salesPeriodData = [];
        this.salesPeriodLabels = [];
        throw err;
      }),
      finalize(() => this.isLoadingSales = false)
    ).subscribe(data => {
      this.salesPeriodData = data.sales;
      this.salesPeriodLabels = data.labels;
      this.updateSalesChart();
    });
  }

  private updateSalesChart(): void {
    if (this.salesPeriodData.length === 0) {
      this.salesPeriodMax = 0;
      this.yAxisLabels = [];
      this.yAxisGridLines = [];
      this.salesLinePath = '';
      return;
    }

    this.salesPeriodMax = Math.max(...this.salesPeriodData) * 1.1 || 1;

    const numberOfTicks = 5;
    this.yAxisLabels = [];
    this.yAxisGridLines = [];
    for (let i = 0; i <= numberOfTicks; i++) {
      const value = (this.salesPeriodMax / numberOfTicks) * i;
      const y = this.getYPosition(value, 'sales');
      this.yAxisLabels.push({ y: y, value: Math.round(value).toString() });
      if (i > 0) { // Don't draw a grid line at the very top
          this.yAxisGridLines.push(y);
      }
    }

    const availableWidth = this.salesChartWidth - this.yAxisLabelWidth;
    this.barWidth = availableWidth / (this.salesPeriodData.length * 2);

    this.salesLinePath = this.calculateSalesLinePath();
  }

  getXPosition(index: number, chartType: 'sales'): number {
    const availableWidth = this.salesChartWidth - this.yAxisLabelWidth;
    const spacing = availableWidth / this.salesPeriodData.length;
    return this.yAxisLabelWidth + (index * spacing) + (spacing - this.barWidth) / 2;
  }

  getYPosition(value: number, chartType: 'sales'): number {
    const chartAreaHeight = this.salesChartHeight - this.xAxisLabelHeight;
    const scale = this.salesPeriodMax > 0 ? chartAreaHeight / this.salesPeriodMax : 0;
    return this.salesChartHeight - this.xAxisLabelHeight - (value * scale);
  }

  getBarHeight(value: number, chartType: 'sales'): number {
    const chartAreaHeight = this.salesChartHeight - this.xAxisLabelHeight;
    const scale = this.salesPeriodMax > 0 ? chartAreaHeight / this.salesPeriodMax : 0;
    return value * scale;
  }

  private calculateSalesLinePath(): string {
    if (this.salesPeriodData.length === 0) return '';

    const path = this.salesPeriodData.map((value, i) => {
      const x = this.getXPosition(i, 'sales') + this.barWidth / 2;
      const y = this.getYPosition(value, 'sales');
      return (i === 0 ? 'M' : 'L') + `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    return path.join(' ');
  }
}
