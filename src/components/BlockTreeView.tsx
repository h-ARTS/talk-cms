import React from "react"
import { useSelector } from "react-redux"
import TreeItem from "@mui/lab/TreeItem"
import { RootState } from "@/store/index"
import { Block } from "@/types/index"
import {
  AddBoxOutlined as PlusSquare,
  IndeterminateCheckBoxOutlined as MinusSquare,
  DisabledByDefaultOutlined as CloseSquare,
} from "@mui/icons-material"
import { Box, Grid, Typography } from "@mui/material"
import StyledTreeItem from "./StyledTreeItem"
import { TreeView } from "@mui/lab"

interface BlockNode extends Block {
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
  } else {
    return [block.id, ...history]
  }
}

const BlockTreeView: React.FC<BlockTreeViewProps> = ({
  onBlockItemClick,
  onNavigationHistoryChange,
}) => {
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)

  const tree = buildTree(blocks, null)

  const handleItemClick = (block: Block) => {
    onBlockItemClick(block)
    const navigationHistory = buildNavigationHistory(blocks, block.id)
    onNavigationHistoryChange(navigationHistory)
  }

  function renderTree(nodes: BlockNode[]) {
    return nodes.map((node) => (
      <StyledTreeItem
        key={node.id}
        nodeId={node.id}
        label={node.type}
        onClick={() => handleItemClick(node)}
      >
        {node.children && renderTree(node.children)}
      </StyledTreeItem>
    ))
  }

  return (
    <Grid pl={4} pr={4}>
      <Box py={2}>
        <Typography variant="subtitle1">
          <strong>Block Hierarchy</strong>
        </Typography>
      </Box>
      <Box py={1}>
        <TreeView
          aria-label="customized"
          defaultExpanded={tree.map((block) => block.id)}
          defaultCollapseIcon={<MinusSquare />}
          defaultExpandIcon={<PlusSquare />}
          defaultEndIcon={<CloseSquare />}
          sx={{ height: 264, flexGrow: 1, maxWidth: 400 }}
        >
          {renderTree(tree)}
        </TreeView>
      </Box>
    </Grid>
  )
}

export default BlockTreeView
