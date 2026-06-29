import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import EncuestaLoader from './EncuestaLoader'

export default async function EncuestaPage({ params }) {
  const { predio_id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que el predio pertenece a este alumno
  const { data: predio } = await supabase
    .from('predios')
    .select('id, clave_cata, estado, alumno_id, lat, lon')
    .eq('id', predio_id)
    .single()

  if (!predio) redirect('/mapa')

  // Solo el alumno asignado puede ver el formulario
  if (predio.alumno_id !== user.id) redirect('/mapa')

  // Si ya está completado, redirigir al mapa
  if (predio.estado === 'completado') redirect('/mapa')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('nombre, paralelo, role')
    .eq('id', user.id)
    .single()

  return (
    <EncuestaLoader
      predioId={predio_id}
      claveCata={predio.clave_cata}
      centroidLat={predio.lat}
      centroidLon={predio.lon}
      usuario={user}
      perfil={perfil}
    />
  )
}
