'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase-browser'
import SeccionA from './SeccionA'
import SeccionB from './SeccionB'
import SeccionC from './SeccionC'
import SeccionD from './SeccionD'
import SeccionE from './SeccionE'
import SeccionF from './SeccionF'
import SeccionG from './SeccionG'

const SECCIONES = [
  { num: 1, titulo: 'Identificación',     componente: SeccionA },
  { num: 2, titulo: 'Morfología',         componente: SeccionB },
  { num: 3, titulo: 'Ocio privado',       componente: SeccionC },
  { num: 4, titulo: 'Cerramiento',        componente: SeccionD },
  { num: 5, titulo: 'Infraestructura',    componente: SeccionE },
  { num: 6, titulo: 'Patrón espacial',    componente: SeccionF },
  { num: 7, titulo: 'Territorio',         componente: SeccionG },
]

export default function FormularioEncuesta({ predioId, claveCata, centroidLat, centroidLon, usuario, perfil }) {
  const router  = useRouter()
  const supabase = createClient()

  const [seccionActual, setSeccionActual] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [enviando, setEnviando]   = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  const { register, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      p01_codigo_ficha:      claveCata,
      p02_nombre_observador: perfil?.nombre || '',
      p03_latitud:           centroidLat ?? null,
      p03_longitud:          centroidLon ?? null,
      p18_elementos_recreativos:    [],
      p25_servicios_basicos:        [],
      p26_infraestructura_reciente: [],
      p27_urbanizacion_entorno:     [],
      p30_tipo_similitud:           [],
    }
  })

  // Cargar borrador existente al montar
  useEffect(() => {
    async function cargarBorrador() {
      const { data } = await supabase
        .from('encuestas')
        .select('*')
        .eq('predio_id', predioId)
        .single()

      if (data) {
        Object.entries(data).forEach(([key, val]) => {
          if (val !== null && key.startsWith('p')) setValue(key, val)
        })
        setSeccionActual(data.seccion_actual || 1)
      }

      // Siempre re-aplicar valores del servidor (no editables por el alumno)
      setValue('p01_codigo_ficha',      claveCata)
      setValue('p02_nombre_observador',
        perfil?.nombre?.trim()
          ? perfil.nombre
          : (perfil?.role === 'admin' ? 'Administrador' : 'Sin nombre')
      )
      if (centroidLat) setValue('p03_latitud',  centroidLat)
      if (centroidLon) setValue('p03_longitud', centroidLon)
    }
    cargarBorrador()
  }, [predioId, supabase, setValue, claveCata, perfil, centroidLat, centroidLon])

  async function guardarSeccion(datosSeccion, seccionCompletada) {
    setGuardando(true)
    const { error } = await supabase
      .from('encuestas')
      .upsert({
        predio_id:      predioId,
        alumno_id:      usuario.id,
        seccion_actual: seccionCompletada + 1,
        ...datosSeccion,
      }, { onConflict: 'predio_id' })

    setGuardando(false)
    if (!error) {
      setGuardadoOk(true)
      setTimeout(() => setGuardadoOk(false), 2000)
    }
    return !error
  }

  async function siguienteSeccion(datosSeccion) {
    const ok = await guardarSeccion(datosSeccion, seccionActual)
    if (ok) setSeccionActual(s => s + 1)
    window.scrollTo(0, 0)
  }

  async function enviarEncuesta(datosSeccion) {
    setEnviando(true)

    // Guardar sección G
    await supabase
      .from('encuestas')
      .upsert({
        predio_id:     predioId,
        alumno_id:     usuario.id,
        seccion_actual: 7,
        completa:      true,
        enviada_en:    new Date().toISOString(),
        ...getValues(),
        ...datosSeccion,
      }, { onConflict: 'predio_id' })

    // Marcar predio como completado
    await supabase.rpc('completar_predio', { predio_id: predioId })

    setEnviando(false)
    router.push('/mapa')
    router.refresh()
  }

  const SeccionActual = SECCIONES[seccionActual - 1].componente

  return (
    <div className="min-h-screen bg-gray-50" style={{ overflow: 'auto' }}>

      {/* Header */}
      <div className="bg-green-700 text-white px-4 py-3 sticky top-0 z-10 shadow">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push('/mapa')}
            className="text-green-200 text-sm"
          >
            ← Volver al mapa
          </button>
          <span className="text-sm font-mono text-green-200">{claveCata}</span>
        </div>

        {/* Barra de progreso por secciones */}
        <div className="flex gap-1">
          {SECCIONES.map(s => (
            <div
              key={s.num}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s.num < seccionActual  ? 'bg-green-300' :
                s.num === seccionActual ? 'bg-white' :
                'bg-green-600'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-green-200 mt-1">
          Sección {seccionActual} de 7 — {SECCIONES[seccionActual - 1].titulo}
        </p>
      </div>

      {/* Contenido de la sección */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        <SeccionActual
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
          onSiguiente={seccionActual < 7 ? handleSubmit(siguienteSeccion) : undefined}
          onEnviar={seccionActual === 7 ? handleSubmit(enviarEncuesta) : undefined}
          onAtras={seccionActual > 1 ? () => { setSeccionActual(s => s - 1); window.scrollTo(0,0) } : undefined}
          guardando={guardando}
          enviando={enviando}
        />
      </div>

      {/* Toast guardado */}
      {guardadoOk && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50">
          ✓ Guardado
        </div>
      )}
    </div>
  )
}
