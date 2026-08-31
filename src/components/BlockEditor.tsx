import React from "react"
import { Box, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/index"
import { setBlockContent } from "@/store/pageBuilderSlice"
import GenericBlockEditor from "@/blocks/core/editor/GenericBlockEditor"
import { useBlockRegistry } from "@/blocks/client/block-registry-context"

const BlockEditor: React.FC = () => {
  const dispatch = useDispatch()
  const { registry } = useBlockRegistry()
  const activeBlock = useSelector(
    (state: RootState) => state.pageBuilder.activeBlock
  )
  const block = useSelector((state: RootState) =>
    state.pageBuilder.blocks.find((block) => block.id === activeBlock?.id)
  )

  if (!activeBlock) {
    return (
      <Box sx={{ px: 3, my: 2 }}>
        <Typography variant="subtitle2">Select a block to edit</Typography>
      </Box>
    )
  }

  const definition = registry.get(activeBlock.type)

  if (!block || !definition) {
    return <div>Unsupported block type: {activeBlock.type}</div>
  }

  return (
    <GenericBlockEditor
      definition={definition}
      content={block.content}
      onChange={(content) =>
        dispatch(setBlockContent({ id: activeBlock.id, content }))
      }
    />
  )
}

export default BlockEditor
