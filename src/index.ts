import * as path from 'path'

import * as fs from 'fs-extra'
import { config } from 'node-config-ts'

import IBot from './bot/IBot'
import NodeTelegramBot from './bot/NodeTelegramBot'
import LocaleManager from './localeManager/LocaleManager'
import { createMenu } from './menu'
import { createDb } from './persistence/LowDb'

async function initialize() {
  // Initialize directories
  config.directories.db = path.join(__dirname, '..', config.directories.db)
  config.directories.locale = path.join(__dirname, '..', config.directories.locale)

  // Initialize modules and classes
  const db: IDatabase = await createDb(config.directories.db),
        localeManager = new LocaleManager(config.directories.locale, db),
        bot: IBot = new NodeTelegramBot(config.telegram.apiKey),
        menu = createMenu(localeManager),
        menuMapping = menu.includeChildrenMapping()

  // Configure bot
  if (!menu.children) throw new Error('Menu is empty')
  bot.onText(/\/inlineKeyboard/i).subscribe(async result => {
    try {
      const menuBodies = await Promise.all(menu.children!.map(child => localeManager.wrapNode(result.userId, child)))
      if (menu.children) bot.sendMenu(result.chatId, menuBodies)
    } catch (err) {
      console.error(err)
    }
  })

  bot.onMenuClick().subscribe(result => {
    try {
      if (!result.menuId) return
      const node = menuMapping[result.menuId]
      if (node.action) node.action(result, node, bot, localeManager)
    } catch (err) {
      console.error(err)
    }
  })

  console.log('Bot started')
}

initialize()
