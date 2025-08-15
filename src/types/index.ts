export interface Instance {
  id: string;
  name: string;
  connectionStatus: 'open' | 'connecting' | 'close';
  ownerJid?: string;
  profileName?: string;
  profilePicUrl?: string;
  integration: string;
  number?: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  qrCode?: string;
  pairingCode?: string;
}

export interface CreateInstanceRequest {
  instanceName: string;
  integration: string;
  number: string;
  token: string;
  qrcode: boolean;
}

export interface CreateInstanceResponse {
  instance: {
    instanceName: string;
    instanceId: string;
    integration: string;
    webhookWaBusiness: string | null;
    accessTokenWaBusiness: string;
    status: string;
  };
  hash: string;
  webhook: object;
  websocket: object;
  rabbitmq: object;
  sqs: object;
  settings: {
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
    syncFullHistory: boolean;
    wavoipToken: string;
  };
  qrcode: {
    pairingCode: string;
    code: string;
    base64: string;
    count: number;
  };
}

export interface WebhookPayload {
  instanceId: string;
  instanceName: string;
  campaignId: string;
  message: string;
  image?: string;
  contacts: Contact[];
  totalContacts: number;
  delayBetweenMessages: number;
  scheduledAt?: string;
}

export interface Contact {
  row_number: number;
  Number: string;
  contact_id: string;
}