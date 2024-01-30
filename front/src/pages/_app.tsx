import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {NextUIProvider} from '@nextui-org/react'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
}