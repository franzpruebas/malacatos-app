import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PanelAdmin from './PanelAdmin'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'admin') redirect('/mapa')

  const { data: stats } = await supabase.rpc('get_estadisticas_admin')

  // Predios activos
  const { data: prediosRaw } = await supabase
    .from('predios')
    .select('id, clave_cata, tipo_predi, estado, alumno_id, tomado_en')
    .in('estado', ['en_proceso', 'completado'])
    .order('tomado_en', { ascending: false })
    .limit(200)

  // Perfiles de los alumnos asignados (consulta separada para evitar join cross-schema)
  const alumnoIds = [...new Set((prediosRaw || []).map(p => p.alumno_id).filter(Boolean))]
  let profilesMap = {}
  if (alumnoIds.length) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, nombre, paralelo')
      .in('id', alumnoIds)
    profilesMap = Object.fromEntries((profs || []).map(p => [p.id, p]))
  }

  const prediosActivos = (prediosRaw || []).map(p => ({
    ...p,
    profiles: profilesMap[p.alumno_id] || null,
  }))

  // Encuestas completadas con todos los campos (para resultados globales)
  const { data: encuestasRaw } = await supabase
    .from('encuestas')
    .select('*')
    .eq('completa', true)
    .order('enviada_en', { ascending: false })

  const alumnoIdsEnc = [...new Set((encuestasRaw || []).map(e => e.alumno_id).filter(Boolean))]
  let profilesEncMap = {}
  if (alumnoIdsEnc.length) {
    const { data: profsEnc } = await supabase
      .from('profiles')
      .select('id, nombre, paralelo')
      .in('id', alumnoIdsEnc)
    profilesEncMap = Object.fromEntries((profsEnc || []).map(p => [p.id, p]))
  }
  const encuestasCompletas = (encuestasRaw || []).map(e => ({
    ...e,
    alumno: profilesEncMap[e.alumno_id] || null,
  }))

  return (
    <PanelAdmin
      stats={stats}
      prediosActivos={prediosActivos}
      encuestasCompletas={encuestasCompletas}
      adminId={user.id}
    />
  )
}
