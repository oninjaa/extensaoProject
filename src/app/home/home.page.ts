import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonItemDivider, IonFooter, IonContent, IonToolbar, IonTitle, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonButton, IonList, IonItem, IonSpinner } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { informationCircleOutline, earthOutline, homeOutline, powerOutline, locationOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { firstValueFrom, Subscription } from 'rxjs';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { LocationService, LocationData } from '../services/localizacao.service';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  providers: [BluetoothSerial, AndroidPermissions],
  imports: [
    CommonModule,
    IonItemDivider,
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
    IonList,
    IonItem,
    IonSpinner,
    RouterLink,
  ],
})
export class HomePage {
  connecting = false;
  connected?: { id: string; name: string | null };
  scanning = false;
  errorMessage = '';
  infoMessage = '';
  alarmeAtivo = false;
  devices: Array<{ id: string; name: string | null; paired?: boolean }> = [];
  connectingId?: string;
  private btConnSub?: Subscription;

  currentLocation?: LocationData;
  locationLoading = false;
  locationAddress = '';

  constructor(
    private btSerial: BluetoothSerial,
    private androidPerms: AndroidPermissions,
    private locationService: LocationService,
    private firebaseService: FirebaseService
  ) {
    addIcons({
      powerOutline,
      earthOutline,
      homeOutline,
      informationCircleOutline,
      locationOutline
    });
  }

  private async ensureBtEnabled() {
    if (Capacitor.getPlatform() !== 'android') return;
    try {
      await this.btSerial.isEnabled();
    } catch {
      try {
        await this.btSerial.enable();
      } catch (e) {
        console.warn('Bluetooth enable:', e);
      }
    }
  }

  private async ensureRuntimePermissions() {
    if (Capacitor.getPlatform() !== 'android') return;
    const P = this.androidPerms.PERMISSION as any;
    try {
      await this.androidPerms.requestPermissions([
        P.BLUETOOTH_SCAN || 'android.permission.BLUETOOTH_SCAN',
        P.BLUETOOTH_CONNECT || 'android.permission.BLUETOOTH_CONNECT',
      ]);
    } catch (e) {
      console.warn('Permissões BLE (12+) não concedidas ou indisponíveis:', e);
    }
    try {
      await this.androidPerms.requestPermissions([
        P.ACCESS_COARSE_LOCATION || 'android.permission.ACCESS_COARSE_LOCATION',
        P.ACCESS_FINE_LOCATION || 'android.permission.ACCESS_FINE_LOCATION',
      ]);
    } catch (e) {
      console.warn('Permissões de localização não concedidas:', e);
    }
  }

  async conectarHC06() {
    this.connecting = true;
    try {
      await this.ensureBtEnabled();
      await this.ensureRuntimePermissions();

      console.log('[HC-06] Iniciando descoberta/conexão');
      let target: { id: string; name: string | null } | undefined;
      const nameMatchers = [/HC-06/i, /HC-05/i, /LINVOR/i, /^BT/i, /JDY/i];
      const matchDevice = (arr: any[] | undefined) => {
        if (!arr) return undefined;
        for (const dev of arr) {
          const nm = (dev.name || '').toString();
          if (nameMatchers.some(rx => rx.test(nm))) {
            return { id: dev.address || dev.id, name: dev.name || nm || 'HC-06' } as { id: string; name: string | null };
          }
        }
        return undefined;
      };
      try {
        const paired = await this.btSerial.list();
        console.log('[HC-06] Pareados:', paired);
        target = matchDevice(paired);
      } catch {}

      if (!target) {
        const unpaired = await this.btSerial.discoverUnpaired();
        console.log('[HC-06] Não pareados:', unpaired);
        target = matchDevice(unpaired || []);
      }

      if (!target) {
        throw new Error('HC-06 não encontrado. Emparelhe nas configurações ou ligue o módulo.');
      }

      try {
        console.log('[HC-06] Conectando modo seguro a', target.id);
        await firstValueFrom(this.btSerial.connect(target.id));
      } catch (e1) {
        console.warn('[HC-06] Conexão segura falhou, tentando insecure...', e1);
        try {
          await firstValueFrom((this.btSerial as any).connectInsecure(target.id));
        } catch (e2) {
          console.error('[HC-06] Conexão insecure também falhou', e2);
          throw e2;
        }
      }
      this.connected = target;
    } catch (err) {
      console.error('Falha ao conectar ao HC-06', err);
    } finally {
      this.connecting = false;
    }
  }

  async desconectar() {
    try {
      if (this.btConnSub) {
        this.btConnSub.unsubscribe();
        this.btConnSub = undefined;
      } else {
        await this.btSerial.disconnect();
      }
    } catch {}
    this.connected = undefined;
    this.infoMessage = 'Desconectado.';
    this.alarmeAtivo = false;

    // Limpa a localização ao desconectar
    this.currentLocation = undefined;
    this.locationAddress = '';
  }

