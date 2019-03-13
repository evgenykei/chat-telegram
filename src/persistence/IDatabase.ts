interface IDatabase {
  getLocale(userId: number): Promise<string | undefined>
  setLocale(userId: number, localeName: string): Promise<void>
}
