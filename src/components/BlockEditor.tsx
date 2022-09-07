import React from "react"
// Components
import Headline from "./blockComponents/Headline"
import Card from "./blockComponents/Card"
import Grid from "./blockComponents/Grid"
import Teaser from "./blockComponents/Teaser"
// Redux
import { useSelector } from "react-redux"
import { RootState } from "@/src/store"
import { Box, Typography } from "@mui/material"

const BlockEditor: React.FC = () => {
  const activeBlock = useSelector(
    (state: RootState) => state.pageBuilder.activeBlock
  )

  if (!activeBlock) {
    return (
      <Box px={3} my={2}>
        <Typography variant="subtitle2">Select a block to edit</Typography>
      </Box>
    )
  }

  const blockComponentMap: Record<string, JSX.Element> = {
    headline: <Headline />,
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
