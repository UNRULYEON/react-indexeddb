import PlausibleProvider from 'next-plausible'

export default function App({ Component, pageProps }) {
  return (
    <PlausibleProvider domain="react-indexeddb-docs.vercel.app">
      <Component {...pageProps} />
    </PlausibleProvider>
  )
}
