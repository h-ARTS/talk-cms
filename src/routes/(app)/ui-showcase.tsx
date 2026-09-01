import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useDispatch, useSelector } from "react-redux"
import {
  BellIcon,
  BlocksIcon,
  FileTextIcon,
  FolderIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  Trash2Icon,
} from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TreeView,
  type ToastItem,
  type TreeNode,
} from "@/ui/index"
import type { RootState } from "@/store/index"
import { toggleThemeMode } from "@/store/themeSlice"

export const Route = createFileRoute("/(app)/ui-showcase")({
  component: UiShowcasePage,
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
      <Separator className="mt-4" />
    </section>
  )
}

const demoTree: TreeNode[] = [
  {
    id: "root",
    label: "Landing page",
    icon: <FileTextIcon />,
    children: [
      {
        id: "hero",
        label: "Hero section",
        icon: <BlocksIcon />,
        children: [
          { id: "hero-heading", label: "Heading" },
          { id: "hero-cta", label: "CTA button" },
        ],
      },
      { id: "features", label: "Features", icon: <BlocksIcon /> },
      { id: "footer", label: "Footer", icon: <FolderIcon /> },
    ],
  },
]

function UiShowcasePage() {
  const dispatch = useDispatch()
  const mode = useSelector((state: RootState) => state.theme.mode)
  const [selectedNode, setSelectedNode] = React.useState<string | null>("hero")
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const pushToast = (variant: ToastItem["variant"]) => {
    const id = crypto.randomUUID()
    setToasts((current) => [
      ...current,
      {
        id,
        variant,
        title: variant === "success" ? "Page saved" : variant === "destructive" ? "Save failed" : "Heads up",
        description: "This is a toast notification from the Talk UI library.",
      },
    ])
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Talk UI
              </p>
              <h1 className="font-display text-4xl font-bold tracking-tight">
                Component showcase
              </h1>
            </div>
            <Button variant="outline" onClick={() => dispatch(toggleThemeMode())}>
              {mode === "dark" ? <SunIcon /> : <MoonIcon />}
              {mode === "dark" ? "Light mode" : "Dark mode"}
            </Button>
          </header>

          <Section title="Buttons">
            <Button>Save page</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">
              <Trash2Icon /> Delete
            </Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
            <Button disabled>Disabled</Button>
          </Section>

          <Section title="Badges">
            <Badge>Published</Badge>
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="success">Success</Badge>
          </Section>

          <Section title="Form controls">
            <div className="grid w-full max-w-sm gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="showcase-title">Page title</Label>
                <Input id="showcase-title" placeholder="My landing page" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="showcase-desc">Description</Label>
                <Textarea id="showcase-desc" placeholder="Tell us about this page…" />
              </div>
              <div className="grid gap-1.5">
                <Label>Block type</Label>
                <Select defaultValue="hero">
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                    <SelectItem value="cta">Call to action</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="showcase-dark" defaultChecked />
                <Label htmlFor="showcase-dark">Enabled</Label>
              </div>
            </div>
          </Section>

          <Section title="Card">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Landing page</CardTitle>
                <CardDescription>12 blocks · edited 2 hours ago</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Open</Button>
                <Button size="sm" variant="ghost">
                  Duplicate
                </Button>
              </CardFooter>
            </Card>
          </Section>

          <Section title="Alerts">
            <div className="grid w-full gap-3">
              <Alert>
                <AlertTitle>Default</AlertTitle>
                <AlertDescription>Everything is running smoothly.</AlertDescription>
              </Alert>
              <Alert variant="success" onClose={() => {}}>
                <AlertTitle>Page saved</AlertTitle>
                <AlertDescription>Your changes are live.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>The page could not be saved.</AlertDescription>
              </Alert>
            </div>
          </Section>

          <Section title="Dialog, Popover, Dropdown, Tooltip">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete page?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. The page and its blocks will be removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p className="text-sm text-muted-foreground">
                  Popovers work great for contextual editors and block settings.
                </p>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Page actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Page</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <FileTextIcon /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellIcon /> Notify
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2Icon /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltips explain icon buttons</TooltipContent>
            </Tooltip>
          </Section>

          <Section title="Tabs">
            <Tabs defaultValue="content" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="text-sm text-muted-foreground">
                Block content editing goes here.
              </TabsContent>
              <TabsContent value="seo" className="text-sm text-muted-foreground">
                Meta title, description, and OpenGraph.
              </TabsContent>
              <TabsContent value="settings" className="text-sm text-muted-foreground">
                Publish state and advanced options.
              </TabsContent>
            </Tabs>
          </Section>

          <Section title="Tree view">
            <Card className="w-full max-w-xs p-2">
              <TreeView
                nodes={demoTree}
                selectedId={selectedNode}
                onSelect={(node) => setSelectedNode(node.id)}
              />
            </Card>
          </Section>

          <Section title="Scroll area, Avatar, Spinner">
            <ScrollArea className="h-32 w-64 rounded-md border border-border p-3">
              {Array.from({ length: 12 }, (_, i) => (
                <p key={i} className="py-1 text-sm text-muted-foreground">
                  Scrollable row {i + 1}
                </p>
              ))}
            </ScrollArea>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/72" alt="User" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
            <Spinner />
            <Spinner size={32} />
          </Section>

          <Section title="Toasts">
            <Button variant="outline" onClick={() => pushToast("default")}>
              Default toast
            </Button>
            <Button variant="outline" onClick={() => pushToast("success")}>
              Success toast
            </Button>
            <Button variant="outline" onClick={() => pushToast("destructive")}>
              Error toast
            </Button>
          </Section>
        </div>
      </div>
      <Toaster toasts={toasts} onDismiss={(id) => setToasts((c) => c.filter((t) => t.id !== id))} />
    </TooltipProvider>
  )
}
