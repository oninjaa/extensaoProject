import { Component } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { informationCircleOutline, earthOutline, homeOutline} from 'ionicons/icons';
import {  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonSpinner,
   } from '@ionic/angular/standalone';
 import { FooterNavigationComponent } from '../components/footer-navigation/footer-navigation.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    HttpClientModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonSpinner,
    FooterNavigationComponent
  ]
})
export class NewsPage {
  advices: { title: string, description: string }[] = [];
  loading = true;
  error = '';

  constructor() {
    addIcons({homeOutline,informationCircleOutline,earthOutline});
  }

  ngOnInit() {
    // Simulação de consumo de API de dicas fitness pt-br
    this.advices = [
      {
        title: 'Alongue-se diariamente',
        description: 'O alongamento melhora a flexibilidade, previne lesões e prepara o corpo para atividades físicas.'
      },
      {
        title: 'Beba água durante o treino',
        description: 'A hidratação é fundamental para o desempenho físico e recuperação muscular.'
      },
      {
        title: 'Inclua exercícios aeróbicos',
        description: 'Caminhada, corrida ou bicicleta ajudam a fortalecer o coração e queimar calorias.'
      },
      {
        title: 'Respeite o tempo de descanso',
        description: 'O descanso é essencial para a recuperação muscular e evitar o overtraining.'
      },
      {
        title: 'Tenha uma alimentação equilibrada',
        description: 'Consuma proteínas, carboidratos e gorduras saudáveis para potencializar os resultados.'
      },
      {
        title: 'Use roupas adequadas',
        description: 'Roupas confortáveis e apropriadas facilitam os movimentos e evitam lesões.'
      },
      {
        title: 'Defina metas realistas',
        description: 'Estabeleça objetivos possíveis para manter a motivação e acompanhar o progresso.'
      }
    ];
    this.loading = false;
  }
}
