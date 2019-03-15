import * as path from 'path'

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
    await this.db.defaults<IMainSchema>({
      chats: [],
    }).write()
  }

  // Public methods

  public chatCreate(chat: IChatSchema): Promise<void> {
    return this.create<IChatSchema>('chats', chat)
  }

  public chatRead(chatId: number): Promise<IChatSchema | undefined> {
    return this.read<IChatSchema>('chats', { chatId })
  }

  public chatUpdate(chatId: number, localeName: string): Promise<void> {
    return this.update<IChatSchema>('chats', { chatId }, { chatId, localeName })
  }

  public chatDelete(chatId: number): Promise<void> {
    return this.delete<IChatSchema>('chats', { chatId })
  }

  // Private methods
  private async create<T>(tableName: string, obj: T): Promise<void> {
    await this.db.get(tableName).push(obj).write()
  }

  private async read<T>(tableName: string, predicate: PartialDeep<T>): Promise<T | undefined> {
    return await this.db.get(tableName).find<T>(predicate).value()
  }

  private async update<T>(tableName: string, predicate: PartialDeep<T>, obj: T): Promise<void> {
    await this.db.get(tableName).find(predicate).assign(obj).write()
  }

  private async delete<T>(tableName: string, predicate: PartialDeep<T>): Promise<void> {
    await this.db.get(tableName).remove(predicate).write()
  }
}

export async function createDb(dbPath: string): Promise<LowDb> {
  const db = new LowDb(path.join(dbPath, 'db.json'))
  await db.initialize()
  return db
}
