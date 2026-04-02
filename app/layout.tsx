import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Matrindex - 内网端口穿透工具',
  description: 'Matrindex 是一款简单高效的内网端口穿透工具，让您轻松访问内网服务',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
