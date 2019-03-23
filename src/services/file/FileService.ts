import * as bluebird from 'bluebird'
import * as fs from 'fs-extra'
import * as md5File from 'md5-file'
import * as typeLookup from 'mime-types'
import * as path from 'path'
import { Stream } from 'stream'

import FileBody from './FileBody'

const md5Async = bluebird.promisify(md5File)

export enum FileSource {
  files, upload,
}

export class FileService {
  private sources: string[]
  private db: IDatabase

  constructor(filesPath: string, uploadPath: string, db: IDatabase) {
    this.sources = []
    this.sources[FileSource.files] = filesPath
    this.sources[FileSource.upload] = uploadPath
    this.db = db
  }

  public async getFile(fileName: string, source: FileSource): Promise<string | FileBody> {
    const filePath = path.join(this.sources[source], fileName)
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

  public async cacheFile(fileName: string, source: FileSource, fileId: string): Promise<void> {
    const filePath = path.join(this.sources[source], fileName)
    if (!await fs.pathExists(filePath)) throw new Error('File not found')

    const hash = await md5Async(filePath)
    const record = await this.db.fileRead(hash)

    if (record) await this.db.fileUpdate(hash, fileId)
    else await this.db.fileCreate({ hash, fileId })
  }

  public async saveUpload(stream: Stream, fileId: string, mime?: string, fileName?: string): Promise<string> {
    const extension = mime ? typeLookup.extension(mime) : undefined
    if (!fileName) fileName = new Date().getTime().toString() + extension ? `.${extension}` : ''
    const filePath = path.join(this.sources[FileSource.upload], fileName)

    await new Promise((resolve, reject) => {
      const write = fs
        .createWriteStream(filePath)
        .on('finish', resolve)
        .on('error', reject)
      stream.pipe(write)
    })

    await this.cacheFile(fileName, FileSource.upload, fileId)
    return fileName
  }
}
