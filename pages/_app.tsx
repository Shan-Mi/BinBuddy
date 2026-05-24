import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import type { AppProps } from 'next/app'
import theme from '../lib/theme'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  )
}
