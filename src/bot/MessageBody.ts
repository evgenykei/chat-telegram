class MessageBody {
  public readonly chatId: number
  public readonly messageId?: number
  public readonly callbackQueryId?: string
  public readonly callbackData?: string
  public readonly text?: string

  constructor(
    chatId: number,
    messageId?: number,
    callbackQueryId?: string,
    callbackData?: string,
    text?: string,
  ) {
    this.chatId = chatId
    this.messageId = messageId
    this.callbackQueryId = callbackQueryId
    this.callbackData = callbackData
    this.text = text
  }
}
