import type React from "react"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-[calc(100vh-5rem)] flex items-center justify-center">{children}</div>
}
