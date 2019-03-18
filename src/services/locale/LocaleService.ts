import * as fs from 'fs'
import * as path from 'path'

import * as _ from 'lodash'
import { config } from 'node-config-ts'

import Node from '../../menu/Node'
import Locale from './Locale'

class LocaleService {
  public readonly locales: {[key: string]: Locale}
  public readonly defaultLocale: string
  private db: IDatabase

  constructor(localePath: string, defaultLocale: string, db: IDatabase) {
    this.locales = {}
    fs.readdirSync(localePath).forEach(file => {
      const locale = JSON.parse(fs.readFileSync(path.join(localePath, file), { encoding: 'utf8' }))
      this.locales[locale.name] = locale
    })
    this.db = db
    this.defaultLocale = defaultLocale

    if (_.size(this.locales) === 0) throw new Error('No languages found')
    if (!this.locales[defaultLocale]) throw new Error('Default locale not found')
  }

  public async localizeText(chatId: number, textId: string): Promise<string> {
    const locale = this.locales[await this.getChatLocaleName(chatId) || this.defaultLocale],
          text = locale.elements[textId]
    return text ? text : textId
  }

  public localizeNodes(chatId: number, nodes: Node[]): Promise<ILocalizedNode[]> {
    const promises = nodes.map(async node => ({
      menuId: node.id,
      title: await this.localizeText(chatId, node.title),
    }))
    return Promise.all(promises)
  }

  public async getChatLocaleName(chatId: number): Promise<string | undefined> {
    const chat = await this.db.chatRead(chatId)
    if (!chat) return
    let localeName = chat.localeName

    if (!this.locales[localeName]) {
      localeName = this.defaultLocale
      await this.setChatLocale(chatId, localeName)
    }

    return localeName
  }

  public async getChatLocale(chatId: number): Promise<Locale | undefined> {
    const localeName = await this.getChatLocaleName(chatId)
    return localeName ? this.locales[localeName] : undefined
  }

  public async setChatLocale(chatId: number, localeName: string): Promise<boolean> {
    const locale = this.locales[localeName].name || this.defaultLocale

    const chat = await this.db.chatRead(chatId)
    if (!chat) throw new Error('Chat not found')
    if (chat.localeName === localeName) return false

    await this.db.chatUpdate(chatId, localeName)
    return true
  }

}

export default LocaleService
