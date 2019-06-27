process.env.NTBA_FIX_319 = '1'
process.env.NTBA_FIX_350 = '1'

import * as bluebird from 'bluebird'
import { filterByPromise } from 'filter-async-rxjs-pipe'
import * as _ from 'lodash'
import * as TelegramBot from 'node-telegram-bot-api'
import { ForceReply, InlineKeyboard } from 'node-telegram-keyboard-wrapper'
import { fromEventPattern, Observable } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import { Stream } from 'stream'

import Node from '../menu/Node'
import Access from '../services/auth/Access'
import AuthService from '../services/auth/AuthService'
import FileBody from '../services/file/FileBody'
import { FileService, FileSource } from '../services/file/FileService'
import LocaleService from '../services/locale/LocaleService'
import IBot from './IBot'

const uploadSessions: {[key: number]: number} = {}

export default class NodeTelegramBot implements IBot {
  private buttonsPerRow = 3
  private bot: TelegramBot
  private localeService: LocaleService
  private authService: AuthService
  private fileService: FileService

  constructor(token: string, localeService: LocaleService, authService: AuthService, fileService: FileService) {
    this.bot = new TelegramBot(token, {polling: true})
    this.localeService = localeService
    this.authService = authService
    this.fileService = fileService

    this.bot.on('polling_error', err => console.log(err))
    // this.bot.on('message', message => console.log(JSON.stringify(message, null, 2)))
  }

  public async sendText(chatId: number, textId: string, textArgs?: string[]): Promise<void> {
    await this.bot.sendMessage(chatId, await this.localeService.localizeText(chatId, textId, textArgs))
  }

  public async sendDocument(chatId: number, fileName: string, source: FileSource): Promise<void> {
    const file = await this.fileService.getFile(fileName, source)
    if (file instanceof FileBody) {
      const { filename, contentType } = file
      const result = await this.bot.sendDocument(chatId, file.stream, {}, { filename, contentType})
      if (result.document) await this.fileService.cacheFile(fileName, source, result.document.file_id)
    } else await this.bot.sendDocument(chatId, file)
  }

  public async sendPhoto(chatId: number, stream: Stream): Promise<void> {
    await this.bot.sendPhoto(chatId, stream, {})
  }

  public async registerUpload(chatId: number, action: (fileName?: string) => void,
                              textId: string, textArgs?: string[]): Promise<void> {

    const localizedText = await this.localeService.localizeText(chatId, textId, textArgs)
    const msg = await this.bot.sendMessage(chatId, localizedText, new ForceReply().build())

    uploadSessions[chatId] = this.bot.onReplyToMessage(chatId, msg.message_id, async (message: TelegramBot.Message) => {
      try {
        if (!message.reply_to_message ||
            message.reply_to_message.message_id !== msg.message_id ||
            !message.document) return

        this.bot.removeReplyListener(uploadSessions[chatId])
        delete uploadSessions[chatId]

        const { file_id, mime_type, file_name } = message.document
        const fileStream = this.bot.getFileStream(file_id)
        const fileName = await this.fileService.saveUpload(fileStream, file_id, mime_type, file_name)
        action(fileName)
      }
      catch (err){
        console.error(err)
        action()
      }
    })
  }

  public async createMenu(chatId: number, nodes: Node[] | Node[][],
                          textId: string, textArgs?: string[]): Promise<void> {

    const keyboard = (await this.createInlineKeyboard(chatId, nodes))
      .extract() as TelegramBot.InlineKeyboardMarkup

    await this.bot.sendMessage(chatId, await this.localeService.localizeText(chatId, textId, textArgs), {
      reply_markup: keyboard,
    })
  }

  public async updateMenu(chatId: number, messageId: number, nodes: Node[] | Node[][],
                          textId?: string, textArgs?: string[]): Promise<void> {

    const keyboard = (await this.createInlineKeyboard(chatId, nodes))
      .extract() as TelegramBot.InlineKeyboardMarkup

    if (textId) await this.bot.editMessageText(await this.localeService.localizeText(chatId, textId, textArgs), {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard,
    })
    else await this.bot.editMessageReplyMarkup(keyboard, {
      chat_id: chatId,
      message_id: messageId,
    })
  }

  public async answerCallbackQuery(chatId: number, callbackQueryId: string,
                                   textId?: string, textArgs?: string[]): Promise<void> {

    await this.bot.answerCallbackQuery(callbackQueryId, {
      text: textId ? await this.localeService.localizeText(chatId, textId, textArgs) : undefined,
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

  public onPlainText(access: Access): Observable<MessageBody> {
    return fromEventPattern<TelegramBot.Message[]>(
      handler => this.bot.on('text', handler),
      handler => this.bot.off('text', handler),
    ).pipe(
      map(result => result[0]),
      filter(message => message.from !== undefined && message.text !== undefined && !message.entities),
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
        callbackData: query.data!,
        messageId: query.message!.message_id,
      })),
    )
  }

  // Private methods

  private async createInlineKeyboard(chatId: number, nodes: Node[] | Node[][]): Promise<InlineKeyboard> {
    const keyboard = new InlineKeyboard()

    const buttons = this.isNodeArray(nodes)
      ? this.arrangeButtons(await this.localeService.localizeNodes(chatId, nodes))
      : await Promise.all(nodes.map(row => this.localeService.localizeNodes(chatId, row)))

    buttons.forEach(row => keyboard.addRow(...row))

    return keyboard
  }

  private arrangeButtons(buttons: KeyboardBody[]): KeyboardBody[][] {
    // Map, where key: buttons per row, value: button title length
    const buttonsMap: {[key: number]: number} = {
      1: 35,
      2: 17,
      3: 12,
      4: 7,
      5: 5,
      6: 4,
      7: 3,
    }

    const rows: KeyboardBody[][] = []
    while (buttons.length > 0) {
      const popped: KeyboardBody[] = []
      while (
        !buttonsMap[buttons.length] ||
        buttons.some(it => it.text.length > buttonsMap[buttons.length])
      ) if (buttons.length > 0) popped.unshift(buttons.pop()!)
      if (buttons.length > 0) rows.push(buttons)
      else if (popped.length > 0) rows.push([popped.shift()!])
      buttons = popped
    }

    return rows
  }

  // Type guards

  private isNodeArray(nodes: Node[] | Node[][]): nodes is Node[] {
    return nodes[0] instanceof Node
  }
}
