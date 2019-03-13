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

  public getLocale(userId: number): string | undefined {
    const locale = this.get<ILocaleSchema>('locales', { userId })
    return locale ? locale.localeName : undefined
  }

  public setLocale(userId: number, localeName: string): Promise<void> {
    return this.set<ILocaleSchema>('locales', { userId }, { userId, localeName })
  }

  private get<T>(tableName: string, predicate: PartialDeep<T>): T | undefined {
    return this.db.get(tableName).find(predicate).value()
  }

  private async set<T>(tableName: string, predicate: PartialDeep<T>, obj: T): Promise<void> {
    const table = this.db.get(tableName)
    const record = table.find(predicate)
    await record.value() ? await record.assign(obj).write() : table.push(obj).write()
  }
}

export async function createDb(dbPath: string): Promise<LowDb> {
  const db = new LowDb(dbPath)
  await db.initialize()
  return db
}
