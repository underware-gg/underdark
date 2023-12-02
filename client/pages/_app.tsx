import 'semantic-ui-css/semantic.min.css'
import '/styles/index.scss'
import React from 'react'
import { UnderdarkProvider } from '@/underdark/hooks/UnderdarkContext'
import { SettingsProvider } from '@/underdark/hooks/SettingsContext'

function _app({ Component, pageProps }) {
  return (
    <UnderdarkProvider>
      <SettingsProvider>
        <Component {...pageProps} />
      </SettingsProvider>
    </UnderdarkProvider>
  )
}

export default _app