  async listarDispositivos() {
    this.scanning = true;
    this.devices = [];
    this.errorMessage = '';
    this.infoMessage = '';
    try {
      await this.ensureBtEnabled();
      await this.ensureRuntimePermissions();

      const normalize = (d: any, paired?: boolean) => ({
        id: (d && (d.address || d.id)) ?? '',
        name: (d && (d.name ?? null)) ?? null,
        paired,
      });

      const mapById = new Map<string, { id: string; name: string | null; paired?: boolean }>();

      try {
        const paired = await this.btSerial.list();
        for (const d of paired || []) {
          const n = normalize(d, true);
          if (n.id) mapById.set(n.id, n);
        }
      } catch (e) {
        console.warn('Falha ao obter pareados:', e);
      }

      try {
        const un = await this.btSerial.discoverUnpaired();
        for (const d of un || []) {
          const n = normalize(d, false);
          if (n.id && !mapById.has(n.id)) mapById.set(n.id, n);
        }
      } catch (e) {
        console.warn('Falha ao descobrir não pareados:', e);
      }

      this.devices = Array.from(mapById.values()).sort((a, b) => {
        const ap = a.paired ? 0 : 1;
        const bp = b.paired ? 0 : 1;
        if (ap !== bp) return ap - bp;
        const an = (a.name || '').toString().toLowerCase();
        const bn = (b.name || '').toString().toLowerCase();
        return an.localeCompare(bn);
      });

      if (this.devices.length === 0) {
        this.infoMessage = 'Nenhum dispositivo encontrado. Verifique se o Bluetooth está ligado e a Localização (Android ≤ 11).';
      }
    } catch (e) {
      console.error('Listagem falhou', e);
      this.errorMessage = 'Falha ao listar dispositivos. Verifique permissões e o estado do Bluetooth.';
    } finally {
      this.scanning = false;
    }
  }

  private delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }

  private async obterLocalizacao(): Promise<void> {
    this.locationLoading = true;
    this.locationAddress = '';

    try {
      console.log('Obtendo localização...');
      const location = await this.locationService.getLocationWithAddress();

      this.currentLocation = location;
      this.locationAddress = location.address || 'Endereço não disponível';

      console.log('Localização obtida:', {
        coords: `${location.latitude}, ${location.longitude}`,
        address: this.locationAddress,
        timestamp: new Date(location.timestamp).toLocaleString()
      });

    } catch (error: any) {
      console.error('Erro ao obter localização:', error);
      this.locationAddress = 'Não foi possível obter a localização';

      if (error.message?.includes('negada')) {
        this.errorMessage = 'Permissão de localização negada. Habilite nas configurações do app.';
      }
    } finally {
      this.locationLoading = false;
    }
  }

  private async enviarParaFirebase(location: LocationData): Promise<void> {
    try {
      const docId = await this.firebaseService.salvarLocalizacao({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address
      });

      console.log('Localização salva no Firebase com ID:', docId);
    } catch (error) {
      console.error('Erro ao salvar no Firebase:', error);
    }
  }

  async conectarDispositivo(dev: { id: string; name: string | null; paired?: boolean }) {
    if (!dev?.id) return;
    this.connectingId = dev.id;
    this.errorMessage = '';
    this.infoMessage = '';

    try {
      await this.ensureBtEnabled();
      await this.ensureRuntimePermissions();
      await this.delay(800);

      if (this.btConnSub) {
        try { this.btConnSub.unsubscribe(); } catch {}
        this.btConnSub = undefined;
        await this.delay(200);
      }

      const preferInsecure = !dev.paired;
      const tryConnect = (insecure: boolean) => insecure
        ? (this.btSerial as any).connectInsecure(dev.id)
        : this.btSerial.connect(dev.id);

      const startConnection = (insecureFirst: boolean) => new Promise<void>((resolve, reject) => {
        const firstObs = tryConnect(insecureFirst);
        let triedSecond = false;
        const onError = (e: any) => {
          console.warn(`Conexão ${insecureFirst ? 'insecure' : 'secure'} falhou:`, e);
          this.btConnSub?.unsubscribe();
          this.btConnSub = undefined;
          if (!triedSecond) {
            triedSecond = true;
            const secondObs = tryConnect(!insecureFirst);
            this.btConnSub = secondObs.subscribe(
              () => resolve(),
              (e2: any) => reject(e2)
            );
          } else {
            reject(e);
          }
        };
        this.btConnSub = firstObs.subscribe(
          () => resolve(),
          onError
        );
      });

      await startConnection(preferInsecure);

      this.connected = { id: dev.id, name: dev.name ?? null };
      this.infoMessage = `Conectado a ${dev.name || dev.id}`;

      try { await this.btSerial.write('OFF\r\n'); } catch {}
      this.alarmeAtivo = false;

    } catch (e) {
      console.error('Falha ao conectar', e);
      this.errorMessage = 'Falha ao conectar. Se não estiver pareado, tente parear nas Configurações do Android (PIN 1234) e tente novamente.';
    } finally {
      this.connectingId = undefined;
    }
  }

  async toggleAlarme() {
    if (!this.connected) return;
    this.errorMessage = '';

    try {
      if (!this.alarmeAtivo) {
        await this.obterLocalizacao();

        for (let i = 0; i < 3; i++) {
          await this.btSerial.write('ON\r\n');
        }
        await this.delay(120);
        this.alarmeAtivo = true;

        let msg = 'Alarme ativado.';
        if (this.locationAddress) {
          msg += ` | Local: ${this.locationAddress}`;
        }
        this.infoMessage = msg;

        if (this.currentLocation) {
          await this.enviarParaFirebase(this.currentLocation);
        }

      } else {
        for (let i = 0; i < 3; i++) {
          await this.btSerial.write('OFF\r\n');
        }
        await this.delay(120);
        this.alarmeAtivo = false;
        this.infoMessage = 'Alarme desativado.';

        this.currentLocation = undefined;
        this.locationAddress = '';
      }
    } catch (e) {
      this.errorMessage = 'Não foi possível enviar comando ao módulo.';
      console.error(e);
    }
  }

  async abrirConfiguracoesBluetooth() {
    try { await BleClient.openBluetoothSettings(); } catch {}
  }

  async abrirConfiguracoesLocalizacao() {
    try { await BleClient.openLocationSettings(); } catch {}
  }

  get coordenadasFormatadas(): string {
    if (!this.currentLocation) return '';
    return this.locationService.formatCoordinates(
      this.currentLocation.latitude,
      this.currentLocation.longitude
    );
  }
}
