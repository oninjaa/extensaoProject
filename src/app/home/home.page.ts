import { Component } from '@angular/core';
import { IonFooter, IonContent, IonToolbar, IonTitle, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { informationCircleOutline, earthOutline, homeOutline, powerOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonFooter,
    IonContent,
    IonToolbar,
    IonTitle,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge,
    IonButton,
    RouterLink,
  ],
})
export class HomePage {
  constructor() {
     addIcons({powerOutline,earthOutline,homeOutline,informationCircleOutline});
  }
}
