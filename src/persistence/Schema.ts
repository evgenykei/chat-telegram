interface IMainSchema {
  chats: IChatSchema[]
}

interface IChatSchema {
  chatId: number
  localeName: string
}
