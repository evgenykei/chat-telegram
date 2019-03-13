import { Observable } from 'rxjs'
import MenuBody from './MenuBody'

interface IBot {
  sendMenu(chatId: number, buttons: MenuBody[]): Promise<void>
  editMenu(chatId: number, messageId: number, buttons: MenuBody[]): Promise<void>
  answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void>

  onText(regexp: RegExp): Observable<MessageBody>
  onMenuClick(): Observable<MessageBody>
}

export default IBot
