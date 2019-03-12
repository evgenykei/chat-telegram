import { Observable } from 'rxjs'

interface IBot {
  sendMenu(chatId: number, buttons: Array<{title: string, menuId: string}>): void
  editMenu(chatId: number, messageId: number, buttons: Array<{title: string, menuId: string}>): void

  onText(regexp: RegExp): Observable<{chatId: number, text: string}>
  onMenuClick(): Observable<{chatId: number, messageId: number, menuId: string}>
}

export default IBot
