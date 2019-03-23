interface IClassifierAPI {
  getClassName(text: string): Promise<string>
}
