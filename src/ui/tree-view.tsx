import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/ui/lib/utils"

export interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
}

export interface TreeViewProps {
  nodes: TreeNode[]
  selectedId?: string | null
  onSelect?: (node: TreeNode) => void
  defaultExpandedIds?: string[]
  className?: string
}

function collectBranchIds(nodes: TreeNode[], acc: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      acc.push(node.id)
      collectBranchIds(node.children, acc)
    }
  }
  return acc
}

function TreeItemRow({
  node,
  depth,
  selectedId,
  onSelect,
  hasChildren,
}: {
  node: TreeNode
  depth: number
  selectedId?: string | null
  onSelect?: (node: TreeNode) => void
  hasChildren: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(node)}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring",
        selectedId === node.id
          ? "bg-accent font-medium text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <ChevronRightIcon
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
          !hasChildren && "invisible"
        )}
        data-chevron
      />
      {node.icon && <span className="shrink-0 [&_svg]:size-4">{node.icon}</span>}
      <span className="truncate">{node.label}</span>
    </button>
  )
}

function TreeBranch({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: TreeNode
  depth: number
  selectedId?: string | null
  onSelect?: (node: TreeNode) => void
}) {
  const hasChildren = Boolean(node.children?.length)

  if (!hasChildren) {
    return (
      <TreeItemRow
        node={node}
        depth={depth}
        selectedId={selectedId}
        onSelect={onSelect}
        hasChildren={false}
      />
    )
  }

  return (
    <AccordionPrimitive.Item value={node.id} className="border-none">
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger asChild>
          <div className="w-full [&[data-state=open]_[data-chevron]]:rotate-90">
            <TreeItemRow
              node={node}
              depth={depth}
              selectedId={selectedId}
              onSelect={onSelect}
              hasChildren
            />
          </div>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div>
          {node.children!.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

function TreeView({ nodes, selectedId, onSelect, defaultExpandedIds, className }: TreeViewProps) {
  return (
    <AccordionPrimitive.Root
      type="multiple"
      defaultValue={defaultExpandedIds ?? collectBranchIds(nodes)}
      className={cn("flex flex-col gap-0.5", className)}
    >
      {nodes.map((node) => (
        <TreeBranch
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </AccordionPrimitive.Root>
  )
}

export { TreeView }
