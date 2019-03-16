import axios from 'axios'
import * as config from 'node-config-ts'

import IBot from '../bot/IBot'
import Node from '../menu/Node'
import LocaleService from '../services/locale/LocaleService'
import IFunction from './IFunction'

// Отправить подменю
export const sendSubmenu: IFunction = async (body: MessageBody, node: Node, bot: IBot) => {
  if (!body.messageId || !node.children) return
  bot.updateMenu(body.chatId, body.messageId, node.children)
}

// Получить отчет за неделю
export const weeklyReport: IFunction = async (body: MessageBody, node: Node, bot: IBot) => {
  if (!body.callbackQueryId) return
  await bot.answerCallbackQuery(body.chatId, body.callbackQueryId, 'text.notImplemented')
}

// Получить отчет за месяц
export const monthlyReport: IFunction = async (body: MessageBody, node: Node, bot: IBot) => {
  if (!body.callbackQueryId) return
  await bot.answerCallbackQuery(body.chatId, body.callbackQueryId, 'text.notImplemented')
}

// Сбросить пароль
export const resetPassword: IFunction = async (body: MessageBody, node: Node, bot: IBot) => {
  if (!body.callbackQueryId) return
  await bot.answerCallbackQuery(body.chatId, body.callbackQueryId, 'text.notImplemented')
}

// Запросить количество дней отпуска
export const requestVacationDays: IFunction = async (body: MessageBody, node: Node, bot: IBot) => {
  if (!body.callbackQueryId) return
  await bot.answerCallbackQuery(body.chatId, body.callbackQueryId, 'text.notImplemented')
}

// Отправить заявку на отпуск
export const requestVacation: IFunction = async (body: MessageBody, node: Node, bot: IBot) => {
  if (!body.callbackQueryId) return
  await bot.answerCallbackQuery(body.chatId, body.callbackQueryId, 'text.notImplemented')
}

// Обратиться в службу поддержки
export const contactSupport: IFunction = async (body: MessageBody, node: Node, bot: IBot) => {
  if (!body.callbackQueryId) return
  await bot.answerCallbackQuery(body.chatId, body.callbackQueryId, 'text.notImplemented')
}

// Получить презентацию
export const getPresentation: IFunction = async (body: MessageBody, node: Node, bot: IBot) => {
  if (!body.callbackQueryId) return
  await bot.answerCallbackQuery(body.chatId, body.callbackQueryId, 'text.notImplemented')
}

// Установить язык
export const setLanguage: IFunction = async (body: MessageBody, node: Node, bot: IBot, lm: LocaleService) => {
  const changed = await lm.setChatLocale(body.chatId, node.id)

  if (body.callbackQueryId)
    await bot.answerCallbackQuery(body.chatId, body.callbackQueryId, changed ? 'text.languageChanged' : undefined)
  if (changed && body.messageId && node.parent && node.parent.children )
    bot.updateMenu(body.chatId, body.messageId, node.parent.children, 'text.menu')
}
