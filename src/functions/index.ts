import axios from 'axios'
import * as _ from 'lodash'
import * as moment from 'moment'
import { config } from 'node-config-ts'
import { Stream } from 'stream'
import * as url from 'url'

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

// Сбросить пароль
export const resetPassword: IFunction = async (body: IFunctionBody) => {
  const { bot } = body
  const { chatId } = body.messageBody

  try {
    const req = await axios.get(url.resolve(config.urls.abapTransformer, config.urls.abapResetPasswordFunction), {
      params: { user_id: chatId },
    })
    const data = req.data as ResetPasswordBody
    if (data.SYSUBRC.trim() !== '0') throw new Error('Remote function finished with error')
    await bot.sendText(chatId, 'text.passwordResetSuccess', [data.NEWPASS])
  }
  catch (err) {
    console.error(err)
    await bot.sendText(chatId, 'text.passwordResetFail')
  }
}

// Запросить количество дней отпуска
export const requestVacationDays: IFunction = async (body: IFunctionBody) => {
  const { args, bot, node, localeService } = body
  const { chatId, callbackQueryId, messageId } = body.messageBody

  if (!callbackQueryId || !messageId) return

  // send calendar
  if (!args) {
    const buttons = Calendar.BuildYears(node, undefined, moment())
    bot.updateMenu(chatId, messageId, buttons)
  }

  else if (args[0] === 'noaction')
    await bot.answerCallbackQuery(chatId, callbackQueryId)

  // Send years
  else if (args.length === 1) {
    const argsParsed = args.map(it => parseInt(it, 10)),
          curDate = moment({ year: argsParsed[0] })

    const buttons = Calendar.BuildYears(node, curDate, moment())
    bot.updateMenu(chatId, messageId, buttons)
  }

  // Send months
  else if (args.length === 2) {
    const locale = await localeService.getChatLocale(chatId),
          iso = locale ? locale.iso : undefined,
          argsParsed = args.map(it => parseInt(it, 10)),
          curDate = moment({ year: argsParsed[0] })

    const buttons = Calendar.BuildMonths(node, iso, curDate, moment())
    bot.updateMenu(chatId, messageId, buttons)
  }

  // Send days
  else if (args.length === 3) {
    const locale = await localeService.getChatLocale(chatId),
          iso = locale ? locale.iso : undefined,
          argsParsed = args.map(it => parseInt(it, 10)),
          curDate = moment({ year: argsParsed[0], month: argsParsed[1] })

    const buttons = Calendar.BuildDays(node, iso, curDate, moment())
    bot.updateMenu(chatId, messageId, buttons)
  }
  // Send result
  else if (args.length === 4) {
    const argsParsed = args.map(it => parseInt(it, 10))
    try {
      const req = await axios.get(url.resolve(config.urls.abapTransformer, config.urls.abapDaysVacationFunction), {
        params: {
          user_id: chatId,
          dateto: moment({ year: argsParsed[0], month: argsParsed[1], day: argsParsed[2] }).format('YYYYMMDD'),
        },
      })
      const data = req.data as VacationDaysBody
      if (!data.DAYS.trim()) throw new Error('Remote function finished with error')
      await bot.sendText(chatId, 'text.vacationDaysSuccess', [data.DAYS.trim()])
    }
    catch (err) {
      console.error(err)
      await bot.sendText(chatId, 'text.vacationDaysFail')
    }
    await body.bot.answerCallbackQuery(chatId, callbackQueryId)
  }
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
