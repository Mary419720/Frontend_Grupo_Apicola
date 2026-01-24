import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { ProductCarouselComponent } from './components/product-carousel/product-carousel.component';
import { InfoSectionComponent } from './components/info-section/info-section.component';
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, ProductCarouselComponent, InfoSectionComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
