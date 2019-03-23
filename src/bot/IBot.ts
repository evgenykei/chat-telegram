import { Observable } from 'rxjs'
import { Stream } from 'stream'

import Node from '../menu/Node'
import Access from '../services/auth/Access'
import { FileSource } from '../services/file/FileService'

interface IBot {
  sendText(chatId: number, textId: string, textArgs?: string[]): Promise<void>
  sendDocument(chatId: number, fileName: string, source: FileSource): Promise<void>
  sendPhoto(chatId: number, stream: Stream): Promise<void>

  registerUpload(chatId: number, action: (fileName?: string) => void,
                 textId: string, textArgs?: string[]): Promise<void>

  createMenu(chatId: number, nodes: Node[] | Node[][], textId: string, textArgs?: string[]): Promise<void>
  updateMenu(chatId: number, messageId: number, nodes: Node[] | Node[][],
             textId?: string, textArgs?: string[]): Promise<void>
  answerCallbackQuery(chatId: number, callbackQueryId: string, textId?: string, textArgs?: string[]): Promise<void>

  onText(regexp: RegExp, access: Access): Observable<MessageBody>
  onMenuClick(access: Access): Observable<MessageBody>
}

export default IBot
