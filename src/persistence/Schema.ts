interface IMainSchema {
  chats: IChatSchema[]
  files: IFileSchema[]
}

interface IChatSchema {
  chatId: number
  localeName: string
}

interface IFileSchema {
  hash: string,
  fileId: string
}
