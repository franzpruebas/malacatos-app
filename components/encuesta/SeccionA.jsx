// SECCIÓN A — Identificación y geolocalización (preguntas 1–7)
import { useState } from 'react'
import { NavBotones, RadioGroup, Campo } from './ui'

const SECTORES = [
  'Ceibopamba','La Calera','Country Club','San Francisco',
  'Landangui','Cabeanga','San José Bajo','San José Alto','Taxiche',
]

const TIPOS_VIA = [
  { value: 'pavimentada', label: 'Vía pavimentada / asfalto' },
  { value: 'lastre',      label: 'Vía lastre / afirmado' },
  { value: 'tierra',      label: 'Camino de tierra / herradura' },
  { value: 'sendero',     label: 'Sendero peatonal' },
]

const ANTIGUEDAD = [
  { value: 'menos_5', label: 'Menos de 5 años (2020–2026)' },
  { value: '5_10',    label: '5–10 años (2015–2019)' },
  { value: '11_15',   label: '11–15 años (2010–2014)' },
  { value: '16_20',   label: '16–20 años (2005–2009)' },
  { value: 'mas_20',  label: 'Más de 20 años (anterior a 2005)' },
]

export default function SeccionA({ register, setValue, errors, onSiguiente, guardando }) {
  const [obteniendo, setObteniendo] = useState(false)

  function capturarGPS() {
    if (!navigator.geolocation) return
    setObteniendo(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('p03_latitud',  parseFloat(pos.coords.latitude.toFixed(6)))
        setValue('p03_longitud', parseFloat(pos.coords.longitude.toFixed(6)))
        setObteniendo(false)
      },
      () => setObteniendo(false),
      { enableHighAccuracy: true }
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">
        A — Identificación y geolocalización
      </h2>

      {/* P1 */}
      <Campo label="1. Código de ficha" error={errors.p01_codigo_ficha}>
        <input
          {...register('p01_codigo_ficha', { required: 'Requerido' })}
          className="input"
          placeholder="Clave catastral"
          readOnly
        />
      </Campo>

      {/* P2 */}
      <Campo label="2. Nombre del observador" error={errors.p02_nombre_observador}>
        <input
          {...register('p02_nombre_observador', { required: 'Requerido' })}
          className="input"
          placeholder="Tu nombre completo"
        />
      </Campo>

      {/* P3 GPS */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          3. Coordenadas GPS <span className="text-red-500">*</span>
        </p>
        <button
          type="button"
          onClick={capturarGPS}
          disabled={obteniendo}
          className="w-full border-2 border-dashed border-green-400 rounded-xl py-3 text-green-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-50"
        >
          {obteniendo ? '⏳ Obteniendo GPS...' : '📍 Capturar ubicación actual'}
        </button>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Campo label="Latitud" error={errors.p03_latitud}>
            <input
              {...register('p03_latitud', { required: 'Requerido', valueAsNumber: true })}
              type="number" step="0.000001" className="input" placeholder="-4.220000"
            />
          </Campo>
          <Campo label="Longitud" error={errors.p03_longitud}>
            <input
              {...register('p03_longitud', { required: 'Requerido', valueAsNumber: true })}
              type="number" step="0.000001" className="input" placeholder="-79.220000"
            />
          </Campo>
        </div>
      </div>

      {/* P4 */}
      <Campo label="4. Distancia al centro urbano de Malacatos (km)" error={errors.p04_distancia_centro_km}>
        <input
          {...register('p04_distancia_centro_km', { required: 'Requerido', valueAsNumber: true, min: 0 })}
          type="number" step="0.1" min="0" className="input" placeholder="2.5"
        />
        <p className="text-xs text-gray-400 mt-1">Calcular via Google Maps desde el punto GPS</p>
      </Campo>

      {/* P5 Sector */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">5. Sector o barrio <span className="text-red-500">*</span></p>
        <div className="grid grid-cols-2 gap-2">
          {SECTORES.map(s => (
            <label key={s} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
              <input type="radio" value={s} {...register('p05_sector', { required: true })} className="accent-green-700" />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* P6 Tipo vía */}
      <RadioGroup
        label="6. Tipo de vía de acceso principal"
        name="p06_tipo_via"
        opciones={TIPOS_VIA}
        register={register}
        requerido
      />

      {/* P7 Antigüedad */}
      <RadioGroup
        label="7. Antigüedad estimada de construcción"
        name="p07_antiguedad"
        opciones={ANTIGUEDAD}
        register={register}
        requerido
      />

      <NavBotones onSiguiente={onSiguiente} guardando={guardando} />
    </div>
  )
}
