process.env.NTBA_FIX_319 = '1'

import { filterByPromise } from 'filter-async-rxjs-pipe'
import * as _ from 'lodash'
import * as TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard } from 'node-telegram-keyboard-wrapper'
import { fromEventPattern, Observable, Subject } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'

import Node from '../menu/Node'
import Access from '../services/auth/Access'
import AuthService from '../services/auth/AuthService'
import LocaleService from '../services/locale/LocaleService'
import IBot from './IBot'

export default class NodeTelegramBot implements IBot {
  private buttonsPerRow = 3
  private bot: TelegramBot
  private localeService: LocaleService
  private authService: AuthService

  constructor(token: string, localeService: LocaleService, authService: AuthService) {
    this.bot = new TelegramBot(token, {polling: true})
    this.localeService = localeService
    this.authService = authService

    /* this.bot.onText(/\/inlineKeyboard/i, msg => {
      if (msg.from) this.bot.sendMessage(msg.from.id, 'This is a message with an inline keyboard.', keyboard.build())
    })

    this.bot.on('callback_query', async query => {
      await this.bot.answerCallbackQuery(query.id, { text: 'Action received!' })
      this.bot.sendMessage(query.from.id, 'Hey there! You clicked on an inline button! ;) \
        So, as you saw, the support library works!')
    }) */

    this.bot.on('polling_error', err => console.log(err))
    this.bot.on('message', message => console.log(JSON.stringify(message, null, 2)))
  }

  public async sendText(chatId: number, textId: string): Promise<void> {
    await this.bot.sendMessage(chatId, await this.localeService.localizeText(chatId, textId))
  }

  public async createMenu(chatId: number, textId: string, nodes: Node[]): Promise<void> {
    const keyboard = await this.createInlineKeyboard(chatId, nodes)
    await this.bot.sendMessage(chatId, await this.localeService.localizeText(chatId, textId), keyboard.build())
  }

  public async updateMenu(chatId: number, messageId: number, nodes: Node[]): Promise<void> {
    const keyboard = await this.createInlineKeyboard(chatId, nodes)
    await this.bot.editMessageReplyMarkup(keyboard.extract() as TelegramBot.InlineKeyboardMarkup, {
      chat_id: chatId,
      message_id: messageId,
    })
  }

  public async answerCallbackQuery(chatId: number, callbackQueryId: string, textId?: string): Promise<void> {
    await this.bot.answerCallbackQuery(callbackQueryId, {
      text: textId ? await this.localeService.localizeText(chatId, textId) : undefined,
    })
  }

  public onText(regexp: RegExp, access: Access): Observable<MessageBody> {
    return fromEventPattern<TelegramBot.Message[]>(
      handler => this.bot.on('text', handler),
      handler => this.bot.off('text', handler),
    ).pipe(
      map(result => result[0]),
      filter(message => message.from !== undefined && message.text !== undefined && regexp.test(message.text)),
      filterByPromise(message => this.authService.isAuthenticated(message.from!.id, access), false),
      map(message => ({
        chatId: message.chat.id,
        text: message.text || '',
      })),
    )
  }

  public onMenuClick(access: Access): Observable<MessageBody> {
    return fromEventPattern<TelegramBot.CallbackQuery>(
      handler => this.bot.on('callback_query', handler),
      handler => this.bot.off('callback_query', handler),
    ).pipe(
      filter(query => query.data !== undefined && query.message !== undefined),
      filterByPromise(query => this.authService.isAuthenticated(query.from.id, access), false),
      map(query => ({
        callbackQueryId: query.id,
        chatId: query.from.id,
        menuId: query.data!,
        messageId: query.message!.message_id,
      })),
    )
  }

  // Private methods

  private async createInlineKeyboard(chatId: number, nodes: Node[]): Promise<InlineKeyboard> {
    const localizeNodes = await this.localeService.localizeNodes(chatId, nodes)
    const keyboard = new InlineKeyboard()
    _.chunk(_.map(localizeNodes, obj => ({
      callback_data: obj.menuId,
      text: obj.title,
    })), this.buttonsPerRow).forEach(chunk => keyboard.addRow(...chunk))
    return keyboard
  }
}
