'use client'

import { SWRConfig } from 'swr'
import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from '@heroui/toast'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider placement='top-center' toastOffset={50} toastProps={{ timeout: 2000 }} />
      <SWRConfig 
        value={{
          refreshInterval: 30000,
          fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
        }}
      >
        {children}
      </SWRConfig>
    </HeroUIProvider>
  )
}