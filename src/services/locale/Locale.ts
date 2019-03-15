class Locale {
  public readonly name: string
  public readonly title: string
  public readonly elements: {[key: string]: string}

  constructor(name: string, title: string, elements: {[key: string]: string}) {
    this.name = name
    this.title = title
    this.elements = elements
  }
}

export default Locale
