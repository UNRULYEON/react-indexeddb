import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>react-indexeddb</span>,
  project: {
    link: 'https://github.com/UNRULYEON/react-indexeddb',
  },
  docsRepositoryBase: 'https://github.com/UNRULYEON/react-indexeddb',
  useNextSeoProps: () => {
    return {
      titleTemplate: '%s - react-indexeddb',
    }
  },
  primaryHue: 0,
  primarySaturation: 0,
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} © <span>react-indexeddb</span>.
      </span>
    ),
  },
}

export default config
