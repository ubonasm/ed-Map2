export interface Position {
  x: number
  y: number
}

export interface Node {
  id: string
  text: string
  x: number
  y: number
  icon: string
  image: string | null
  parentId: string | null
  color: string
}

export interface Group {
  id: string
  name: string
  nodeIds: string[]
  x: number
  y: number
  width: number
  height: number
  color: string
}
