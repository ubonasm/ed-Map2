"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Lightbulb, Circle, Star, Square, Triangle, ImageIcon, Plus, Trash2, Palette } from "lucide-react"
import type { Node } from "@/types/mind-map"

const icons = {
  lightbulb: Lightbulb,
  circle: Circle,
  star: Star,
  square: Square,
  triangle: Triangle,
}

interface MindMapNodeProps {
  node: Node
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onUpdate: (updates: Partial<Node>) => void
  onDelete: () => void
  onAddChild: () => void
  onSelect: () => void
}

export function MindMapNode({
  node,
  isSelected,
  onMouseDown,
  onUpdate,
  onDelete,
  onAddChild,
  onSelect,
}: MindMapNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const Icon = icons[node.icon as keyof typeof icons] || Circle

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpdate({ image: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]

  return (
    <Card
      className={`absolute cursor-move transition-all ${isSelected ? "ring-2 ring-primary shadow-lg" : ""}`}
      style={{
        left: node.x,
        top: node.y,
        width: 160,
        borderLeft: `4px solid ${node.color}`,
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.stopPropagation()
          onSelect()
        }
      }}
    >
      <div className="p-3 space-y-2">
        {/* Header with icon */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Icon className="h-4 w-4" style={{ color: node.color }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(icons).map((iconName) => {
                const IconComponent = icons[iconName as keyof typeof icons]
                return (
                  <DropdownMenuItem key={iconName} onClick={() => onUpdate({ icon: iconName })}>
                    <IconComponent className="h-4 w-4 mr-2" />
                    {iconName}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {colors.map((color) => (
                <DropdownMenuItem key={color} onClick={() => onUpdate({ color })}>
                  <div className="h-4 w-4 rounded mr-2" style={{ backgroundColor: color }} />
                  {color}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onAddChild()
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Text content */}
        {isEditing ? (
          <Input
            value={node.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditing(false)
            }}
            className="h-7 text-sm"
            autoFocus
          />
        ) : (
          <p className="text-sm cursor-text min-h-[28px] break-words" onDoubleClick={() => setIsEditing(true)}>
            {node.text}
          </p>
        )}

        {/* Image */}
        {node.image ? (
          <div className="relative">
            <img src={node.image || "/placeholder.svg"} alt="Node image" className="w-full h-20 object-cover rounded" />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1 h-6 w-6 p-0"
              onClick={() => onUpdate({ image: null })}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <div className="flex items-center justify-center h-8 border-2 border-dashed border-border rounded hover:bg-muted transition-colors">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>
    </Card>
  )
}
