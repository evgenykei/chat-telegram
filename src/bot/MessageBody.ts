class MessageBody {
  public readonly userId: number
  public readonly chatId: number
  public readonly messageId?: number
  public readonly callbackQueryId?: string
  public readonly menuId?: string
  public readonly text?: string

  constructor(
    userId: number,
    chatId: number,
    messageId?: number,
    callbackQueryId?: string,
    menuId?: string, text?: string,
  ) {
    this.userId = userId
    this.chatId = chatId
    this.messageId = messageId
    this.callbackQueryId = callbackQueryId
    this.menuId = menuId
    this.text = text
  }
}
