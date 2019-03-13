import {  PartialDeep } from 'lodash'
import * as low from 'lowdb'
import * as FileAsync from 'lowdb/adapters/FileAsync'

class LowDb implements IDatabase {
  private adapter: low.AdapterAsync
  private db!: low.LowdbAsync<IMainSchema>

  constructor(dbPath: string) {
    this.adapter = new FileAsync(dbPath)
  }

  public async initialize() {
    if (this.db) return
    this.db = await low(this.adapter)
    await this.db.defaults<IMainSchema>({ locales: [] }).write()
  }

  public async getLocale(userId: number): Promise<string | undefined> {
    const locale = await this.get<ILocaleSchema>('locales', { userId })
    return locale ? locale.localeName : undefined
  }

  public setLocale(userId: number, localeName: string): Promise<void> {
    return this.set<ILocaleSchema>('locales', { userId }, { userId, localeName })
  }

  private async get<T>(tableName: string, predicate: PartialDeep<T>): Promise<T | undefined> {
    return await this.db.get(tableName).find<T>(predicate).value()
  }

  private async set<T>(tableName: string, predicate: PartialDeep<T>, obj: T): Promise<void> {
    if (this.db.get(tableName).find(predicate).value() !== undefined)
      return this.db.get(tableName).find(predicate).assign(obj).write()
    else
      return this.db.get(tableName).push(obj).write()
  }
}

export async function createDb(dbPath: string): Promise<LowDb> {
  const db = new LowDb(dbPath)
  await db.initialize()
  return db
}
