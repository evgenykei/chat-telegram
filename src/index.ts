import IBot from './bot/IBot'
import NodeTelegramBot from './bot/NodeTelegramBot'
import menuObject from './menu/menuObject'

const bot: IBot = new NodeTelegramBot('754686262:AAF2MvPUmaZsOOM2okJVnp6RqKpECSMmslU'),
      menu = menuObject.includeChildrenMapping()

bot.onText(/\/inlineKeyboard/i).subscribe(result => {
  if (menuObject.children) bot.sendMenu(result.chatId, menuObject.children.map(it => it.toSimpleObject()))
})

bot.onMenuClick().subscribe(result => {
  try {
    const node = menu[result.menuId]
    if (node.children) bot.editMenu(result.chatId, result.messageId, node.children.map(it => it.toSimpleObject()))
    if (node.action) node.action()
  } catch (err) {
    console.error(err)
  }
})
