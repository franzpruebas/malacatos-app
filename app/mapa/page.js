import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import MapaLoader from './MapaLoader'

export default async function MapaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('nombre, paralelo, role')
    .eq('id', user.id)
    .single()

  return <MapaLoader usuario={user} perfil={perfil} />
}
