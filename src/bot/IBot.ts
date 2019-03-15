import { Observable } from 'rxjs'

import Node from '../menu/Node'
import Access from '../services/auth/Access'

interface IBot {
  sendText(chatId: number, textId: string): Promise<void>

  createMenu(chatId: number, textId: string, nodes: Node[]): Promise<void>
  updateMenu(chatId: number, messageId: number, nodes: Node[]): Promise<void>
  answerCallbackQuery(chatId: number, callbackQueryId: string, textId?: string): Promise<void>

  onText(regexp: RegExp, access: Access): Observable<MessageBody>
  onMenuClick(access: Access): Observable<MessageBody>
}

export default IBot
