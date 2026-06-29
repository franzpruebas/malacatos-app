import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import VisorEncuesta from '@/components/encuesta/VisorEncuesta'

export default async function VerEncuestaPage({ params }) {
  const { predio_id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('nombre, role')
    .eq('id', user.id)
    .single()

  const esAdmin = perfil?.role === 'admin'

  // Leer el predio
  const { data: predio } = await supabase
    .from('predios')
    .select('id, clave_cata, estado, alumno_id')
    .eq('id', predio_id)
    .single()

  if (!predio || predio.estado !== 'completado') redirect('/mapa')

  // Leer la encuesta (admin siempre puede, alumno solo si es completada — permitido por RLS)
  const { data: encuesta } = await supabase
    .from('encuestas')
    .select('*')
    .eq('predio_id', predio_id)
    .eq('completa', true)
    .single()

  if (!encuesta) redirect('/mapa')

  // Nombre del alumno que la completó
  let alumnoNombre = null
  if (predio.alumno_id) {
    const { data: alumno } = await supabase
      .from('profiles')
      .select('nombre, paralelo')
      .eq('id', predio.alumno_id)
      .single()
    alumnoNombre = alumno ? `${alumno.nombre} (Paralelo ${alumno.paralelo})` : null
  }

  return (
    <VisorEncuesta
      encuesta={encuesta}
      claveCata={predio.clave_cata}
      alumno={alumnoNombre}
      esAdmin={esAdmin}
      predioId={predio_id}
    />
  )
}
