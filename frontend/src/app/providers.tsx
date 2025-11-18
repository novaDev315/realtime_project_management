'use client'

import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import { store } from '@/store/store'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#0ea5e9',
            borderRadius: 6,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </Provider>
  )
}
