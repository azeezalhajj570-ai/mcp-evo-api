export function sanitizeMessage(msg: any): any {
  if (!msg || typeof msg !== "object") return msg;
  return {
    id: msg.id,
    from: msg.key?.remoteJid || msg.remoteJid,
    fromMe: msg.key?.fromMe,
    sender: msg.pushName || msg.key?.participant || null,
    type: msg.messageType,
    text: msg.message?.conversation
      || msg.message?.extendedTextMessage?.text
      || msg.message?.imageMessage?.caption
      || msg.message?.videoMessage?.caption
      || msg.message?.documentMessage?.caption
      || (msg.message?.audioMessage ? "🎤 Audio" : null)
      || (msg.message?.imageMessage ? "🖼️ Image" : null)
      || (msg.message?.videoMessage ? "🎬 Video" : null)
      || (msg.message?.documentMessage ? "📄 Document" : null)
      || (msg.message?.stickerMessage ? "📎 Sticker" : null)
      || (msg.message?.locationMessage ? "📍 Location" : null)
      || (msg.message?.contactMessage ? "👤 Contact" : null)
      || (msg.message?.pollCreationMessage ? "📊 Poll" : null)
      || null,
    timestamp: msg.messageTimestamp,
    status: msg.status
  };
}

export function sanitizeChat(chat: any): any {
  if (!chat || typeof chat !== "object") return chat;
  return {
    id: chat.id,
    jid: chat.remoteJid,
    name: chat.pushName || chat.name || null,
    unread: chat.unreadCount ?? 0,
    lastMessage: chat.lastMessage ? sanitizeMessage(chat.lastMessage) : null,
    isGroup: chat.remoteJid?.includes("@g.us") || false,
    isSaved: chat.isSaved ?? false
  };
}

export function sanitizeContact(contact: any): any {
  if (!contact || typeof contact !== "object") return contact;
  return {
    id: contact.id,
    name: contact.name || contact.pushname || contact.pushName || null,
    number: contact.id?.replace(/[^0-9]/g, "") || null
  };
}

export function sanitizeLabel(label: any): any {
  if (!label || typeof label !== "object") return label;
  return {
    id: label.id,
    name: label.name,
    color: label.color
  };
}
