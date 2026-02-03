"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Group } from "@/types/mind-map"

interface MindMapGroupProps {
  group: Group
  onUpdate: (updates: Partial<Group>) => void
  onDelete: () => void
}

export function MindMapGroup({ group, onUpdate, onDelete }: MindMapGroupProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div
      className="absolute border-2 border-dashed rounded-lg pointer-events-none"
      style={{
        left: group.x,
        top: group.y,
        width: group.width,
        height: group.height,
        borderColor: group.color + "80",
        backgroundColor: group.color + "10",
      }}
    >
      <div className="absolute -top-8 left-0 flex items-center gap-2 pointer-events-auto">
        {isEditing ? (
          <Input
            value={group.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditing(false)
            }}
            className="h-7 w-40 text-sm"
            autoFocus
          />
        ) : (
          <div
            className="px-2 py-1 bg-card rounded text-sm font-medium cursor-text"
            style={{ color: group.color }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {group.name}
          </div>
        )}
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
