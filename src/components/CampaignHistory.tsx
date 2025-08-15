import React from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Pause, Play } from 'lucide-react';
import { Campaign } from '../types';

interface CampaignHistoryProps {
  campaigns: Campaign[];
}

export default function CampaignHistory({ campaigns }: CampaignHistoryProps) {
  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'running':
        return 'Executando';
      case 'paused':
        return 'Pausada';
      case 'scheduled':
        return 'Agendada';
      default:
        return 'Rascunho';
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 overflow-hidden">
      <div className="p-8 border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Campanhas</h2>
        </div>
      </div>

      <div className="p-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma campanha criada ainda</p>
            <p className="text-sm text-gray-400 mt-1">Suas campanhas aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-yellow-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1">{getStatusText(campaign.status)}</span>
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {campaign.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {campaign.sentCount}/{campaign.totalCount} enviadas
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {campaign.delayBetweenMessages}s intervalo
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round((campaign.sentCount / campaign.totalCount) * 100)}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(campaign.sentCount / campaign.totalCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}