import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Presentation } from '../../../core/models/product.model';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnChanges {
  @Input() presentation: Presentation | null = null;
  @Input() isVisible: boolean = false;
  @Output() save = new EventEmitter<Presentation>();
  @Output() close = new EventEmitter<void>();

  editablePresentation!: Presentation;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['presentation'] && this.presentation) {
      this.editablePresentation = { ...this.presentation };
    }
  }

  onSave(): void {
    if (this.editablePresentation) {
      this.save.emit(this.editablePresentation);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
