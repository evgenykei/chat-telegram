interface IDatabase {
  getLocale(userId: number): string | undefined
  setLocale(userId: number, localeName: string): Promise<void>
}
