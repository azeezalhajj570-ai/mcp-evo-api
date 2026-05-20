import axios from "axios";
import { config } from "../config.js";
import { 
  ApiInfo, 
  InstanceStatus, 
  SendTextMessageRequest, 
  SendTextMessageResponse, 
  CheckNumberRequest, 
  CheckNumberResponse,
  Contact,
  Chat,
  SendTemplateRequest,
  SendMediaRequest,
  SendAudioRequest,
  SendStickerRequest,
  SendLocationRequest,
  SendContactRequest,
  SendReactionRequest,
  SendPollRequest,
  SendListRequest,
  SendStatusRequest,
  ProfileInfo,
  UpdateProfileRequest,
  PrivacySettings,
  CreateGroupRequest,
  GroupInfo,
  GroupUpdateRequest,
  GroupSettingRequest,
  WebhookConfig,
  ChatwootConfig,
  TypebotConfig,
  InstanceConfig
} from "../types.js";

// Service class for Evolution API
// Global apikey (from .env) is always sent. Instance token is added per-session.
export class EvolutionApiService {
  readonly instanceId: string;
  private instanceToken: string;
  private apiClient: import("axios").AxiosInstance;

  constructor(
    instanceId: string = config.evolutionApi.instanceId,
    instanceToken: string = config.evolutionApi.instanceToken
  ) {
    this.instanceId = instanceId;
    this.instanceToken = instanceToken;

    this.apiClient = axios.create({
      baseURL: config.evolutionApi.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "apikey": config.evolutionApi.apiKey,
        ...(instanceToken ? { "instance-token": instanceToken } : {})
      }
    });
  }

  // ===== FUNÇÕES GERAIS DA API =====

  // Get API info
  async getApiInfo(): Promise<ApiInfo> {
    try {
      const response = await this.apiClient.get<ApiInfo>("/");
      return response.data;
    } catch (error: any) {
      console.error("[EvolutionAPI] Error getting API info:", error.message);
      throw error;
    }
  }

  // ===== INSTANCE MANAGEMENT =====

  // Get instance status — API returns { instance: { instanceName, state } }
  async getInstanceStatus(): Promise<InstanceStatus> {
    try {
      const url = `/instance/connectionState/${this.instanceId}`;
      const response = await this.apiClient.get(url);
      const data = response.data;
      const inst = data.instance || data;
      return {
        state: inst.state || inst.connectionStatus || "Unknown",
        connectionStatus: inst.connectionStatus || inst.state || "Unknown",
        status: inst.status || inst.state || inst.connectionStatus || "Unknown",
        qrcode: inst.qrcode,
        message: inst.message,
        instanceName: inst.instanceName || this.instanceId
      };
    } catch (error: any) {
      console.error(`[EvolutionAPI] Error checking instance "${this.instanceId}":`, error.message);
      if (error.response?.status === 404) {
        throw new Error(
          `Instance "${this.instanceId}" not found. URL: ${config.evolutionApi.baseUrl}/instance/connectionState/${this.instanceId}`
        );
      }
      throw error;
    }
  }

  // List all instances
  async fetchInstances(): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/instance/fetchInstances');
      return response.data || [];
    } catch (error: any) {
      console.error("[EvolutionAPI] Error fetching instances:", error.message);
      throw error;
    }
  }

  // Create a new instance
  async createInstance(instanceName: string, cfg?: InstanceConfig): Promise<any> {
    try {
      const response = await this.apiClient.post('/instance/create', {
        instanceName,
        ...cfg
      });
      return response.data;
    } catch (error: any) {
      console.error("[EvolutionAPI] Error creating instance:", error.message);
      throw error;
    }
  }

  // Delete an instance
  async deleteInstance(): Promise<any> {
    try {
      const response = await this.apiClient.delete(`/instance/delete/${this.instanceId}`);
      return response.data;
    } catch (error: any) {
      console.error("[EvolutionAPI] Error deleting instance:", error.message);
      throw error;
    }
  }

  // Restart an instance
  async restartInstance(): Promise<any> {
    try {
      const response = await this.apiClient.put(`/instance/restart/${this.instanceId}`);
      return response.data;
    } catch (error: any) {
      console.error("[EvolutionAPI] Error restarting instance:", error.message);
      if (error.response?.status === 404) {
        throw new Error(
          `Instance "${this.instanceId}" not found or restart endpoint unavailable. ` +
          `Check EVOLUTION_API_INSTANCE env var or use "fetchInstances" tool.`
        );
      }
      throw error;
    }
  }

  // Set instance presence
  async setPresence(presence: "available" | "unavailable" | "composing" | "recording" | "paused"): Promise<any> {
    try {
      const response = await this.apiClient.post(`/instance/presence/${this.instanceId}`, {
        presence
      });
      return response.data;
    } catch (error: any) {
      console.error("[EvolutionAPI] Error setting presence:", error.message);
      throw error;
    }
  }

  // Logout instance from WhatsApp
  async logout(): Promise<any> {
    try {
      const response = await this.apiClient.delete(`/instance/logout/${this.instanceId}`);
      return response.data;
    } catch (error: any) {
      console.error("[EvolutionAPI] Error logging out instance:", error.message);
      throw error;
    }
  }

  // ===== WEBHOOK =====

  // Configure webhook
  async setWebhook(webhook: WebhookConfig): Promise<any> {
    try {
      const response = await this.apiClient.post(`/webhook/set/${this.instanceId}`, webhook);
      return response.data;
    } catch (error: any) {
      console.error("[EvolutionAPI] Error setting webhook:", error.message);
      throw error;
    }
  }

  // Get webhook config
  async getWebhook(): Promise<any> {
    try {
      const response = await this.apiClient.get(`/webhook/find/${this.instanceId}`);
      return response.data;
    } catch (error: any) {
      console.error("[EvolutionAPI] Error fetching webhook:", error.message);
      throw error;
    }
  }

  // ===== SETTINGS =====

  // Definir configurações da instância
  async setSettings(settings: any): Promise<any> {
    try {
      const response = await this.apiClient.post(`/settings/set/${this.instanceId}`, settings);
      return response.data;
    } catch (error) {
      console.error("Erro ao definir configurações:", error);
      throw error;
    }
  }

  // Buscar configurações da instância
  async getSettings(): Promise<any> {
    try {
      const response = await this.apiClient.get(`/settings/find/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      throw error;
    }
  }

  // ===== ENVIO DE MENSAGENS =====

  // Enviar mensagem de texto
  async sendTextMessage({ number, text, options }: SendTextMessageRequest): Promise<SendTextMessageResponse> {
    try {
      const response = await this.apiClient.post<SendTextMessageResponse>(`/message/text/${this.instanceId}`, {
        number,
        options: options || { delay: 1200 },
        textMessage: { text }
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar mensagem de texto:", error);
      throw error;
    }
  }

  // Enviar template
  async sendTemplate(data: SendTemplateRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/template/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar template:", error);
      throw error;
    }
  }

  // Enviar status
  async sendStatus(data: SendStatusRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/status/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar status:", error);
      throw error;
    }
  }

  // Enviar mídia
  async sendMedia(data: SendMediaRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/media/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar mídia:", error);
      throw error;
    }
  }

  // Enviar áudio WhatsApp
  async sendAudio(data: SendAudioRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/audio/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar áudio:", error);
      throw error;
    }
  }

  // Enviar sticker
  async sendSticker(data: SendStickerRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/sticker/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar sticker:", error);
      throw error;
    }
  }

  // Enviar localização
  async sendLocation(data: SendLocationRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/location/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar localização:", error);
      throw error;
    }
  }

  // Enviar contato
  async sendContact(data: SendContactRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/contact/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      throw error;
    }
  }

  // Enviar reação
  async sendReaction(data: SendReactionRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/reaction/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar reação:", error);
      throw error;
    }
  }

  // Enviar enquete
  async sendPoll(data: SendPollRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/poll/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar enquete:", error);
      throw error;
    }
  }

  // Enviar lista
  async sendList(data: SendListRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/message/list/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar lista:", error);
      throw error;
    }
  }

  // ===== CONTROLADOR DE CHAT =====

  // Verificar se um número é do WhatsApp
  async checkWhatsAppNumber({ phone }: CheckNumberRequest): Promise<CheckNumberResponse> {
    try {
      const response = await this.apiClient.post<CheckNumberResponse>(`/chat/whatsappNumbers/${this.instanceId}`, {
        numbers: [phone]
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao verificar número de WhatsApp:", error);
      throw error;
    }
  }

  // Marcar mensagem como lida
  async markMessageAsRead(messageId: string): Promise<any> {
    try {
      const response = await this.apiClient.put(`/chat/markMessageAsRead/${this.instanceId}`, {
        messageId
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar mensagem como lida:", error);
      throw error;
    }
  }

  // Arquivar chat
  async archiveChat(number: string): Promise<any> {
    try {
      const response = await this.apiClient.put(`/chat/archiveChat/${this.instanceId}`, {
        phone: number,
        action: "archive" // ou "unarchive"
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao arquivar chat:", error);
      throw error;
    }
  }

  // Excluir mensagem para todos
  async deleteMessageForEveryone(messageId: string): Promise<any> {
    try {
      const response = await this.apiClient.delete(`/chat/deleteMessageForEveryone/${this.instanceId}/${messageId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir mensagem para todos:", error);
      throw error;
    }
  }

  // Definir presença no chat
  async sendPresence(presence: string, chatJid: string): Promise<any> {
    try {
      const response = await this.apiClient.post(`/chat/presence/${this.instanceId}`, {
        presence,
        chatJid
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao definir presença no chat:", error);
      throw error;
    }
  }

  // Buscar foto de perfil
  async fetchProfilePictureUrl(number: string): Promise<any> {
    try {
      const response = await this.apiClient.post(`/chat/fetchProfilePictureUrl/${this.instanceId}`, {
        number
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar foto de perfil:", error);
      throw error;
    }
  }

  // Buscar contatos
  async fetchContacts(): Promise<{ data: Contact[] }> {
    try {
      const response = await this.apiClient.post<{ data: Contact[] }>(`/chat/contacts/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
      throw error;
    }
  }

  // Buscar mensagens
  async findMessages(query: string, chatId?: string): Promise<any> {
    try {
      const response = await this.apiClient.post(`/chat/findMessages/${this.instanceId}`, {
        query,
        chatId
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      throw error;
    }
  }

  // Buscar mensagens de status
  async findStatusMessages(): Promise<any> {
    try {
      const response = await this.apiClient.post(`/chat/findStatusMessages/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar mensagens de status:", error);
      throw error;
    }
  }

  // Atualizar mensagem
  async updateMessage(messageId: string, text: string): Promise<any> {
    try {
      const response = await this.apiClient.put(`/chat/updateMessage/${this.instanceId}`, {
        messageId,
        text
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar mensagem:", error);
      throw error;
    }
  }

  // Buscar conversas
  async fetchChats(): Promise<{ data: Chat[] }> {
    try {
      const response = await this.apiClient.get<{ data: Chat[] }>(`/chat/findChats/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
      throw error;
    }
  }

  // ===== CONFIGURAÇÕES DE PERFIL =====

  // Buscar perfil de negócios
  async fetchBusinessProfile(): Promise<any> {
    try {
      const response = await this.apiClient.post(`/profile/fetchBusinessProfile/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar perfil de negócios:", error);
      throw error;
    }
  }

  // Buscar perfil
  async fetchProfile(): Promise<ProfileInfo> {
    try {
      const response = await this.apiClient.post<ProfileInfo>(`/profile/fetchProfile/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      throw error;
    }
  }

  // Atualizar nome do perfil
  async updateProfileName(name: string): Promise<any> {
    try {
      const response = await this.apiClient.post(`/profile/updateProfileName/${this.instanceId}`, {
        name
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar nome do perfil:", error);
      throw error;
    }
  }

  // Atualizar status do perfil
  async updateProfileStatus(status: string): Promise<any> {
    try {
      const response = await this.apiClient.post(`/profile/updateProfileStatus/${this.instanceId}`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar status do perfil:", error);
      throw error;
    }
  }

  // Atualizar foto do perfil
  async updateProfilePicture(url: string): Promise<any> {
    try {
      const response = await this.apiClient.put(`/profile/updateProfilePicture/${this.instanceId}`, {
        url
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar foto do perfil:", error);
      throw error;
    }
  }

  // Remover foto do perfil
  async removeProfilePicture(): Promise<any> {
    try {
      const response = await this.apiClient.delete(`/profile/removeProfilePicture/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao remover foto do perfil:", error);
      throw error;
    }
  }

  // Buscar configurações de privacidade
  async fetchPrivacySettings(): Promise<PrivacySettings> {
    try {
      const response = await this.apiClient.get<PrivacySettings>(`/profile/fetchPrivacySettings/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar configurações de privacidade:", error);
      throw error;
    }
  }

  // Atualizar configurações de privacidade
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<any> {
    try {
      const response = await this.apiClient.put(`/profile/updatePrivacySettings/${this.instanceId}`, settings);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar configurações de privacidade:", error);
      throw error;
    }
  }

  // ===== GERENCIAMENTO DE GRUPOS =====

  // Criar grupo
  async createGroup(data: CreateGroupRequest): Promise<any> {
    try {
      const response = await this.apiClient.post(`/group/create/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      throw error;
    }
  }

  // Atualizar foto do grupo
  async updateGroupPicture(groupId: string, url: string): Promise<any> {
    try {
      const response = await this.apiClient.put(`/group/updateGroupPicture/${this.instanceId}`, {
        groupId,
        url
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar foto do grupo:", error);
      throw error;
    }
  }

  // Atualizar assunto do grupo
  async updateGroupSubject(groupId: string, subject: string): Promise<any> {
    try {
      const response = await this.apiClient.put(`/group/updateGroupSubject/${this.instanceId}`, {
        groupId,
        subject
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar assunto do grupo:", error);
      throw error;
    }
  }

  // Atualizar descrição do grupo
  async updateGroupDescription(groupId: string, description: string): Promise<any> {
    try {
      const response = await this.apiClient.put(`/group/updateGroupDescription/${this.instanceId}`, {
        groupId,
        description
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar descrição do grupo:", error);
      throw error;
    }
  }

  // Buscar código de convite
  async fetchInviteCode(groupId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/group/fetchInviteCode/${this.instanceId}/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar código de convite:", error);
      throw error;
    }
  }

  // Aceitar código de convite
  async acceptInviteCode(code: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/group/acceptInviteCode/${this.instanceId}/${code}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao aceitar código de convite:", error);
      throw error;
    }
  }

  // Revogar código de convite
  async revokeInviteCode(groupId: string): Promise<any> {
    try {
      const response = await this.apiClient.put(`/group/revokeInviteCode/${this.instanceId}/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao revogar código de convite:", error);
      throw error;
    }
  }

  // Enviar convite de grupo
  async sendGroupInvite(groupId: string, numbers: string[]): Promise<any> {
    try {
      const response = await this.apiClient.post(`/group/sendGroupInvite/${this.instanceId}`, {
        groupId,
        numbers
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar convite de grupo:", error);
      throw error;
    }
  }

  // Buscar grupo por código de convite
  async findGroupByInviteCode(code: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/group/findGroupByInviteCode/${this.instanceId}/${code}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar grupo por código de convite:", error);
      throw error;
    }
  }

  // Buscar grupo por JID
  async findGroupByJid(groupId: string): Promise<GroupInfo> {
    try {
      const response = await this.apiClient.get<GroupInfo>(`/group/findGroupByJid/${this.instanceId}/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar grupo por JID:", error);
      throw error;
    }
  }

  // Buscar todos os grupos
  async fetchAllGroups(): Promise<{ data: GroupInfo[] }> {
    try {
      const response = await this.apiClient.get<{ data: GroupInfo[] }>(`/group/fetchAllGroups/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar todos os grupos:", error);
      throw error;
    }
  }

  // Buscar membros do grupo
  async findGroupMembers(groupId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/group/findGroupMembers/${this.instanceId}/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar membros do grupo:", error);
      throw error;
    }
  }

  // Atualizar membros do grupo
  async updateGroupMembers(data: GroupUpdateRequest): Promise<any> {
    try {
      const response = await this.apiClient.put(`/group/updateGroupMembers/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar membros do grupo:", error);
      throw error;
    }
  }

  // Atualizar configuração do grupo
  async updateGroupSetting(data: GroupSettingRequest): Promise<any> {
    try {
      const response = await this.apiClient.put(`/group/updateGroupSetting/${this.instanceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar configuração do grupo:", error);
      throw error;
    }
  }

  // Alternar mensagens efêmeras
  async toggleEphemeral(groupId: string, expiration: number): Promise<any> {
    try {
      const response = await this.apiClient.put(`/group/toggleEphemeral/${this.instanceId}`, {
        groupId,
        expiration // 0, 86400, 604800, 7776000
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao alternar mensagens efêmeras:", error);
      throw error;
    }
  }

  // Sair do grupo
  async leaveGroup(groupId: string): Promise<any> {
    try {
      const response = await this.apiClient.delete(`/group/leaveGroup/${this.instanceId}/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao sair do grupo:", error);
      throw error;
    }
  }

  // ===== TYPEBOT =====

  // Configurar Typebot
  async setTypebot(config: TypebotConfig): Promise<any> {
    try {
      const response = await this.apiClient.post(`/typebot/set/${this.instanceId}`, config);
      return response.data;
    } catch (error) {
      console.error("Erro ao configurar Typebot:", error);
      throw error;
    }
  }

  // Iniciar Typebot
  async startTypebot(number: string): Promise<any> {
    try {
      const response = await this.apiClient.post(`/typebot/start/${this.instanceId}`, {
        number
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao iniciar Typebot:", error);
      throw error;
    }
  }

  // Buscar configuração do Typebot
  async findTypebot(): Promise<TypebotConfig> {
    try {
      const response = await this.apiClient.get<TypebotConfig>(`/typebot/find/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar configuração do Typebot:", error);
      throw error;
    }
  }

  // Alterar status do Typebot
  async changeTypebotStatus(enabled: boolean): Promise<any> {
    try {
      const response = await this.apiClient.post(`/typebot/changeStatus/${this.instanceId}`, {
        enabled
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao alterar status do Typebot:", error);
      throw error;
    }
  }

  // ===== CHATWOOT =====

  // Configurar Chatwoot
  async setChatwoot(config: ChatwootConfig): Promise<any> {
    try {
      const response = await this.apiClient.post(`/chatwoot/set/${this.instanceId}`, config);
      return response.data;
    } catch (error) {
      console.error("Erro ao configurar Chatwoot:", error);
      throw error;
    }
  }

  // Buscar configuração do Chatwoot
  async findChatwoot(): Promise<ChatwootConfig> {
    try {
      const response = await this.apiClient.get<ChatwootConfig>(`/chatwoot/find/${this.instanceId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar configuração do Chatwoot:", error);
      throw error;
    }
  }
} 