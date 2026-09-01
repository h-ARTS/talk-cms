import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/store/index"
import { Block } from "@/types/index"
import { BlocksIcon } from "lucide-react"

import { TreeView, type TreeNode } from "@/ui/tree-view"

type BlockNode = Block & {
  children: BlockNode[]
}

interface BlockTreeViewProps {
  onBlockItemClick: (block: Block) => void
  onNavigationHistoryChange: (history: string[]) => void
}

function buildTree(blocks: Block[], parentId: string | null): BlockNode[] {
  const children = blocks
    .filter((block) => block.parentId === parentId)
    .map((block) => ({
      ...block,
      children: buildTree(blocks, block.id),
    }))

  return children as BlockNode[]
}

function toTreeNodes(nodes: BlockNode[]): TreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    label: node.type,
    icon: <BlocksIcon />,
    children: node.children.length > 0 ? toTreeNodes(node.children) : undefined,
  }))
}

function buildNavigationHistory(
  blocks: Block[],
  targetBlockId: string,
  history: string[] = []
): string[] {
  const block = blocks.find((block) => block.id === targetBlockId)
  if (!block) return history

  if (block.parentId) {
    history.unshift(block.id)
    return buildNavigationHistory(blocks, block.parentId, history)
  }
  return [block.id, ...history]
}

const BlockTreeView: React.FC<BlockTreeViewProps> = ({
  onBlockItemClick,
  onNavigationHistoryChange,
}) => {
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)
  const activeBlock = useSelector((state: RootState) => state.pageBuilder.activeBlock)

  const tree = buildTree(blocks, null)
  const nodes = toTreeNodes(tree)

  const handleSelect = (node: TreeNode) => {
    const block = blocks.find((b) => b.id === node.id)
    if (!block) return
    onBlockItemClick(block)
    onNavigationHistoryChange(buildNavigationHistory(blocks, block.id))
  }

  return (
    <div className="px-3 py-4">
      <p className="mb-3 px-1 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Block hierarchy
      </p>
      {nodes.length === 0 ? (
        <p className="px-1 text-sm text-muted-foreground">No blocks yet.</p>
      ) : (
        <TreeView
          nodes={nodes}
          selectedId={activeBlock?.id ?? null}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}

export default BlockTreeView
