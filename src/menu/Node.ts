class Node {
  public readonly id: string
  public readonly title: string
  public readonly className?: string
  public readonly action?: (args?: any[]) => void
  public readonly children?: Node[]

  constructor(id: string, title: string, className?: string, action?: (args?: any[]) => void, children?: Node[]) {
    this.id = id
    this.title = title
    this.className = className
    this.action = action
    this.children = children

    if (children) children.forEach(child => {
      if (child.children) child.children.unshift(new Node(this.id, 'Back'))
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

  public toSimpleObject(): {title: string, menuId: string} {
    return {
      menuId: this.id,
      title: this.title,
    }
  }
}

export default Node
