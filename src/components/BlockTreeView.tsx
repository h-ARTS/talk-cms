import React from "react"
import { useSelector } from "react-redux"
import TreeView from "@mui/lab/TreeView"
import TreeItem from "@mui/lab/TreeItem"
import { RootState } from "@/store/index"
import { Block, BlockType } from "@/types/index"
import {
  AddBoxOutlined as PlusSquare,
  IndeterminateCheckBoxOutlined as MinusSquare,
  DisabledByDefaultOutlined as CloseSquare,
} from "@mui/icons-material"
import { Box, Grid, Typography } from "@mui/material"

interface TreeNode {
  id: string
  type: BlockType
  parentId: string | null
  content: { [key: string]: any }
  children: TreeNode[]
}

function renderTree(nodes: TreeNode[]) {
  return nodes.map((node) => (
    <TreeItem key={node.id} nodeId={node.id} label={node.type}>
      {node.children && renderTree(node.children)}
    </TreeItem>
  ))
}

function buildTree(blocks: Block[], parentId: string | null): TreeNode[] {
  const children = blocks
    .filter((block) => block.parentId === parentId)
    .map((block) => ({
      ...block,
      children: buildTree(blocks, block.id),
    }))

  return children
}

const BlockTreeView = () => {
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)

  const tree = buildTree(blocks, null)

  return (
    <Grid>
      <Box py={1} pl={2}>
        <Typography variant="subtitle1">Block Hierarchy</Typography>
      </Box>
      <Box pl={2} py={1} pr={4}>
        <TreeView
          aria-label="customized"
          defaultExpanded={tree.map((block) => block.id)}
          defaultCollapseIcon={<MinusSquare />}
          defaultExpandIcon={<PlusSquare />}
          defaultEndIcon={<CloseSquare />}
          sx={{ height: 264, flexGrow: 1, maxWidth: 400, overflowY: "auto" }}
        >
          {renderTree(tree)}
        </TreeView>
      </Box>
    </Grid>
  )
}

export default BlockTreeView
