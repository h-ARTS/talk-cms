import React from "react"
// Mui
import { Box, Typography } from "@mui/material"
// Components
import Headline from "./blockComponents/Headline"
import Card from "./blockComponents/Card"
import Grid from "./blockComponents/Grid"
import Teaser from "./blockComponents/Teaser"
// Redux
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/src/store"
import { setBlockContent } from "@/src/store/pageBuilderSlice"

const BlockEditor: React.FC = () => {
  const dispatch = useDispatch()
  const activeBlock = useSelector(
    (state: RootState) => state.pageBuilder.activeBlock
  )
  const block = useSelector((state: RootState) =>
    state.pageBuilder.blocks.find((block) => block.id === activeBlock?.id)
  )

  if (!activeBlock) {
    return (
      <Box px={3} my={2}>
        <Typography variant="subtitle2">Select a block to edit</Typography>
      </Box>
    )
  }

  const handleBlockInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    const newContent = {
      ...block?.content,
      [name]: value,
    }
    dispatch(setBlockContent({ id: activeBlock.id, content: newContent }))
  }

  const blockComponentMap: Record<string, JSX.Element> = {
    headline: (
      <Headline
        onInputChange={handleBlockInputChange}
        values={block?.content}
      />
    ),
    card: <Card />,
    grid: <Grid />,
    teaser: <Teaser />,
  }

  return (
    <div>
      {blockComponentMap[activeBlock.type.toLowerCase()] || (
        <div>Unsupported block type: {activeBlock.type}</div>
      )}
    </div>
  )
}

export default BlockEditor
