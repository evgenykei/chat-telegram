import * as path from 'path'

import * as bluebird from 'bluebird'
import IBot from './bot/IBot'
import MenuBody from './bot/MenuBody'
import NodeTelegramBot from './bot/NodeTelegramBot'
import LocaleManager from './localeManager/LocaleManager'
import { createMenu } from './menu'
import { createDb } from './persistence/LowDb'

async function initialize() {

  const db: IDatabase = await createDb(path.join(__dirname, '..', 'db', 'db.json')),
        localeManager = new LocaleManager(path.join(__dirname, '..', 'locale'), db),
        bot: IBot = new NodeTelegramBot('754686262:AAF2MvPUmaZsOOM2okJVnp6RqKpECSMmslU'),
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
