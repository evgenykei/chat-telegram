class Locale {
  public readonly name: string
  public readonly iso: string
  public readonly title: string
  public readonly elements: {[key: string]: string}

  constructor(name: string, iso: string, title: string, elements: {[key: string]: string}) {
    this.name = name
    this.iso = iso
    this.title = title
    this.elements = elements
  }
}

export default Locale
