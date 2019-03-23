import axios from 'axios'
import * as _ from 'lodash'
import * as moment from 'moment'
import { Stream } from 'stream'

import AbapAPI from '../api/abap/AbapAPI'
import { FileSource } from '../services/file/FileService'
import * as Calendar from './calendar/calendarBuilder'
import { IFunction, IFunctionBody } from './IFunction'

const abapAPI = new AbapAPI()

// Отправить подменю
export const sendSubmenu: IFunction = async (body: IFunctionBody) => {
  const { bot, messageBody, node } = body
  const { chatId, messageId } = messageBody

  if (!node.children) return
  if (messageId) bot.updateMenu(chatId, messageId, node.children)
  else bot.createMenu(chatId, node.children, 'text.menu')
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
            data: _.fill(Array(7), 0).map(() => Math.floor(Math.random() * (200 - 5 + 1) + 5)),
          }, {
            label: 'Cats',
            data: _.fill(Array(7), 0).map(() => Math.floor(Math.random() * (200 - 5 + 1) + 5)),
          }],
        },
      },
    },
  })

  await bot.sendPhoto(chatId, pngStream.data as Stream)
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
            data: _.fill(Array(daysInMonth), 0).map(() => Math.floor(Math.random() * (200 - 5 + 1) + 5)),
          }],
        },
      },
    },
  })

  await bot.sendPhoto(chatId, pngStream.data as Stream)
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId)
}

// Сбросить пароль
export const resetPassword: IFunction = async (body: IFunctionBody) => {
  const { bot } = body
  const { chatId, callbackQueryId } = body.messageBody

  try {
    const newPassword = await abapAPI.resetPassword(chatId)
    await bot.sendText(chatId, 'text.passwordResetSuccess', [newPassword])
  }
  catch (err) {
    console.error(err)
    await bot.sendText(chatId, 'text.passwordResetFail')
  }
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId)
}

// Запросить количество дней отпуска
export const requestVacationDays: IFunction = async (body: IFunctionBody) => {
  const { args, bot, node, localeService } = body
  const { chatId, callbackQueryId, messageId } = body.messageBody

  if (!callbackQueryId || !messageId) return

  // send calendar
  if (!args) {
    const locale = await localeService.getChatLocale(chatId),
          iso = locale ? locale.iso : undefined

    const buttons = Calendar.BuildDays(node, iso, undefined, moment())
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
      const date = moment({ year: argsParsed[0], month: argsParsed[1], day: argsParsed[2] })
      const vacationDays = await abapAPI.getVacationDays(chatId, date)
      await bot.sendText(chatId, 'text.vacationDaysSuccess', [vacationDays.toString()])
    }
    catch (err) {
      console.error(err)
      await bot.sendText(chatId, 'text.vacationDaysFail')
    }
    await body.bot.answerCallbackQuery(chatId, callbackQueryId)
  }
  else throw new Error('Wrong args length')
}

// Отправить заявку на отпуск
export const requestVacation: IFunction = async (body: IFunctionBody) => {
  const { bot } = body
  const { chatId, callbackQueryId } = body.messageBody
  await bot.sendDocument(chatId, 'application.txt', FileSource.files)
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId)
}

// Обратиться в службу поддержки
export const contactSupport: IFunction = async (body: IFunctionBody) => {
  const { bot } = body
  const { chatId, callbackQueryId } = body.messageBody
  await bot.registerUpload(chatId, fileName => {
    if (fileName) bot.sendText(chatId, 'text.fileUploadSuccess')
    else bot.sendText(chatId, 'text.fileUploadFail')
  }, 'text.fileUpload')
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId)
}

// Получить презентацию
export const getPresentation: IFunction = async (body: IFunctionBody) => {
  const { messageBody, bot, localeService } = body
  const { chatId, callbackQueryId } = messageBody

  const localeName = await localeService.getChatLocaleName(messageBody.chatId)
  const presentationName = `chat_bot_info_${localeName}.pptx`

  await bot.sendDocument(messageBody.chatId, presentationName, FileSource.files)
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
