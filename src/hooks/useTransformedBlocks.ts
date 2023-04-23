import { useSelector } from "react-redux"
import { RootState } from "@/store/index"
import { Block } from "@/types/index"

const useTransformedBlocks = (): Block[] => {
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)

  const transformBlocks = (
    blocks: Block[],
    parentId: string | null
  ): Block[] => {
    return blocks
      .filter((block) => block.parentId === parentId)
      .map((block) => {
        return {
          ...block,
          children: transformBlocks(blocks, block.id),
        }
      })
  }

  return transformBlocks(blocks, null)
}

export default useTransformedBlocks
