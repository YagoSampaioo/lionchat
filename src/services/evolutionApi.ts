const API_BASE_URL = 'https://evolution3.assessorialpha.com';
const API_KEY = '347edb5f63b70eddacd382e4569c30cf';
const WEBHOOK_URL = 'https://webhook3.assessorialpha.com/webhook/atendeai';

export interface CreateInstanceData {
  instanceName: string;
  number: string;
  token: string;
}

export class EvolutionApiService {
  private static headers = {
    'Content-Type': 'application/json',
    'apikey': API_KEY
  };

  static async fetchInstances() {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar instâncias: ${response.status}`);
      }

      const instances = await response.json();
      return instances.map((instance: any) => ({
        id: instance.id,
        name: instance.name,
        connectionStatus: instance.connectionStatus,
        ownerJid: instance.ownerJid,
        profileName: instance.profileName,
        profilePicUrl: instance.profilePicUrl,
        integration: instance.integration,
        number: instance.number,
        token: instance.token,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt
      }));
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      throw error;
    }
  }

  static async createInstance(data: CreateInstanceData) {
    try {
      const payload = {
        instanceName: data.instanceName,
        integration: 'WHATSAPP-BAILEYS',
        number: data.number,
        token: data.token,
        qrcode: true
      };

      const response = await fetch(`${API_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ao criar instância: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error;
    }
  }

  static async sendCampaign(payload: any) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar campanha:', error);
      throw error;
    }
  }
}