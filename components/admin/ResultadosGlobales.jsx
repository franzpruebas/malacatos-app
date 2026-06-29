'use client'
import { useMemo } from 'react'

// Configuración de preguntas a mostrar con sus etiquetas de respuesta
const GRUPOS = [
  {
    titulo: 'A — Ubicación y acceso',
    campos: [
      { key: 'p05_sector',     label: 'Sector o barrio',        tipo: 'texto' },
      { key: 'p06_tipo_via',   label: 'Tipo de vía de acceso',  tipo: 'texto',
        labels: { pavimentada:'Pavimentada/asfalto', lastre:'Lastre/afirmado', tierra:'Camino de tierra', sendero:'Sendero peatonal' } },
      { key: 'p07_antiguedad', label: 'Antigüedad de construcción', tipo: 'texto',
        labels: { menos_5:'< 5 años (2020–2026)', '5_10':'5–10 años', '11_15':'11–15 años', '16_20':'16–20 años', mas_20:'> 20 años' } },
      { key: 'p04_distancia_centro_km', label: 'Distancia al centro (km)', tipo: 'numero' },
    ],
  },
  {
    titulo: 'B — Morfología de la edificación',
    campos: [
      { key: 'p08_tipologia',         label: 'Tipología arquitectónica', tipo: 'texto' },
      { key: 'p09_implantacion',       label: 'Implantación en el lote',  tipo: 'texto' },
      { key: 'p10_num_pisos',          label: 'Número de pisos',          tipo: 'texto' },
      { key: 'p11_area_construccion',  label: 'Área de construcción',     tipo: 'texto' },
      { key: 'p12_material_fachada',   label: 'Material de fachada',      tipo: 'texto' },
      { key: 'p13_produccion',         label: 'Producción del lote',      tipo: 'texto' },
    ],
  },
  {
    titulo: 'C — Ocio y espacio privado',
    campos: [
      { key: 'p14_artificializacion',  label: 'Artificialización del paisaje',  tipo: 'escala' },
      { key: 'p15_cobertura_vegetal',  label: 'Cobertura vegetal',              tipo: 'escala' },
      { key: 'p16_integracion_visual', label: 'Integración visual',             tipo: 'escala' },
      { key: 'p17_dominancia_visual',  label: 'Dominancia visual',              tipo: 'escala' },
      { key: 'p18_elementos_recreativos', label: 'Elementos recreativos',       tipo: 'array' },
      { key: 'p19_proporcion_ocio',    label: 'Proporción de área de ocio',     tipo: 'texto' },
      { key: 'p20_senales_uso',        label: 'Señales de uso',                 tipo: 'texto' },
    ],
  },
  {
    titulo: 'D — Cerramiento y exclusividad',
    campos: [
      { key: 'p21_cerramiento',          label: 'Cerramiento',          tipo: 'escala' },
      { key: 'p22_control_acceso',       label: 'Control de acceso',    tipo: 'escala' },
      { key: 'p23_privatizacion_visual', label: 'Privatización visual', tipo: 'escala' },
      { key: 'p24_apropiacion_bienes',   label: 'Apropiación de bienes públicos', tipo: 'texto' },
    ],
  },
  {
    titulo: 'E — Infraestructura y servicios',
    campos: [
      { key: 'p25_servicios_basicos',        label: 'Servicios básicos',        tipo: 'array' },
      { key: 'p26_infraestructura_reciente', label: 'Infraestructura reciente', tipo: 'array' },
      { key: 'p27_urbanizacion_entorno',     label: 'Urbanización del entorno', tipo: 'array' },
    ],
  },
  {
    titulo: 'F — Patrón espacial',
    campos: [
      { key: 'p28_viviendas_similares',  label: 'Viviendas similares',            tipo: 'texto' },
      { key: 'p29_distancia_similar',    label: 'Distancia a vivienda similar',   tipo: 'texto' },
      { key: 'p30_tipo_similitud',       label: 'Tipo de similitud',              tipo: 'array' },
      { key: 'p31_intensidad_patron',    label: 'Intensidad del patrón espacial', tipo: 'escala' },
      { key: 'p32_nuevas_construcciones', label: 'Nuevas construcciones observadas', tipo: 'texto' },
    ],
  },
  {
    titulo: 'G — Territorio y contexto',
    campos: [
      { key: 'p33_topografia', label: 'Condición topográfica',  tipo: 'texto' },
      { key: 'p34_amenidad',   label: 'Amenidad del entorno',   tipo: 'texto' },
    ],
  },
]

// Frecuencia de valores en un campo texto
function frecuencia(encuestas, key, labelMap) {
  const conteo = {}
  encuestas.forEach(e => {
    const val = e[key]
    if (!val) return
    const label = labelMap?.[val] ?? val
    conteo[label] = (conteo[label] || 0) + 1
  })
  const total = Object.values(conteo).reduce((a, b) => a + b, 0)
  return Object.entries(conteo)
    .map(([label, n]) => ({ label, n, pct: Math.round(n / total * 100) }))
    .sort((a, b) => b.n - a.n)
}

// Distribución de escala 1-5 + promedio
function distribucionEscala(encuestas, key) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let suma = 0, count = 0
  encuestas.forEach(e => {
    const val = Number(e[key])
    if (val >= 1 && val <= 5) {
      dist[val]++
      suma += val
      count++
    }
  })
  const promedio = count > 0 ? (suma / count).toFixed(2) : null
  const max = Math.max(...Object.values(dist), 1)
  return { dist, promedio, count, max }
}

