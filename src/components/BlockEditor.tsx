import React from "react"
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
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-muted-foreground">Select a block to edit</p>
      </div>
    )
  }

  const definition = registry.get(activeBlock.type)

  if (!block || !definition) {
    return (
      <div className="px-4 py-3 text-sm text-destructive">
        Unsupported block type: {activeBlock.type}
      </div>
    )
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
