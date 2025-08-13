import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonContent, IonHeader, IonIcon, IonLabel, IonTitle, IonToolbar, } from '@ionic/angular/standalone';
import { Observable, Subscription, fromEvent, interval } from 'rxjs';
import { DispositivoService } from '../services/dispositivo.service';
import { ActivatedRoute } from '@angular/router';
import { Dispositivo } from '../interfaces/dispositivo';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-dispositivo',
  templateUrl: './dispositivo.page.html',
  styleUrls: ['./dispositivo.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent, 
    IonLabel,       
    IonChip,       
    IonIcon,     
    CommonModule,], schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DispositivoPage implements OnInit{

  dispositivo!: Dispositivo;
  dispositivoId!: number;
  estadoValvula: boolean | null = null;
  ultimaMedicion: { fecha: string; valor: string } | null = null;


  constructor(
    private route: ActivatedRoute,
    private dispositivoService: DispositivoService,
    private router: Router
  ) {}

  async cargarUltimaMedicion() {
    try {
      this.ultimaMedicion = await this.dispositivoService.getUltimaMedicion(this.dispositivoId);
    } catch (error) {
      console.error('Error al cargar la última medición:', error);
    }
  }
  async ngOnInit() {
    this.dispositivoId = Number(this.route.snapshot.paramMap.get('id'));
    await this.cargarDispositivo();
    try {
      const estadoResponse = await this.dispositivoService.getEstadoValvula(this.dispositivoId);
      this.estadoValvula = estadoResponse.estado;
    } catch (error) {
      console.error('Error al obtener el estado de la válvula:', error);
      this.estadoValvula = null;
    }
    await this.cargarUltimaMedicion();
  }

  async cargarDispositivo() {
    try {
      this.dispositivo = await this.dispositivoService.getDispositivoById(this.dispositivoId);
      console.log('Dispositivo cargado:', this.dispositivo);
    } catch (error) {
      console.error('Error al cargar el dispositivo:', error);
    }
  }

  async cambiarEstadoValvula(apertura: boolean) {
    try {
      await this.dispositivoService.cambiarEstadoValvula(
        this.dispositivoId,
        apertura
      );
      alert(`Válvula ${apertura ? 'abierta' : 'cerrada'} correctamente`);
    } catch (error) {
      console.error('Error al cambiar el estado de la válvula:', error);
      alert('No se pudo cambiar el estado de la válvula.');
    }
  }
  verMediciones() {
    this.router.navigate([`/dispositivo`, this.dispositivoId, 'mediciones']);
  }
  
  abrirValvula() {
    this.dispositivoService.abrirValvula(this.dispositivoId)
      .then(() => {
        alert('Válvula abierta exitosamente');
        this.actualizarEstadoValvula();
      })
      .catch((error) => {
        console.error('Error al abrir la válvula:', error);
        alert('No se pudo abrir la válvula');
      });
  }
  
  cerrarValvula() {
    this.dispositivoService.cerrarValvula(this.dispositivoId)
      .then(() => {
        alert('Válvula cerrada exitosamente');
        this.actualizarEstadoValvula();
      })
      .catch((error) => {
        console.error('Error al cerrar la válvula:', error);
        alert('No se pudo cerrar la válvula');
      });
  }
  private async actualizarEstadoValvula() {
    try {
      const estadoResponse = await this.dispositivoService.getEstadoValvula(this.dispositivoId);
      this.estadoValvula = estadoResponse.estado;
    } catch (error) {
      console.error('Error al actualizar el estado de la válvula:', error);
    }
  }


  volverAlHome() {
    this.router.navigate(['/home']);
  }
  
}
