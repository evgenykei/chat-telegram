interface IDatabase {
  chatCreate(chat: IChatSchema): Promise<void>
  chatRead(chatId: number): Promise<IChatSchema | undefined>
  chatUpdate(chatId: number, localeName: string): Promise<void>
  chatDelete(chatId: number): Promise<void>
}
