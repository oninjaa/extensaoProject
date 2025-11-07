import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() {}

  async solicitaPermissao(): Promise<boolean> {
    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissões de localização:', error);
      return false;
    }
  }


  async buscaPermissao(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return false;
    }
  }


  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.buscaPermissao();
      if (!hasPermission) {
        const granted = await this.solicitaPermissao();
        if (!granted) {
          throw new Error('Permissão de localização negada');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      console.log('Localização obtida:', locationData);
      return locationData;
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      throw error;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'IonicBluetoothApp/1.0' // Nominatim requer User-Agent
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao obter endereço');
      }

      const data = await response.json();

      const address = data.address;
      const parts: string[] = [];

      if (address.road) {
              let rua = address.road;
              if (address.house_number) {
                rua += `, ${address.house_number}`;
              }
              parts.push(rua);
            } else if (address.house_number) {
              parts.push(`Nº ${address.house_number}`);
            }

            if (address.suburb || address.neighbourhood) {
              parts.push(address.suburb || address.neighbourhood);
            }

            if (address.city || address.town || address.village) {
              parts.push(address.city || address.town || address.village);
            }

            if (address.state) {
              parts.push(address.state);
            }

      return parts.join(', ') || data.display_name;
    } catch (error) {
      console.error('Erro no reverse geocoding:', error);
      throw error;
    }
  }

  async getLocationWithAddress(): Promise<LocationData> {
    const location = await this.getCurrentLocation();

    if (!location) {
      throw new Error('Não foi possível obter a localização');
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const address = await this.reverseGeocode(location.latitude, location.longitude);
      location.address = address;
    } catch (error) {
      console.warn('Não foi possível obter o endereço, mas as coordenadas foram obtidas:', error);
      location.address = `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`;
    }

    return location;
  }

  formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}
