import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store/index"
import { addBlock, deleteBlock, moveBlock } from "@/store/pageBuilderSlice"
import { useBlockRegistry } from "@/blocks/client/block-registry-context"
import DraggableListItem from "../draggable/DraggableListItem"
import BlockEditor from "../BlockEditor"

import { Button } from "@/ui/button"
import { Separator } from "@/ui/separator"

interface BlockTreeProps {
  parentId: string | null
  onAddBlock?: (type: string, parentId: string | null) => void
  onDeleteBlock?: (parentId: string | null) => void
  onNavigate: (id: string) => void
}

const BlockTree: React.FC<BlockTreeProps> = ({ parentId, onNavigate }) => {
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)
  const dispatch = useDispatch()
  const { registry, loading } = useBlockRegistry()

  const childBlocks = blocks.filter((block) => block.parentId === parentId)
  const parentBlock = blocks.find((block) => block.id === parentId)
  const availableDefinitions =
    parentId === null
      ? registry.getAllowedDefinitions()
      : parentBlock
        ? registry.getAllowedDefinitions(parentBlock.type)
        : []

  const handleAddBlock = (type: string, parentId: string | null) => {
    const parent = blocks.find((block) => block.id === parentId)
    if (
      parentId !== null &&
      (!parent || !registry.allowsChild(parent.type, type))
    ) {
      return
    }

    const newBlock = registry.createBlock(
      type,
      parentId,
      crypto.randomUUID()
    )
    dispatch(addBlock({ parent: parentId, block: newBlock }))
  }

  const handleDeleteBlock = (blockId: string) => {
    dispatch(deleteBlock(blockId))
  }

  const handleMoveBlock = (draggedId: string, hoverIndex: number) => {
    dispatch(moveBlock({ draggedId, hoverIndex }))
  }

  return (
    <div className="flex flex-col">
      <BlockEditor />
      <Separator />
      <div className="px-2 py-2">
        <p className="px-2 pb-1.5 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Children
        </p>
        <div className="flex flex-col gap-0.5">
          {childBlocks.map((block, idx) => (
            <DraggableListItem
              key={block.id}
              id={block.id}
              index={idx}
              type={block.type}
              moveCard={handleMoveBlock}
              onClick={() => onNavigate(block.id)}
              onDelete={() => handleDeleteBlock(block.id)}
            />
          ))}
          {childBlocks.length === 0 && (
            <p className="px-2 py-2 text-sm text-muted-foreground">No blocks here yet.</p>
          )}
        </div>
      </div>
      <Separator />
      <div className="px-4 py-3">
        <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Add block
        </p>
        <div className="flex flex-wrap gap-1.5">
          {availableDefinitions.map((definition) => (
            <Button
              key={definition.name}
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => handleAddBlock(definition.name, parentId)}
            >
              {definition.metadata.label}
            </Button>
          ))}
        </div>
        {!loading && availableDefinitions.length === 0 && (
          <p className="mb-1 text-sm text-muted-foreground">
            No block definitions are available. Create one from Block definitions.
          </p>
        )}
      </div>
    </div>
  )
}

export default BlockTree
