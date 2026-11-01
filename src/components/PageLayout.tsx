import type { ReactNode } from "react"

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      {children}
    </div>
  )
}
