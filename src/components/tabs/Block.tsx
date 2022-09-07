// import Headline from "./Headline"
// import Grid from "./Grid"
// import Teaser from "./Teaser"
// import Card from "./Card"
// import Carousel from "./Carousel"
import { Block } from "@/types/types"

interface BlockProps {
  block: Block
}

const BlockComponent: React.FC<BlockProps> = ({ block }) => {
  // switch (block.type) {
  //   case "Headline":
  //     return <block.type block={block} />
  //   case "Grid":
  //     return <Grid block={block} />
  //   case "Teaser":
  //     return <Teaser block={block} />
  //   case "Card":
  //     return <Card block={block} />
  //   case "Carousel":
  //     return <Carousel block={block} />
  //   default:
  //     return null
  // }
  return <div>{block.type}</div>
}

export default BlockComponent
