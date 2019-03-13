import IBot from '../bot/IBot'
import LocaleManager from '../localeManager/LocaleManager'
import Node from '../menu/Node'
import IFunction from './IFunction'

// Отправить подменю
export const sendSubmenu: IFunction = async (body: MessageBody, node: Node, bot: IBot, lm: LocaleManager) => {
  if (!body.messageId || !node.children) return
  const menuBodies = await Promise.all(node.children.map(child => lm.wrapNode(body.userId, child)))
  bot.editMenu(body.chatId, body.messageId, menuBodies)
}

// Получить отчет за неделю
export const weeklyReport: IFunction = (body: MessageBody) => {
  throw new Error('Method not implemented.')
}

// Получить отчет за месяц
export const monthlyReport: IFunction = (body: MessageBody) => {
  throw new Error('Method not implemented.')
}

// Сбросить пароль
export const resetPassword: IFunction = (body: MessageBody) => {
  throw new Error('Method not implemented.')
}

// Запросить количество дней отпуска
export const requestVacationDays: IFunction = (body: MessageBody) => {
  throw new Error('Method not implemented.')
}

// Отправить заявку на отпуск
export const requestVacation: IFunction = (body: MessageBody) => {
  throw new Error('Method not implemented.')
}

// Обратиться в службу поддержки
export const contactSupport: IFunction = (body: MessageBody) => {
  throw new Error('Method not implemented.')
}

// Получить презентацию
export const getPresentation: IFunction = (body: MessageBody) => {
  throw new Error('Method not implemented.')
}

// Установить язык
export const setLanguage: IFunction = async (body: MessageBody, node: Node, bot: IBot, lm: LocaleManager) => {
  await lm.setUserLocale(body.userId, node.id)
  if (body.callbackQueryId)
    await bot.answerCallbackQuery(body.callbackQueryId, await lm.getText(body.userId, 'text.languageChanged'))
  if (node.parent)
    await sendSubmenu(body, node.parent, bot, lm)
}
