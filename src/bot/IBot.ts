import { Observable } from 'rxjs'
import { Stream } from 'stream'

import Node from '../menu/Node'
import Access from '../services/auth/Access'

interface IBot {
  sendText(chatId: number, textId: string): Promise<void>
  sendDocument(chatId: number, fileName: string): Promise<void>
  SendPhoto(chatId: number, stream: Stream): Promise<void>

  createMenu(chatId: number, textId: string, nodes: Node[] | Node[][]): Promise<void>
  updateMenu(chatId: number, messageId: number, nodes: Node[] | Node[][], textId?: string): Promise<void>
  answerCallbackQuery(chatId: number, callbackQueryId: string, textId?: string): Promise<void>

  onText(regexp: RegExp, access: Access): Observable<MessageBody>
  onMenuClick(access: Access): Observable<MessageBody>
}

export default IBot
