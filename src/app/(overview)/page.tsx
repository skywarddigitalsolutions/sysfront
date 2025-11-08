import Inicio from '@/components/inicio'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sysventos',
  description: 'Gestion y control de eventos',
}

export default function Home() {
  return (
    <Inicio />
  )
}

