import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '@/app/globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: 'DocBot - AI Knowledge Base Widget',
    template: '%s | DocBot',
  },
  description: 'AI-powered knowledge base chatbot widget for your website. Upload docs, embed the widget, let AI answer your customers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <Toaster />
        {children}
      </body>
    </html>
  )
}
