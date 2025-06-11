import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SalesService, Sale } from '../../../../core/services/sales.service';
import { LucideAngularModule, PlusCircle } from 'lucide-angular';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.scss'
})
export class SalesListComponent implements OnInit {
  sales: Sale[] = [];
  isLoading: boolean = true;
  errorLoading: boolean = false;
  PlusCircle = PlusCircle; // Para usar el ícono en la plantilla

  constructor(private salesService: SalesService) {}
  ngOnInit(): void {
    this.isLoading = true;
    this.salesService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching sales list:', err);
        this.errorLoading = true;
        this.isLoading = false;
      }
    });
  }
}
