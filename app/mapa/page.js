import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import dynamic from 'next/dynamic'

// MapLibre GL solo funciona en el browser — desactivar SSR
const MapaInteractivo = dynamic(
  () => import('@/components/MapaInteractivo'),
  { ssr: false, loading: () => <div className="w-full h-screen bg-gray-200 flex items-center justify-center text-gray-500">Cargando mapa...</div> }
)

export default async function MapaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('nombre, paralelo, role')
    .eq('id', user.id)
    .single()

  if (perfil?.role === 'admin') redirect('/admin')

  return <MapaInteractivo usuario={user} perfil={perfil} />
}
