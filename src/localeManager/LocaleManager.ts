import * as fs from 'fs'
import * as path from 'path'

import * as _ from 'lodash'

import MenuBody from '../bot/MenuBody'
import Node from '../menu/Node'
import Locale from './Locale'

class LocaleManager {
  public readonly locales: {[key: string]: Locale}
  private db: IDatabase

  constructor(localePath: string, db: IDatabase) {
    this.locales = {}
    fs.readdirSync(localePath).forEach(file => {
      const locale = JSON.parse(fs.readFileSync(path.join(localePath, file), { encoding: 'utf8' }))
      this.locales[locale.name] = locale
    })
    this.db = db

    if (_.size(this.locales) === 0) throw new Error('No languages found')
  }

  public getDefaultLocale(): string {
    return _.keys(this.locales)[0]
  }

  public async getText(userId: number, element: string): Promise<string> {
    const locale = this.locales[await this.resolveUserLocale(userId)],
          text = locale.elements[element]
    return text ? text : element
  }

  public async setUserLocale(userId: number, localeName: string): Promise<boolean> {
    if (!this.locales[localeName]) throw new Error('Local does not exist')
    if (await this.db.getLocale(userId) === localeName) return false
    await this.db.setLocale(userId, localeName)
    return true
  }

  public async wrapNode(userId: number, node: Node): Promise<MenuBody> {
    return new MenuBody(await this.getText(userId, node.title), node.id)
  }

  private async resolveUserLocale(userId: number): Promise<string> {
    let localeName = await this.db.getLocale(userId)

    if (!localeName || !this.locales[localeName]) {
      localeName = this.getDefaultLocale()
      await this.setUserLocale(userId, localeName)
    }

    return localeName
  }

}

export default LocaleManager
