import React, { useState } from 'react';
import Header from './components/Header';
import InstanceManager from './components/InstanceManager';
import CampaignForm from './components/CampaignForm';
import CampaignHistory from './components/CampaignHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Instance, Campaign, WebhookPayload } from './types';
import { EvolutionApiService } from './services/evolutionApi';

function App() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('evolution_campaigns', []);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');

  const handleSendCampaign = async (payload: WebhookPayload) => {
    try {
      // Criar campanha no histórico
      const newCampaign: Campaign = {
        id: payload.campaignId,
        name: `Campanha ${new Date().toLocaleString('pt-BR')}`,
        instanceId: payload.instanceId,
        message: payload.message,
        image: payload.image,
        contacts: payload.contacts,
        scheduledAt: payload.scheduledAt,
        delayBetweenMessages: payload.delayBetweenMessages,
        status: payload.scheduledAt ? 'scheduled' : 'running',
        createdAt: new Date().toISOString(),
        sentCount: 0,
        totalCount: payload.contacts.length
      };
      
      setCampaigns([newCampaign, ...campaigns]);

      // Enviar para o webhook da Evolution API
      await EvolutionApiService.sendCampaign(payload);

      alert('Campanha enviada com sucesso!');
      
      // Simular progresso da campanha
      setTimeout(() => {
        setCampaigns(prev => prev.map(c => 
          c.id === payload.campaignId 
            ? { ...c, status: 'completed', sentCount: c.totalCount }
            : c
        ));
      }, 5000);

    } catch (error) {
      console.error('Erro ao enviar campanha:', error);
      alert(`Erro ao enviar campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Marcar campanha como falha
      setCampaigns(prev => prev.map(c => 
        c.id === payload.campaignId 
          ? { ...c, status: 'draft' }
          : c
      ));
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

          {/* Histórico de Campanhas */}
          <CampaignHistory campaigns={campaigns} />
        </div>
      </main>
    </div>
  );
}

export default App;