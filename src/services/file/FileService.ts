import * as bluebird from 'bluebird'
import * as fs from 'fs-extra'
import * as md5File from 'md5-file'
import * as typeLookup from 'mime-types'
import * as path from 'path'
import { Stream } from 'stream'

import FileBody from './FileBody'

const md5Async = bluebird.promisify(md5File)

export default class FileService {
  private filesPath: string
  private db: IDatabase

  constructor(filesPath: string, db: IDatabase) {
    this.filesPath = filesPath
    this.db = db
  }

  public async getFile(fileName: string): Promise<string | FileBody> {
    const filePath = path.join(this.filesPath, fileName)
    if (!await fs.pathExists(filePath)) throw new Error(`File not found: ${filePath}`)

    const hash = await md5Async(filePath)
    const record = await this.db.fileRead(hash)

    if (record) return record.fileId
    else return new FileBody(
      fileName,
      typeLookup.lookup(fileName) || 'application/octet-stream',
      fs.createReadStream(filePath),
    )
  }

  public async cacheFile(fileName: string, fileId: string): Promise<void> {
    const filePath = path.join(this.filesPath, fileName)
    if (!await fs.pathExists(filePath)) throw new Error('File not found')

    const hash = await md5Async(filePath)
    const record = await this.db.fileRead(hash)

    if (record) await this.db.fileUpdate(hash, fileId)
    else await this.db.fileCreate({ hash, fileId })
  }
}
