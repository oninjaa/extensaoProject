import { Injectable } from '@angular/core';
import {Firestore,collection,addDoc, Timestamp} from '@angular/fire/firestore';

export interface FirebaseDocument {
  id?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore) {}

  /**
   * Adiciona um documento a uma coleção
   * @param collectionName Nome da coleção
   * @param data Dados a serem salvos
   * @returns Promise com o ID do documento criado
   */
  async addDocument(collectionName: string, data: any): Promise<string> {
    try {
      const colRef = collection(this.firestore, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: Timestamp.now()
      });
      console.log(`Documento adicionado com sucesso: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      throw error;
    }
  }

  async salvarLocalizacao(
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    },
  ): Promise<string> {
    try {
      const dataParaSalvar = {
        localizacao: {
          latitude: location.latitude,
          longitude: location.longitude,
          endereco: location.address || 'Endereço não disponível'
        },
        timestamp: Date.now(),
        dataHora: new Date().toISOString()
      };

      return await this.addDocument('usuarios', dataParaSalvar);
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
      throw error;
    }
  }

}
