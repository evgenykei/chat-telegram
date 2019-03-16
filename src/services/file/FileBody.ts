import { Stream } from 'stream'

export default class FileBody {
  public readonly filename: string
  public readonly contentType: string
  public readonly stream: Stream

  constructor(filename: string, contentType: string, stream: Stream) {
    this.filename = filename
    this.contentType = contentType
    this.stream = stream
  }
}
