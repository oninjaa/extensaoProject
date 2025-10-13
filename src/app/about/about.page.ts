import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { informationCircleOutline, earthOutline, homeOutline, heart, musicalNote, calendar, personCircle, search } from 'ionicons/icons';
import { IonFooter, IonContent, IonToolbar, IonTitle, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
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
    CommonModule,
    RouterLink,
  ]
})
export class AboutPage  {

  constructor() {
    addIcons({personCircle,search,earthOutline,homeOutline,informationCircleOutline,heart,musicalNote,calendar});
  }


}
