import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-section.component.html',
  styleUrl: './info-section.component.scss'
})
export class InfoSectionComponent {
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() imageUrl: string = '';
  @Input() imagePosition: 'left' | 'right' = 'right';
  @Input() backgroundColor: string = 'transparent';
}

