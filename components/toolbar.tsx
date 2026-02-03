"use client"

import { Button } from "@/components/ui/button"
import { Download, Upload, Plus, ZoomIn, ZoomOut } from "lucide-react"

interface ToolbarProps {
  onAddNode: () => void
  onExportOutline: () => void
  onExportJSON: () => void
  onImportJSON: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export function Toolbar({ onAddNode, onExportOutline, onExportJSON, onImportJSON, onZoomIn, onZoomOut }: ToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2 bg-card p-2 rounded-lg shadow-lg">
      <Button onClick={onAddNode} size="sm" variant="outline">
        <Plus className="h-4 w-4 mr-1" />
        ノード追加
      </Button>
      <Button onClick={onExportOutline} size="sm" variant="outline">
        <Download className="h-4 w-4 mr-1" />
        TXT出力
      </Button>
      <Button onClick={onExportJSON} size="sm" variant="outline">
        <Download className="h-4 w-4 mr-1" />
        JSON保存
      </Button>
      <Button onClick={onImportJSON} size="sm" variant="outline">
        <Upload className="h-4 w-4 mr-1" />
        JSON読込
      </Button>
      <div className="border-l border-border" />
      <Button onClick={onZoomIn} size="sm" variant="outline">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button onClick={onZoomOut} size="sm" variant="outline">
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