// Frecuencia de items en campos array
function frecuenciaArray(encuestas, key) {
  const conteo = {}
  encuestas.forEach(e => {
    const arr = Array.isArray(e[key]) ? e[key] : []
    arr.forEach(item => {
      if (item) conteo[item] = (conteo[item] || 0) + 1
    })
  })
  return Object.entries(conteo)
    .map(([label, n]) => ({ label, n, pct: Math.round(n / encuestas.length * 100) }))
    .sort((a, b) => b.n - a.n)
}

// Promedio numérico
function promedioNum(encuestas, key) {
  const vals = encuestas.map(e => Number(e[key])).filter(v => !isNaN(v) && v > 0)
  if (!vals.length) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

// ── Componentes de visualización ──────────────────────────────

function BarraH({ label, n, pct, max, color = 'bg-green-500' }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="w-36 text-xs text-gray-600 truncate shrink-0" title={label}>{label}</div>
      <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
        <div className={`h-4 ${color} rounded transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-gray-500 w-16 text-right shrink-0">{n} ({pct}%)</div>
    </div>
  )
}

function EscalaVis({ datos }) {
  const { dist, promedio, count, max } = datos
  const COLORS = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-green-600']
  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-lg font-bold text-green-700">{promedio ?? '—'}</span>
        <span className="text-xs text-gray-400">/ 5 &nbsp;·&nbsp; {count} respuestas</span>
      </div>
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-4">{i}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded overflow-hidden">
              <div
                className={`h-3 rounded ${COLORS[i - 1]}`}
                style={{ width: max > 0 ? `${Math.round(dist[i] / max * 100)}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{dist[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Campo({ campo, encuestas }) {
  if (encuestas.length === 0) return null

  let contenido = null
  const n = encuestas.filter(e => e[campo.key] !== null && e[campo.key] !== undefined && e[campo.key] !== '').length

  if (campo.tipo === 'escala') {
    const datos = distribucionEscala(encuestas, campo.key)
    if (!datos.count) return null
    contenido = <EscalaVis datos={datos} />
  } else if (campo.tipo === 'array') {
    const items = frecuenciaArray(encuestas, campo.key)
    if (!items.length) return null
    contenido = (
      <div className="space-y-0.5">
        {items.slice(0, 10).map(item => (
          <BarraH key={item.label} {...item} max={encuestas.length} />
        ))}
      </div>
    )
  } else if (campo.tipo === 'numero') {
    const prom = promedioNum(encuestas, campo.key)
    if (!prom) return null
    contenido = <p className="text-lg font-bold text-green-700">{prom} km <span className="text-xs font-normal text-gray-400">promedio ({n} respuestas)</span></p>
  } else {
    const items = frecuencia(encuestas, campo.key, campo.labels)
    if (!items.length) return null
    contenido = (
      <div className="space-y-0.5">
        {items.slice(0, 10).map(item => (
          <BarraH key={item.label} {...item} max={items[0]?.n || 1} />
        ))}
      </div>
    )
  }

  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{campo.label}</p>
      {contenido}
    </div>
  )
}

export default function ResultadosGlobales({ encuestasCompletas }) {
  const total = encuestasCompletas.length

  const indiceIIR = useMemo(() => {
    // Índice Intensidad de Implantación Recreativa: promedio p14+p15+p16+p17
    const vals = encuestasCompletas.map(e => {
      const v = [e.p14_artificializacion, e.p15_cobertura_vegetal, e.p16_integracion_visual, e.p17_dominancia_visual]
        .map(Number).filter(n => n >= 1 && n <= 5)
      return v.length === 4 ? v.reduce((a, b) => a + b, 0) / 4 : null
    }).filter(v => v !== null)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null
  }, [encuestasCompletas])

  const indiceIP = useMemo(() => {
    const vals = encuestasCompletas.map(e => {
      const v = [e.p21_cerramiento, e.p22_control_acceso, e.p23_privatizacion_visual]
        .map(Number).filter(n => n >= 1 && n <= 5)
      return v.length === 3 ? v.reduce((a, b) => a + b, 0) / 3 : null
    }).filter(v => v !== null)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null
  }, [encuestasCompletas])

  const indiceICC = useMemo(() => {
    const vals = encuestasCompletas.map(e => {
      const v = Number(e.p31_intensidad_patron)
      return v >= 1 && v <= 5 ? v : null
    }).filter(v => v !== null)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null
  }, [encuestasCompletas])

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
        Aún no hay encuestas completadas
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Índices resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Índice IIR\nOcio privado', valor: indiceIIR, sub: 'media p14–p17' },
          { label: 'Índice IP\nPrivatización', valor: indiceIP, sub: 'media p21–p23' },
          { label: 'Índice ICC\nPatrón espacial', valor: indiceICC, sub: 'media p31' },
        ].map(t => (
          <div key={t.label} className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-800">{t.valor ?? '—'}</p>
            <p className="text-xs font-medium text-green-700 whitespace-pre-line mt-1 leading-tight">{t.label}</p>
            <p className="text-xs text-green-500 mt-0.5">{t.sub}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-right">Basado en {total} encuestas completadas</p>

      {/* Por grupo */}
      {GRUPOS.map(grupo => (
        <div key={grupo.titulo} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b px-4 py-2">
            <h3 className="font-semibold text-gray-700 text-sm">{grupo.titulo}</h3>
          </div>
          <div className="px-4">
            {grupo.campos.map(campo => (
              <Campo key={campo.key} campo={campo} encuestas={encuestasCompletas} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
