'use client'
import { useRouter } from 'next/navigation'

const SECCIONES = [
  {
    titulo: 'A — Identificación y geolocalización',
    campos: [
      { key: 'p01_codigo_ficha',        label: 'Código de ficha catastral' },
      { key: 'p02_nombre_observador',    label: 'Observador' },
      { key: 'p03_latitud',              label: 'Latitud' },
      { key: 'p03_longitud',             label: 'Longitud' },
      { key: 'p04_distancia_centro_km',  label: 'Distancia al centro (km)' },
      { key: 'p05_sector',               label: 'Sector o barrio' },
      { key: 'p06_tipo_via',             label: 'Tipo de vía de acceso' },
      { key: 'p07_antiguedad',           label: 'Antigüedad de construcción' },
    ],
  },
  {
    titulo: 'B — Morfología de la edificación',
    campos: [
      { key: 'p08_tipologia',            label: 'Tipología arquitectónica' },
      { key: 'p09_implantacion',         label: 'Implantación en el lote' },
      { key: 'p10_num_pisos',            label: 'Número de pisos' },
      { key: 'p11_area_construccion',    label: 'Área de construcción' },
      { key: 'p12_material_fachada',     label: 'Material de fachada' },
      { key: 'p13_produccion',           label: 'Producción del lote' },
    ],
  },
  {
    titulo: 'C — Ocio y espacio privado',
    campos: [
      { key: 'p14_artificializacion',    label: 'Artificialización del paisaje', escala: true },
      { key: 'p15_cobertura_vegetal',    label: 'Cobertura vegetal',              escala: true },
      { key: 'p16_integracion_visual',   label: 'Integración visual',             escala: true },
      { key: 'p17_dominancia_visual',    label: 'Dominancia visual',              escala: true },
      { key: 'p18_elementos_recreativos', label: 'Elementos recreativos',         array: true },
      { key: 'p19_proporcion_ocio',      label: 'Proporción de área de ocio' },
      { key: 'p20_senales_uso',          label: 'Señales de uso' },
    ],
  },
  {
    titulo: 'D — Cerramiento y exclusividad',
    campos: [
      { key: 'p21_cerramiento',          label: 'Cerramiento',                    escala: true },
      { key: 'p22_control_acceso',       label: 'Control de acceso',              escala: true },
      { key: 'p23_privatizacion_visual', label: 'Privatización visual',           escala: true },
      { key: 'p24_apropiacion_bienes',   label: 'Apropiación de bienes públicos' },
    ],
  },
  {
    titulo: 'E — Infraestructura y servicios',
    campos: [
      { key: 'p25_servicios_basicos',         label: 'Servicios básicos',         array: true },
      { key: 'p26_infraestructura_reciente',  label: 'Infraestructura reciente',  array: true },
      { key: 'p27_urbanizacion_entorno',      label: 'Urbanización del entorno',  array: true },
    ],
  },
  {
    titulo: 'F — Patrón espacial',
    campos: [
      { key: 'p28_viviendas_similares',  label: 'Viviendas similares en el entorno' },
      { key: 'p29_distancia_similar',    label: 'Distancia a vivienda similar' },
      { key: 'p30_tipo_similitud',       label: 'Tipo de similitud',              array: true },
      { key: 'p31_intensidad_patron',    label: 'Intensidad del patrón espacial', escala: true },
      { key: 'p32_nuevas_construcciones', label: 'Nuevas construcciones observadas' },
    ],
  },
  {
    titulo: 'G — Territorio y contexto',
    campos: [
      { key: 'p33_topografia',           label: 'Condición topográfica' },
      { key: 'p34_amenidad',             label: 'Amenidad del entorno' },
      { key: 'p35_observaciones',        label: 'Observaciones generales' },
    ],
  },
]

function Escala({ valor }) {
  const n = Number(valor)
  if (!n) return <span className="text-gray-400">—</span>
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i}
            className={`w-5 h-5 rounded-sm ${i <= n ? 'bg-green-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600 font-medium">{n}/5</span>
    </div>
  )
}

function Valor({ campo, encuesta }) {
  const val = encuesta[campo.key]
  if (val === null || val === undefined || val === '') return <span className="text-gray-300">—</span>
  if (campo.escala) return <Escala valor={val} />
  if (campo.array) {
    const arr = Array.isArray(val) ? val : []
    if (!arr.length) return <span className="text-gray-300">—</span>
    return (
      <div className="flex flex-wrap gap-1">
        {arr.map(item => (
          <span key={item} className="bg-green-50 border border-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
            {item}
          </span>
        ))}
      </div>
    )
  }
  return <span className="text-gray-800">{String(val)}</span>
}

export default function VisorEncuesta({ encuesta, claveCata, alumno, esAdmin, predioId }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 py-3 sticky top-0 z-10 shadow">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-green-200 text-sm flex items-center gap-1"
          >
            ← Volver
          </button>
          <div className="text-center">
            <p className="font-mono text-xs text-green-300">{claveCata}</p>
            <p className="text-xs text-green-200">{alumno || 'Encuesta completada'}</p>
          </div>
          <span className="px-2 py-0.5 bg-green-600 rounded-full text-xs text-green-100">
            Completada
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {SECCIONES.map(sec => (
          <div key={sec.titulo} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-green-50 border-b border-green-100 px-4 py-2">
              <h3 className="font-semibold text-green-800 text-sm">{sec.titulo}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {sec.campos.map(campo => (
                <div key={campo.key} className="px-4 py-2.5 flex flex-col gap-0.5">
                  <p className="text-xs text-gray-400 leading-tight">{campo.label}</p>
                  <div className="text-sm">
                    <Valor campo={campo} encuesta={encuesta} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {esAdmin && (
          <div className="bg-white rounded-xl shadow-sm p-4 text-xs text-gray-400 space-y-1">
            <p><span className="font-medium text-gray-600">Predio ID:</span> {predioId}</p>
            <p><span className="font-medium text-gray-600">Enviado:</span> {encuesta.enviada_en ? new Date(encuesta.enviada_en).toLocaleString('es-EC') : '—'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
