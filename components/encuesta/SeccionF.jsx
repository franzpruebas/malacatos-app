// SECCIÓN F — Patrón espacial / Índice ICC (preguntas 28–32)
import { RadioGroup, CheckboxGroup, EscalaLikert, NavBotones } from './ui'

const VIVIENDAS_SIMILARES = [
  { value: '0',     label: '0 — Vivienda aislada, sin similares visibles' },
  { value: '1_2',   label: '1–2 viviendas similares' },
  { value: '3_5',   label: '3–5 viviendas similares' },
  { value: '6_10',  label: '6–10 viviendas similares' },
  { value: 'mas_10',label: 'Más de 10 (grupo consolidado)' },
]

const DISTANCIA_SIMILAR = [
  { value: 'menos_50', label: 'Menos de 50 m' },
  { value: '50_100',   label: '50–100 m' },
  { value: '101_250',  label: '101–250 m' },
  { value: '251_500',  label: '251–500 m' },
  { value: 'no_similar',label: 'No se observan viviendas similares' },
]

const TIPO_SIMILITUD = [
  { value: 'arquitectonica', label: 'Arquitectónica (formas, volúmenes, materiales)' },
  { value: 'parcelaria',     label: 'Parcelaria (tamaños y formas de lotes equivalentes)' },
  { value: 'recreativa',     label: 'Recreativa (mismos elementos de ocio: piscina, jardines)' },
  { value: 'vial',           label: 'Vial (acceso desde el mismo camino o vía privada)' },
  { value: 'cerramientos',   label: 'Cerramientos (tipología de muro o reja idéntica)' },
  { value: 'paisajistica',   label: 'Paisajística (orientación hacia misma visual o amenidad)' },
  { value: 'no_evidente',    label: 'No evidente' },
]

const ANCLAS_PATRON = [
  'Muy baja: vivienda aislada, sin similares visibles, morfología heterogénea',
  'Baja: 1–2 viviendas con alguna similitud, patrón casual no estructural',
  'Moderada: 3–5 viviendas similares con ≥ 2 tipos de similitud',
  'Alta: 6–10 viviendas, repetición en ≥ 3 dimensiones, patrón dominante',
  'Muy alta: +10 viviendas, cluster consolidado, repetición en todas las dimensiones',
]

const NUEVAS_CONSTRUCCIONES = [
  { value: 'en_proceso',  label: 'Sí — en proceso activo de construcción' },
  { value: 'reciente_2a', label: 'Sí — concluida en los últimos 2 años (estimado)' },
  { value: 'no',          label: 'No' },
]

export default function SeccionF({ register, onSiguiente, onAtras, guardando }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">F — Patrón espacial y repetición morfológica</h2>
      <p className="text-xs text-gray-500">Variables para calcular el Índice de Consolidación de Cluster (ICC).</p>

      <RadioGroup
        label="28. Número de viviendas similares visibles en radio ≈ 500 m"
        name="p28_viviendas_similares"
        opciones={VIVIENDAS_SIMILARES}
        register={register}
        requerido
      />

      <RadioGroup
        label="29. Distancia aproximada a la vivienda similar más cercana"
        name="p29_distancia_similar"
        opciones={DISTANCIA_SIMILAR}
        register={register}
        requerido
      />

      <CheckboxGroup
        label="30. Tipo de similitud predominante observable (marcar todas las que apliquen)"
        name="p30_tipo_similitud"
        opciones={TIPO_SIMILITUD}
        register={register}
      />

      <EscalaLikert
        label="31. Intensidad del patrón repetitivo observable"
        name="p31_intensidad_patron"
        register={register}
        anclas={ANCLAS_PATRON}
        requerido
      />

      <RadioGroup
        label="32. Evidencia de nuevas construcciones en el radio de observación 500 m"
        name="p32_nuevas_construcciones"
        opciones={NUEVAS_CONSTRUCCIONES}
        register={register}
        requerido
      />

      <NavBotones onAtras={onAtras} onSiguiente={onSiguiente} guardando={guardando} />
    </div>
  )
}
