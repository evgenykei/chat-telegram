import axios from 'axios'
import * as _ from 'lodash'
import * as moment from 'moment'
import * as config from 'node-config-ts'
import { Stream } from 'stream'

import IBot from '../bot/IBot'
import Node from '../menu/Node'
import LocaleService from '../services/locale/LocaleService'
import * as Calendar from './calendar/calendarBuilder'
import { IFunction, IFunctionBody } from './IFunction'

// Отправить подменю
export const sendSubmenu: IFunction = async (body: IFunctionBody) => {
  if (!body.messageBody.messageId || !body.node.children) return
  body.bot.updateMenu(body.messageBody.chatId, body.messageBody.messageId, body.node.children)
}

// Получить отчет за неделю
export const weeklyReport: IFunction = async (body: IFunctionBody) => {
  const { bot, localeService } = body
  const { chatId, callbackQueryId } = body.messageBody
  const locale = await localeService.getChatLocale(chatId)

  const pngStream = await axios.get('https://quickchart.io/chart', {
    responseType: 'stream',
    params: {
      c: {
        type: 'bar',
        data: {
          labels: _.range(1, 8).map(it => _.capitalize(moment().locale(locale!.iso).isoWeekday(it).format('dddd'))),
          datasets: [{
            label: 'Dogs',
            data: _.fill(Array(7), 0).map(it => Math.floor(Math.random() * (200 - 5 + 1) + 5)),
          }, {
            label: 'Cats',
            data: _.fill(Array(7), 0).map(it => Math.floor(Math.random() * (200 - 5 + 1) + 5)),
          }],
        },
      },
    },
  })

  await bot.SendPhoto(chatId, pngStream.data as Stream)
  if (callbackQueryId) await body.bot.answerCallbackQuery(chatId, callbackQueryId)
}

// Получить отчет за месяц
export const monthlyReport: IFunction = async (body: IFunctionBody) => {
  const { bot } = body
  const { chatId, callbackQueryId } = body.messageBody
  const daysInMonth = moment().daysInMonth()

  const pngStream = await axios.get('https://quickchart.io/chart', {
    responseType: 'stream',
    params: {
      c: {
        type: 'bar',
        data: {
          labels: _.range(1, daysInMonth + 1),
          datasets: [{
            label: 'Dogs and Cats',
            data: _.fill(Array(daysInMonth), 0).map(it => Math.floor(Math.random() * (200 - 5 + 1) + 5)),
          }],
        },
      },
    },
  })

  await bot.SendPhoto(chatId, pngStream.data as Stream)
  if (callbackQueryId) await body.bot.answerCallbackQuery(chatId, callbackQueryId)
}

// Сбросить пароль TODO
export const resetPassword: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Запросить количество дней отпуска TODO
export const requestVacationDays: IFunction = async (body: IFunctionBody) => {
  const { args, node, localeService } = body
  const { chatId, callbackQueryId, messageId } = body.messageBody

  if (!callbackQueryId || !messageId) return

  // send calendar
  if (!args) {
    const buttons = _.union(
      [[new Node(node.parent!.id, 'button.back')]],
      Calendar.BuildYears(node.id, undefined, new Date()),
    )
    body.bot.updateMenu(body.messageBody.chatId, messageId, buttons)
  }
  else if (args[0] === 'noaction')
    await body.bot.answerCallbackQuery(chatId, callbackQueryId)
  else if (args.length === 1) {
    const buttons = _.union(
      [[new Node(node.parent!.id, 'button.back')]],
      Calendar.BuildYears(node.id, parseInt(args[0], 10), new Date()),
    )
    body.bot.updateMenu(body.messageBody.chatId, messageId, buttons)
  }
  else if (args.length === 2) {
    const locale = await localeService.getChatLocale(chatId),
          iso = locale ? locale.iso : undefined
    const buttons = _.union(
      [[new Node(node.parent!.id, 'button.back')]],
      Calendar.BuildMonths(node.id, iso, parseInt(args[0], 10), new Date()),
    )
    body.bot.updateMenu(body.messageBody.chatId, messageId, buttons)

  }
  else if (args.length === 3)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
  else throw new Error('Wrong args length')
}

// Отправить заявку на отпуск TODO
export const requestVacation: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Обратиться в службу поддержки TODO
export const contactSupport: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Получить презентацию
export const getPresentation: IFunction = async (body: IFunctionBody) => {
  const { messageBody, bot, localeService } = body
  const { chatId, callbackQueryId } = messageBody

  const localeName = await localeService.getChatLocaleName(messageBody.chatId)
  const presentationName = `chat_bot_info_${localeName}.pptx`

  await bot.sendDocument(messageBody.chatId, presentationName)
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId)
}

// Установить язык
export const setLanguage: IFunction = async (body: IFunctionBody) => {
  const { localeService, messageBody, node, bot } = body
  const { chatId, callbackQueryId, messageId } = messageBody

  const changed = await localeService.setChatLocale(messageBody.chatId, node.id)

  if (callbackQueryId)
    await bot.answerCallbackQuery(chatId, callbackQueryId, changed ? 'text.languageChanged' : undefined)
  if (changed && messageId && node.parent && node.parent.children )
    bot.updateMenu(chatId, messageId, node.parent.children, 'text.menu')
}
