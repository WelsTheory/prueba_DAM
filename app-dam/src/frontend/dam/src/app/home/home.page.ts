import { Component, OnInit } from '@angular/core';
import { DispositivoService } from '../services/dispositivo.service';
import { Dispositivo } from '../interfaces/dispositivo';
import { Router } from '@angular/router';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonToolbar, IonHeader, IonTitle, IonItem, IonAvatar, IonIcon, IonLabel, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { addIcons } from 'ionicons';
import { leaf, restaurant, flower, home, bed, hardwareChip } from 'ionicons/icons';



@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonList,
    IonItem,
    IonAvatar,
    IonIcon,
    IonLabel,
    IonButton,
    CommonModule,
  ], schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HomePage implements OnInit {
  dispositivos: any[] = []; // Para almacenar dispositivos

  constructor(
    private dispositivoService: DispositivoService, // Servicio para cargar dispositivos
    private router: Router 
  ) {}

  // Método que se ejecuta al inicializar el componente
  async ngOnInit() {
    try {
      const dispositivos = await this.dispositivoService.getDispositivos();
  
      // Para cada dispositivo, traemos la última medición
      this.dispositivos = await Promise.all(
        dispositivos.map(async (d: Dispositivo) => {
          try {
            const mediciones = await this.dispositivoService.getMediciones(d.dispositivoId);
            const ultimaMedicion = mediciones.length > 0 ? mediciones[0].valor : '—';
            return { ...d, medicionActual: ultimaMedicion };
          } catch (err) {
            console.error(`Error cargando mediciones para dispositivo ${d.dispositivoId}`, err);
            return { ...d, medicionActual: '—' };
          }
        })
      );
    } catch (error) {
      console.error('Error al cargar dispositivos:', error);
    }
  }
  

  // Método para navegar a la página de detalles de un dispositivo
  verDetalle(dispositivoId: number) {
    console.log(`Ver detalle del dispositivo: ${dispositivoId}`);
    this.router.navigate([`/dispositivo`, dispositivoId]);
  }

  verMediciones(dispositivoId: number) {
    console.log(`Ver mediciones del dispositivo: ${dispositivoId}`);
    this.router.navigate([`/dispositivo`, dispositivoId, 'mediciones']);
  }
  
}

