import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import '../styles/globals.css'

const theme = createTheme({
  palette: { mode: 'dark' },
  typography: { fontFamily: "'Inter', -apple-system, sans-serif" },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#0b0f19' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  }
})

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])
  if (!ready) return null

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Electrolyte Bajaj — PCB Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CssBaseline />
      <Component {...pageProps} key={router.asPath} />
    </ThemeProvider>
  )
}
