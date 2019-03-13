process.env.NTBA_FIX_319 = '1'

import * as _ from 'lodash'
import * as TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard } from 'node-telegram-keyboard-wrapper'
import { fromEventPattern, Observable } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'

import IBot from './IBot'
import MenuBody from './MenuBody'

export default class NodeTelegramBot implements IBot {
  private buttonsPerRow = 3
  private bot: TelegramBot

  constructor(token: string) {
    this.bot = new TelegramBot(token, {polling: true})

    /* this.bot.onText(/\/inlineKeyboard/i, msg => {
      if (msg.from) this.bot.sendMessage(msg.from.id, 'This is a message with an inline keyboard.', keyboard.build())
    })

    this.bot.on('callback_query', async query => {
      await this.bot.answerCallbackQuery(query.id, { text: 'Action received!' })
      this.bot.sendMessage(query.from.id, 'Hey there! You clicked on an inline button! ;) \
        So, as you saw, the support library works!')
    }) */

    this.bot.on('polling_error', err => console.log(err))
  }

  public async sendMenu(chatId: number, buttons: MenuBody[]): Promise<void> {
    await this.bot.sendMessage(chatId, 'Menu', this.createInlineKeyboard(buttons).build())
  }

  public async editMenu(chatId: number, messageId: number, buttons: MenuBody[]): Promise<void> {
    await this.bot.editMessageText('Menu', {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: this.createInlineKeyboard(buttons).extract() as TelegramBot.InlineKeyboardMarkup,
    })
  }

  public async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    await this.bot.answerCallbackQuery(callbackQueryId, { text })
  }

  public onText(regexp: RegExp): Observable<MessageBody> {
    return fromEventPattern<TelegramBot.Message[]>(
      handler => this.bot.on('text', handler),
      handler => this.bot.off('text', handler),
    ).pipe(
      map(result => result[0]),
      filter(message => message.from !== undefined && message.text !== undefined && regexp.test(message.text)),
      map(message => ({
        chatId: message.chat.id,
        text: message.text || '',
        userId: message.from!.id,
      })),
    )
  }

  public onMenuClick(): Observable<MessageBody> {
    return fromEventPattern<TelegramBot.CallbackQuery>(
      handler => this.bot.on('callback_query', handler),
      handler => this.bot.off('callback_query', handler),
    ).pipe(
      filter(query => query.data !== undefined && query.message !== undefined),
      map(query => ({
        callbackQueryId: query.id,
        chatId: query.from.id,
        menuId: query.data!,
        messageId: query.message!.message_id,
        userId: query.from.id,
      })),
    )
  }

  private createInlineKeyboard(buttons: MenuBody[]): InlineKeyboard {
    const keyboard = new InlineKeyboard()
    _.chunk(_.map(buttons, obj => ({
      callback_data: obj.menuId,
      text: obj.title,
    })), 3).forEach(chunk => keyboard.addRow(...chunk))
    return keyboard
  }
}
