import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'AstroLaunch - Professional Rocket Company',
  description: 'Leading the future of space exploration with innovative rocket technology and mission capabilities',
  keywords: ['rocket launch', 'space exploration', 'space technology', 'satellite deployment', 'space missions'],
  authors: [{ name: 'AstroLaunch Team' }],
  openGraph: {
    title: 'AstroLaunch - Professional Rocket Company',
    description: 'Leading the future of space exploration with innovative rocket technology',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}