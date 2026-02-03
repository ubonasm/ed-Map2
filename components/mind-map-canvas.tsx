"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MindMapNode } from "@/components/mind-map-node"
import { MindMapGroup } from "@/components/mind-map-group"
import { exportToOutline, exportToJSON, importFromJSON } from "@/lib/export-utils"
import { Download, Upload, Plus } from "lucide-react"
import type { Node, Group, Position } from "@/types/mind-map"

export function MindMapCanvas() {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "1",
      text: "メインアイデア",
      x: 400,
      y: 300,
      icon: "lightbulb",
      image: null,
      parentId: null,
      color: "#6366f1",
    },
  ])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
  const [viewOffset, setViewOffset] = useState<Position>({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add new node
  const addNode = (parentId: string | null = null) => {
    const parent = parentId ? nodes.find((n) => n.id === parentId) : null
    const newNode: Node = {
      id: Date.now().toString(),
      text: "新しいノード",
      x: parent ? parent.x + 200 : 100,
      y: parent ? parent.y + 100 : 100,
      icon: "circle",
      image: null,
      parentId,
      color: "#6366f1",
    }
    setNodes([...nodes, newNode])
  }

  // Update node
  const updateNode = (id: string, updates: Partial<Node>) => {
    setNodes(nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)))
  }

  // Delete node
  const deleteNode = (id: string) => {
    setNodes(nodes.filter((node) => node.id !== id && node.parentId !== id))
    setSelectedNodes(selectedNodes.filter((nodeId) => nodeId !== id))
  }

  // Handle node drag
  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click
      const node = nodes.find((n) => n.id === id)
      if (node) {
        setDraggedNode(id)
        setOffset({
          x: e.clientX - node.x * scale - viewOffset.x,
          y: e.clientY - node.y * scale - viewOffset.y,
        })
      }
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggedNode) {
        const newX = (e.clientX - offset.x - viewOffset.x) / scale
        const newY = (e.clientY - offset.y - viewOffset.y) / scale
        updateNode(draggedNode, { x: newX, y: newY })
      } else if (isPanning) {
        setViewOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      }
    },
    [draggedNode, isPanning, offset, panStart, scale, viewOffset],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
    setIsPanning(false)
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Handle canvas pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === canvasRef.current) {
      setIsPanning(true)
      setPanStart({
        x: e.clientX - viewOffset.x,
        y: e.clientY - viewOffset.y,
      })
    }
  }

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prevScale) => Math.max(0.1, Math.min(3, prevScale * delta)))
  }

  // Toggle node selection
  const toggleNodeSelection = (id: string) => {
    setSelectedNodes((prev) => (prev.includes(id) ? prev.filter((nodeId) => nodeId !== id) : [...prev, id]))
  }

  // Create group from selected nodes
  const createGroup = () => {
    if (selectedNodes.length < 2) return

    const selectedNodeObjects = nodes.filter((n) => selectedNodes.includes(n.id))
    const xs = selectedNodeObjects.map((n) => n.x)
    const ys = selectedNodeObjects.map((n) => n.y)

    const newGroup: Group = {
      id: Date.now().toString(),
      name: "新しいグループ",
      nodeIds: selectedNodes,
      x: Math.min(...xs) - 20,
      y: Math.min(...ys) - 40,
      width: Math.max(...xs) - Math.min(...xs) + 200,
      height: Math.max(...ys) - Math.min(...ys) + 100,
      color: "#6366f1",
    }

    setGroups([...groups, newGroup])
    setSelectedNodes([])
  }

  // Export functions
  const handleExportOutline = () => {
    const outline = exportToOutline(nodes)
    const blob = new Blob([outline], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mindmap-outline.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    const json = exportToJSON(nodes, groups)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mindmap.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const { nodes: importedNodes, groups: importedGroups } = importFromJSON(content)
      setNodes(importedNodes)
      setGroups(importedGroups)
    }
    reader.readAsText(file)
  }

  // Save to localStorage
  useEffect(() => {
    const data = { nodes, groups }
    localStorage.setItem("mindmap-data", JSON.stringify(data))
  }, [nodes, groups])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mindmap-data")
    if (saved) {
      const { nodes: savedNodes, groups: savedGroups } = JSON.parse(saved)
      if (savedNodes) setNodes(savedNodes)
      if (savedGroups) setGroups(savedGroups)
    }
  }, [])

  return (
    <div className="relative h-full w-full bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <Button onClick={() => addNode()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          ノード追加
        </Button>
        <Button onClick={createGroup} size="sm" variant="secondary" disabled={selectedNodes.length < 2}>
          グループ作成
        </Button>
        <Button onClick={handleExportOutline} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          TXT出力
        </Button>
        <Button onClick={handleExportJSON} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          JSON保存
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-1" />
          JSON読込
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="h-full w-full cursor-move"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Draw connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
            {nodes.map((node) => {
              if (!node.parentId) return null
              const parent = nodes.find((n) => n.id === node.parentId)
              if (!parent) return null

              return (
                <line
                  key={`line-${node.id}`}
                  x1={parent.x + 80}
                  y1={parent.y + 20}
                  x2={node.x}
                  y2={node.y + 20}
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                />
              )
            })}
          </svg>

          {/* Draw groups */}
          {groups.map((group) => (
            <MindMapGroup
              key={group.id}
              group={group}
              onUpdate={(updates) => {
                setGroups(groups.map((g) => (g.id === group.id ? { ...g, ...updates } : g)))
              }}
              onDelete={() => {
                setGroups(groups.filter((g) => g.id !== group.id))
              }}
            />
          ))}

          {/* Draw nodes */}
          {nodes.map((node) => (
            <MindMapNode
              key={node.id}
              node={node}
              isSelected={selectedNodes.includes(node.id)}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onUpdate={(updates) => updateNode(node.id, updates)}
              onDelete={() => deleteNode(node.id)}
              onAddChild={() => addNode(node.id)}
              onSelect={() => toggleNodeSelection(node.id)}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-card text-card-foreground p-4 rounded-lg shadow-lg text-sm space-y-1">
        <p>
          <strong>操作方法:</strong>
        </p>
        <p>• ノードをドラッグで移動</p>
        <p>• キャンバスをドラッグでパン</p>
        <p>• マウスホイールでズーム</p>
        <p>• ノードをクリックで選択</p>
        <p>• 複数選択してグループ化</p>
      </div>
    </div>
  )
}
