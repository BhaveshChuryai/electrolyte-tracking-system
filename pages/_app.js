import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import '../styles/globals.css'

const theme = createTheme({
  palette: { mode: 'dark' },
  typography: { fontFamily: "'DM Sans', sans-serif" },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#060c18', fontFamily: "'DM Sans', sans-serif" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  }
})

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Electrolyte Bajaj — PCB Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <CssBaseline />
      <Component {...pageProps} key={router.asPath} />
    </ThemeProvider>
  )
}
