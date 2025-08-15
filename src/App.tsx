import React, { useState } from 'react';
import Header from './components/Header';
import InstanceManager from './components/InstanceManager';
import CampaignForm from './components/CampaignForm';
import { Instance, WebhookPayload } from './types';
import { EvolutionApiService } from './services/evolutionApi';

function App() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');

  const handleSendCampaign = async (payload: WebhookPayload) => {
    try {
      // Enviar para o webhook da Evolution API
      await EvolutionApiService.sendCampaign(payload);

      alert('Campanha enviada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao enviar campanha:', error);
      alert(`Erro ao enviar campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Gerenciador de Instâncias */}
          <InstanceManager
            instances={instances}
            onInstancesUpdate={setInstances}
            selectedInstanceId={selectedInstanceId}
            onSelectInstance={setSelectedInstanceId}
          />

          {/* Formulário de Campanha */}
          <CampaignForm
            instances={instances}
            selectedInstanceId={selectedInstanceId}
            onSendCampaign={handleSendCampaign}
          />
        </div>
      </main>
    </div>
  );
}

export default App;