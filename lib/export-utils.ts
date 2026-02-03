import type { Node, Group } from "@/types/mind-map"

export function exportToOutline(nodes: Node[]): string {
  const rootNodes = nodes.filter((n) => !n.parentId)
  let outline = ""

  function buildOutline(node: Node, level = 0) {
    const indent = "  ".repeat(level)
    outline += `${indent}- ${node.text}\n`

    const children = nodes.filter((n) => n.parentId === node.id)
    children.forEach((child) => buildOutline(child, level + 1))
  }

  rootNodes.forEach((node) => buildOutline(node))
  return outline
}

export function exportToJSON(nodes: Node[], groups: Group[]): string {
  return JSON.stringify({ nodes, groups }, null, 2)
}

export function importFromJSON(json: string): { nodes: Node[]; groups: Group[] } {
  try {
    const data = JSON.parse(json)
    return {
      nodes: data.nodes || [],
      groups: data.groups || [],
    }
  } catch (error) {
    console.error("Failed to parse JSON:", error)
    return { nodes: [], groups: [] }
  }
}
