import { Component, Input } from '@angular/core';
import { IonFooter, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer-navigation',
  standalone: true,
  templateUrl: './footer-navigation.component.html',
  styleUrls: ['./footer-navigation.component.scss'],
  imports: [IonFooter, IonTabBar, IonTabButton, IonIcon, IonLabel,IonBadge, CommonModule, RouterModule]
})
export class FooterNavigationComponent {
  @Input() alarmeAtivo: boolean = false;
  @Input() currentPage: 'home' | 'news' | 'about' = 'home';

  constructor() {}
}
