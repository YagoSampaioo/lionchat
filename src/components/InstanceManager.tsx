import React, { useState, useEffect } from 'react';
import { Plus, Smartphone, Wifi, WifiOff, QrCode, Trash2, RefreshCw, User, Phone } from 'lucide-react';
import { Instance } from '../types';
import { EvolutionApiService } from '../services/evolutionApi';

interface InstanceManagerProps {
  instances: Instance[];
  onInstancesUpdate: (instances: Instance[]) => void;
  selectedInstanceId?: string;
  onSelectInstance: (id: string) => void;
}

export default function InstanceManager({
  instances,
  onInstancesUpdate,
  selectedInstanceId,
  onSelectInstance
}: InstanceManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instanceName: '',
    number: '',
    token: ''
  });
  const [qrCodeData, setQrCodeData] = useState<any>(null);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const fetchedInstances = await EvolutionApiService.fetchInstances();
      onInstancesUpdate(fetchedInstances);
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      alert('Erro ao buscar instâncias. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.instanceName.trim() || !formData.number.trim() || !formData.token.trim()) {
      alert('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const result = await EvolutionApiService.createInstance(formData);
      setQrCodeData(result.qrcode);
      
      // Atualizar lista de instâncias
      await fetchInstances();
      
      setFormData({ instanceName: '', number: '', token: '' });
      alert('Instância criada com sucesso! Escaneie o QR Code para conectar.');
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      alert(`Erro ao criar instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Instance['connectionStatus']) => {
    switch (status) {
      case 'open':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'connecting':
        return <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: Instance['connectionStatus']) => {
    switch (status) {
      case 'open':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      default:
        return 'Desconectado';
    }
  };

  const getStatusColor = (status: Instance['connectionStatus']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 overflow-hidden">
      <div className="p-8 border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Instâncias WhatsApp</h2>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchInstances}
              disabled={loading}
              className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-semibold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Instância
            </button>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Instância *
              </label>
              <input
                type="text"
                value={formData.instanceName}
                onChange={(e) => setFormData({ ...formData, instanceName: e.target.value })}
                placeholder="Ex: Vendas Principal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número WhatsApp *
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="5561999999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Formato: código do país + DDD + número (sem espaços ou símbolos)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token *
              </label>
              <input
                type="text"
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                placeholder="Token único para identificar a instância"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Instância'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setQrCodeData(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>

          {qrCodeData && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                QR Code para Conexão
              </h3>
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  <img 
                    src={qrCodeData.base64} 
                    alt="QR Code" 
                    className="w-48 h-48 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Código de Pareamento:</label>
                      <code className="block mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded text-lg font-mono">
                        {qrCodeData.pairingCode}
                      </code>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Como conectar:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>Vá em Configurações → Aparelhos conectados</li>
                        <li>Toque em "Conectar um aparelho"</li>
                        <li>Escaneie o QR Code ou digite o código de pareamento</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {loading && instances.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando instâncias...</p>
          </div>
        ) : instances.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma instância encontrada</p>
            <p className="text-sm text-gray-400 mt-1">Crie sua primeira instância para começar</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedInstanceId === instance.id
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectInstance(instance.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{instance.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.connectionStatus)}`}>
                    {getStatusIcon(instance.connectionStatus)}
                    <span className="ml-1">{getStatusText(instance.connectionStatus)}</span>
                  </span>
                </div>
                
                {instance.profileName && (
                  <div className="flex items-center space-x-2 mb-2">
                    {instance.profilePicUrl ? (
                      <img 
                        src={instance.profilePicUrl} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">{instance.profileName}</span>
                  </div>
                )}
                
                {instance.number && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{instance.number}</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-3">
                  <div>Token: {instance.token}</div>
                  <div>Criado: {new Date(instance.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}