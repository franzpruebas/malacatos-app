'use client'
import dynamic from 'next/dynamic'

const MapaInteractivo = dynamic(
  () => import('@/components/MapaInteractivo'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gray-200 flex items-center justify-center text-gray-500">
        Cargando mapa...
      </div>
    ),
  }
)

export default function MapaLoader({ usuario, perfil }) {
  return <MapaInteractivo usuario={usuario} perfil={perfil} />
}
