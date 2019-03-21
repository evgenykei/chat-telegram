import * as path from 'path'

import { config } from 'node-config-ts'

import IBot from './bot/IBot'
import NodeTelegramBot from './bot/NodeTelegramBot'
import { createMenu } from './menu'
import { createDb } from './persistence/LowDb'
import Access from './services/auth/Access'
import AuthService from './services/auth/AuthService'
import FileService from './services/file/FileService'
import LocaleService from './services/locale/LocaleService'

async function initialize() {
  // Initialize directories
  config.directories.db = path.join(__dirname, '..', config.directories.db)
  config.directories.locale = path.join(__dirname, '..', config.directories.locale)
  config.directories.files = path.join(__dirname, '..', config.directories.files)

  // Initialize modules and classes
  const db: IDatabase = await createDb(config.directories.db),
        fileService = new FileService(config.directories.files, db),
        localeService = new LocaleService(config.directories.locale, config.general.defaultLocale, db),
        authService = new AuthService(db, localeService),
        bot: IBot = new NodeTelegramBot(config.telegram.apiKey, localeService, authService, fileService),
        menu = createMenu(localeService),
        menuMapping = menu.includeChildrenMapping()

  // Configure bot
  if (!menu.children) throw new Error('Menu is empty')

  bot.onText(/\/start/i, Access.any).subscribe(async messageBody => {
    try {
      // TODO check API for chatId
      if (false) await bot.sendText(messageBody.chatId, 'text.forbidden')
      else {
        await authService.register(messageBody.chatId)
        await bot.sendText(messageBody.chatId, 'text.welcome')
        await bot.createMenu(messageBody.chatId, menu.children!, 'text.menu')
      }
    } catch (err) {
      console.error(err)
    }
  })

  bot.onText(/\/menu/i, Access.auth).subscribe(async messageBody => {
    try {
      await bot.createMenu(messageBody.chatId, menu.children!, 'text.menu')
    } catch (err) {
      console.error(err)
    }
  })

  bot.onMenuClick(Access.auth).subscribe(async messageBody => {
    try {
      if (!messageBody.callbackData) return
      const [menuId, argsString] = messageBody.callbackData.split('.')
      const node = menuMapping[menuId]
      if (node && node.action) node.action({
        bot,
        localeService,
        messageBody,
        node,
        args: argsString ? argsString.split(';') : undefined,
      })
    } catch (err) {
      console.error(err)
    }
  })

  console.log('Bot started')
}

initialize()
