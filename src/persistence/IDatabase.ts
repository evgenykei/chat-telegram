interface IDatabase {
  chatCreate(chat: IChatSchema): Promise<void>
  chatRead(chatId: number): Promise<IChatSchema | undefined>
  chatUpdate(chatId: number, localeName: string): Promise<void>
  chatDelete(chatId: number): Promise<void>

  fileCreate(file: IFileSchema): Promise<void>
  fileRead(hash: string): Promise<IFileSchema | undefined>
  fileUpdate(hash: string, fileId: string): Promise<void>
  fileDelete(hash: string): Promise<void>
}
