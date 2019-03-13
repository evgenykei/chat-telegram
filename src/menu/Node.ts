import IFunction from '../functions/IFunction'

class Node {
  public readonly id: string
  public readonly title: string
  public readonly className?: string
  public readonly action?: IFunction
  public readonly children?: Node[]

  private PARENT?: Node

  public get parent() {
    return this.PARENT
  }

  constructor(id: string, title: string, className?: string, action?: IFunction, children?: Node[]) {
    this.id = id
    this.title = title
    this.className = className
    this.action = action
    this.children = children

    if (children) children.forEach(child => {
      child.PARENT = this
      if (child.children) child.children.unshift(new Node(this.id, 'button.back'))
    })
  }

  public includeChildrenMapping(): {[key: string]: Node} {
    const nodes: Node[] = [],
          search: Node[] = [],
          result: {[key: string]: Node} = {}
    let current: Node | undefined = this
    do {
      nodes.push(current)
      if (current.children) search.push(...current.children)
      current = search.pop()
    } while (current)

    nodes.forEach(node => {
      if (!result[node.id]) result[node.id] = node
    })
    return result
  }
}

export default Node
