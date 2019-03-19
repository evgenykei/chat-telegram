// tslint:disable: variable-name
class KeyboardBody {
  public readonly text: string
  public readonly callback_data: string

  constructor(text: string, callback_data: string) {
    this.text = text
    this.callback_data = callback_data
  }
}
