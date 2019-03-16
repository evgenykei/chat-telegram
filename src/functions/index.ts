import axios from 'axios'
import * as config from 'node-config-ts'

import IBot from '../bot/IBot'
import Node from '../menu/Node'
import LocaleService from '../services/locale/LocaleService'
import { IFunction, IFunctionBody } from './IFunction'

// Отправить подменю
export const sendSubmenu: IFunction = async (body: IFunctionBody) => {
  if (!body.messageBody.messageId || !body.node.children) return
  body.bot.updateMenu(body.messageBody.chatId, body.messageBody.messageId, body.node.children)
}

// Получить отчет за неделю
export const weeklyReport: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Получить отчет за месяц
export const monthlyReport: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Сбросить пароль
export const resetPassword: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Запросить количество дней отпуска
export const requestVacationDays: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Отправить заявку на отпуск
export const requestVacation: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Обратиться в службу поддержки
export const contactSupport: IFunction = async (body: IFunctionBody) => {
  const { chatId, callbackQueryId } = body.messageBody
  if (callbackQueryId)
    await body.bot.answerCallbackQuery(chatId, callbackQueryId, 'text.notImplemented')
}

// Получить презентацию
export const getPresentation: IFunction = async (body: IFunctionBody) => {
  const { messageBody, bot, localeService } = body
  const { chatId, callbackQueryId } = messageBody

  const localeName = await localeService.getChatLocale(messageBody.chatId)
  const presentatioName = `chat_bot_info_${localeName}.pptx`

  await bot.sendDocument(messageBody.chatId, presentatioName)
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
