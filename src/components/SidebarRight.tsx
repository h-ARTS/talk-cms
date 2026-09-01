import React, { useEffect } from "react"
import TabConfig from "./tabs/TabConfig"
import BlockTree from "./tabs/BlockTree"
import { usePageBuilderStore } from "@/store/index"
import Breadcrumb from "./Breadcrumb"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"

const SidebarRight: React.FC = () => {
  const navigationHistory = usePageBuilderStore((state) => state.navigationHistory)
  const blocks = usePageBuilderStore((state) => state.blocks)
  const currentBlock = blocks.find(
    (b) => b.id === navigationHistory[navigationHistory.length - 1]
  )
  const setActiveBlock = usePageBuilderStore((state) => state.setActiveBlock)
  const setNavigationHistory = usePageBuilderStore(
    (state) => state.setNavigationHistory
  )

  useEffect(() => {
    if (navigationHistory.length == 0) setActiveBlock(null)
    else if (currentBlock) {
      const { type, id } = currentBlock
      setActiveBlock({ type, id })
    }
  }, [currentBlock, navigationHistory, navigationHistory.length, setActiveBlock])

  const handleNavigate = (id: string) => {
    setNavigationHistory([...navigationHistory, id])
  }

  const currentView =
    navigationHistory.length > 0
      ? navigationHistory[navigationHistory.length - 1]
      : null

  return (
    <div className="flex h-full w-full flex-col bg-card">
      <p className="border-b border-border py-3 text-center font-display text-sm font-semibold tracking-tight">
        Landing page
      </p>
      <Tabs defaultValue="blocks" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-2 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="blocks" className="flex-1">
              Blocks
            </TabsTrigger>
            <TabsTrigger value="config" className="flex-1">
              Config
            </TabsTrigger>
          </TabsList>
        </div>
        {navigationHistory.length > 0 && <Breadcrumb />}
        <TabsContent value="blocks" className="mt-0 min-h-0 flex-1 overflow-y-auto">
          <BlockTree parentId={currentView} onNavigate={handleNavigate} />
        </TabsContent>
        <TabsContent value="config" className="mt-0 min-h-0 flex-1 overflow-y-auto">
          <TabConfig />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SidebarRight
