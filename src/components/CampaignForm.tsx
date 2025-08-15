import React, { useState, useRef, useMemo } from 'react';
import { Send, Clock, Image, Users, MessageSquare, Upload, FileText, X, Calendar, Trash2 } from 'lucide-react';
import { Instance, WebhookPayload } from '../types';

interface CampaignFormProps {
  instances: Instance[];
  selectedInstanceId?: string;
  onSendCampaign: (payload: WebhookPayload) => void;
}

export default function CampaignForm({ instances, selectedInstanceId, onSendCampaign }: CampaignFormProps) {
  const [formData, setFormData] = useState({
    instanceId: selectedInstanceId || '',
    campaignName: '',
    message: '',
    image: '',
    contacts: '',
    scheduledAt: '',
    delayBetweenMessages: 5
  });

  const [csvFileName, setCsvFileName] = useState<string>('');
  const [csvContacts, setCsvContacts] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Cálculo da data de término dos disparos
  const estimatedEndTime = useMemo(() => {
    if (!formData.contacts.trim() || !formData.delayBetweenMessages) {
      return null;
    }

    const contactCount = formData.contacts.split('\n').filter(c => c.trim()).length;
    if (contactCount === 0) return null;

    // Calcular tempo total em segundos
    const totalDelaySeconds = (contactCount - 1) * formData.delayBetweenMessages;
    
    // Data de início (agendamento ou agora)
    let startDate: Date;
    if (formData.scheduledAt) {
      // Criar data a partir do valor do input datetime-local
      startDate = new Date(formData.scheduledAt);
    } else {
      startDate = new Date();
    }

    // Adicionar o tempo total de delay
    const endDate = new Date(startDate.getTime() + (totalDelaySeconds * 1000));
    
    return endDate;
  }, [formData.contacts, formData.delayBetweenMessages, formData.scheduledAt]);

  // Formatar data para exibição
  const formatEndTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Calcular duração total
  const calculateDuration = () => {
    if (!estimatedEndTime || !formData.contacts.trim()) return null;
    
    const contactCount = formData.contacts.split('\n').filter(c => c.trim()).length;
    if (contactCount === 0) return null;

    const totalDelaySeconds = (contactCount - 1) * formData.delayBetweenMessages;
    
    const hours = Math.floor(totalDelaySeconds / 3600);
    const minutes = Math.floor((totalDelaySeconds % 3600) / 60);
    const seconds = totalDelaySeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Obter data mínima para agendamento (agora + 1 minuto)
  const getMinDateTime = () => {
    const now = new Date();
    // Adicionar 1 minuto para evitar agendamento no passado
    now.setMinutes(now.getMinutes() + 1);
    // Ajustar para o fuso horário local
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é um arquivo CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    setCsvFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        processCsvContent(text);
      }
    };
    reader.readAsText(file);
  };

  const processCsvContent = (csvText: string) => {
    // Dividir por linhas e limpar
    const lines = csvText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Extrair números de telefone (assumindo que cada linha contém um número)
    const phoneNumbers = lines
      .map(line => {
        // Remover caracteres não numéricos, exceto o + inicial
        const cleaned = line.replace(/[^\d+]/g, '');
        // Garantir que comece com 55 (código do Brasil)
        if (cleaned.startsWith('+')) {
          return cleaned.substring(1);
        }
        if (cleaned.startsWith('55')) {
          return cleaned;
        }
        // Se não começar com 55, adicionar
        return `55${cleaned}`;
      })
      .filter(phone => phone.length >= 12 && phone.length <= 13); // Números válidos do Brasil

    setCsvContacts(phoneNumbers);
    
    // Atualizar o campo de contatos com os números processados
    setFormData(prev => ({
      ...prev,
      contacts: phoneNumbers.join('\n')
    }));

    if (phoneNumbers.length === 0) {
      alert('Nenhum número de telefone válido encontrado no arquivo CSV.');
    } else {
      alert(`Processados ${phoneNumbers.length} números de telefone do arquivo CSV.`);
    }
  };

  const clearCsvData = () => {
    setCsvFileName('');
    setCsvContacts([]);
    setFormData(prev => ({ ...prev, contacts: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      setImageBase64('');
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem válidos (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extrair apenas o base64 puro, sem o prefixo data:image/...
      const base64Only = result.split(',')[1];
      setImageBase64(base64Only);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageBase64('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.instanceId || !formData.message || !formData.contacts) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const contactList = formData.contacts
      .split('\n')
      .map(contact => contact.trim())
      .filter(contact => contact.length > 0);

    if (contactList.length === 0) {
      alert('Adicione pelo menos um contato');
      return;
    }

    // Formatar a data de agendamento para o formato que o N8N aceita
    let formattedScheduledAt: string | undefined;
    if (formData.scheduledAt) {
      const scheduledDate = new Date(formData.scheduledAt);
      // Formatar para YYYY-MM-DDTHH:mm:ss (sem .000Z e sem ajuste de fuso)
      const year = scheduledDate.getFullYear();
      const month = String(scheduledDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduledDate.getDate()).padStart(2, '0');
      const hours = String(scheduledDate.getHours()).padStart(2, '0');
      const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
      const seconds = String(scheduledDate.getSeconds()).padStart(2, '0');
      
      formattedScheduledAt = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    // Formatar contatos para o N8N processar corretamente
    const formattedContacts = contactList.map((contact, index) => ({
      row_number: index + 1,
      Number: contact,
      contact_id: `contact_${index + 1}`
    }));

    const payload: WebhookPayload = {
      instanceId: formData.instanceId,
      instanceName: selectedInstance?.name || '',
      campaignId: `campaign_${Date.now()}`,
      message: formData.message,
      image: imageBase64 || undefined, // Usar a imagem em base64
      contacts: formattedContacts,
      totalContacts: formattedContacts.length,
      delayBetweenMessages: formData.delayBetweenMessages,
      scheduledAt: formattedScheduledAt
    };

    onSendCampaign(payload);
    
    // Reset form
    setFormData({
      instanceId: selectedInstanceId || '',
      campaignName: '',
      message: '',
      image: '',
      contacts: '',
      scheduledAt: '',
      delayBetweenMessages: 5
    });
    
    // Limpar dados do CSV
    clearCsvData();
    clearImage(); // Limpar imagem
  };

  const selectedInstance = instances.find(i => i.id === formData.instanceId);
  const canSend = selectedInstance?.connectionStatus === 'open';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-yellow-200">
      <div className="p-6 border-b border-yellow-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-yellow-600" />
          Nova Campanha
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Seleção de Instância */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instância WhatsApp *
          </label>
          <select
            value={formData.instanceId}
            onChange={(e) => setFormData({ ...formData, instanceId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          >
            <option value="">Selecione uma instância</option>
            {instances.map((instance) => (
              <option key={instance.id} value={instance.id}>
                {instance.name} - {instance.connectionStatus === 'open' ? '✅ Conectado' : '❌ Desconectado'}
              </option>
            ))}
          </select>
          {!canSend && formData.instanceId && (
            <p className="mt-1 text-sm text-red-600">
              Esta instância não está conectada. Conecte-a antes de enviar campanhas.
            </p>
          )}
        </div>

        {/* Nome da Campanha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Campanha
          </label>
          <input
            type="text"
            value={formData.campaignName}
            onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
            placeholder="Ex: Promoção Black Friday"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        {/* Mensagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Digite sua mensagem aqui..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.message.length} caracteres
          </p>
        </div>

        {/* Imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image className="w-4 h-4 inline mr-1" />
            Imagem (opcional)
          </label>
          <div className="flex items-center space-x-3">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Imagem
            </label>
            
            {imageFile && (
              <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <Image className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">{imageFile.name}</span>
                <span className="text-xs text-yellow-600">
                  ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
            )}
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB. A imagem será convertida para base64 puro.
          </p>
        </div>

        {/* Contatos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Contatos *
          </label>
          
          {/* Upload de CSV */}
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </label>
              
              {csvFileName && (
                <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  <FileText className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-medium">{csvFileName}</span>
                  <button
                    type="button"
                    onClick={clearCsvData}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <p className="mt-2 text-sm text-gray-500">
              Faça upload de um arquivo CSV com números de telefone (um por linha). 
              Formato aceito: 5561985515084, 5561999517057, etc.
            </p>
          </div>

          {/* Campo de texto para contatos manuais ou visualização */}
          <textarea
            value={formData.contacts}
            onChange={(e) => setFormData({ ...formData, contacts: e.target.value })}
            placeholder="Digite os números manualmente ou faça upload de um CSV...&#10;Exemplo:&#10;5561985515084&#10;5561999517057&#10;5561998190843"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none font-mono text-sm"
            required
          />
          
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {formData.contacts.split('\n').filter(c => c.trim()).length} contatos
            </p>
            {csvContacts.length > 0 && (
              <p className="text-sm text-yellow-600 font-medium">
                ✓ {csvContacts.length} números do CSV carregados
              </p>
            )}
          </div>
        </div>

        {/* Configurações de Envio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agendamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Agendamento (opcional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              min={getMinDateTime()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Delay entre mensagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalo entre mensagens (segundos)
            </label>
            <input
              type="number"
              value={formData.delayBetweenMessages}
              onChange={(e) => setFormData({ ...formData, delayBetweenMessages: parseInt(e.target.value) || 5 })}
              min="1"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Recomendado: 5-10 segundos para evitar bloqueios
            </p>
          </div>
        </div>

        {/* Estimativa de Término */}
        {estimatedEndTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-900">Estimativa de Término dos Disparos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Início:</span>
                <p className="text-blue-900">
                  {formData.scheduledAt 
                    ? new Date(formData.scheduledAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Imediato'
                  }
                </p>
              </div>
              
              <div>
                <span className="text-blue-700 font-medium">Término:</span>
                <p className="text-blue-900 font-semibold">
                  {formatEndTime(estimatedEndTime)}
                </p>
              </div>
              
              <div>
                <span className="text-blue-700 font-medium">Duração Total:</span>
                <p className="text-blue-900 font-semibold">
                  {calculateDuration()}
                </p>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
              <p className="text-xs text-blue-800">
                <strong>Observação:</strong> Esta estimativa considera {formData.contacts.split('\n').filter(c => c.trim()).length} contatos 
                com intervalo de {formData.delayBetweenMessages} segundos entre cada mensagem.
                {formData.scheduledAt && ' O tempo começa a contar a partir da data agendada.'}
              </p>
            </div>
          </div>
        )}

        {/* Botão de Envio */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={!canSend}
            className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              canSend
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            {formData.scheduledAt ? 'Agendar Campanha' : 'Enviar Agora'}
          </button>
        </div>
      </form>
    </div>
  );
}