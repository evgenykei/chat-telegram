import LocaleService from '../locale/LocaleService'
import Access from './Access'

class AuthService {
  private db: IDatabase
  private localService: LocaleService

  constructor(db: IDatabase, localeService: LocaleService) {
    this.db = db
    this.localService = localeService
  }

  public async isAuthenticated(chatId: number, access: Access): Promise<boolean> {
    if (access === Access.any) return true

    const chatExists = await this.db.chatRead(chatId) !== undefined
    if (access === Access.auth) return chatExists
    if (access === Access.nonauth) return !chatExists
    else throw new Error('Access type is not defined')
  }

  public async register(chatId: number): Promise<void> {
    if (await this.db.chatRead(chatId)) return
    return this.db.chatCreate({
      chatId,
      localeName: this.localService.defaultLocale,
    })
  }
}

export default AuthService
