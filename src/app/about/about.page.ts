import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { informationCircleOutline, earthOutline, homeOutline, heart, musicalNote, calendar, personCircle, search } from 'ionicons/icons';
import {IonContent, IonToolbar, IonTitle} from '@ionic/angular/standalone';
import { FooterNavigationComponent } from '../components/footer-navigation/footer-navigation.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonToolbar,
    IonTitle,
    CommonModule,
    FooterNavigationComponent
  ]
})
export class AboutPage  {

  constructor() {
    addIcons({personCircle,search,earthOutline,homeOutline,informationCircleOutline,heart,musicalNote,calendar});
  }


}
