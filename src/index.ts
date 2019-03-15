import * as path from 'path'

import { config } from 'node-config-ts'

import IBot from './bot/IBot'
import NodeTelegramBot from './bot/NodeTelegramBot'
import { createMenu } from './menu'
import { createDb } from './persistence/LowDb'
import Access from './services/auth/Access'
import AuthService from './services/auth/AuthService'
import LocaleService from './services/locale/LocaleService'

async function initialize() {
  // Initialize directories
  config.directories.db = path.join(__dirname, '..', config.directories.db)
  config.directories.locale = path.join(__dirname, '..', config.directories.locale)

  // Initialize modules and classes
  const db: IDatabase = await createDb(config.directories.db),
        localeService = new LocaleService(config.directories.locale, config.general.defaultLocale, db),
        authService = new AuthService(db, localeService),
        bot: IBot = new NodeTelegramBot(config.telegram.apiKey, localeService, authService),
        menu = createMenu(localeService),
        menuMapping = menu.includeChildrenMapping()

  // Configure bot
  if (!menu.children) throw new Error('Menu is empty')

  bot.onText(/\/start/i, Access.any).subscribe(async body => {
    try {
      // check API for chatId
      if (false) await bot.sendText(body.chatId, 'text.forbidden')
      else {
        await authService.register(body.chatId)
        await bot.sendText(body.chatId, 'text.welcome')
      }
    } catch (err) {
      console.error(err)
    }
  })

  bot.onText(/\/menu/i, Access.auth).subscribe(async body => {
    try {
      await bot.createMenu(body.chatId, 'text.menu', menu.children!)
    } catch (err) {
      console.error(err)
    }
  })

  bot.onMenuClick(Access.auth).subscribe(async body => {
    try {
      if (!body.menuId) return
      const node = menuMapping[body.menuId]
      if (node.action) node.action(body, node, bot, localeService)
    } catch (err) {
      console.error(err)
    }
  })

  console.log('Bot started')
}

initialize()
