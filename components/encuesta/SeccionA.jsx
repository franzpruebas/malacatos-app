// SECCIÓN A — Identificación y geolocalización (preguntas 1–7)
import { useState, useEffect } from 'react'
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

export default function SeccionA({ register, watch, setValue, errors, onSiguiente, guardando }) {
  const [obteniendo,   setObteniendo]   = useState(false)
  const [sectorRadio,  setSectorRadio]  = useState('')
  const [sectorOtro,   setSectorOtro]   = useState('')

  const lat = watch('p03_latitud')
  const lon = watch('p03_longitud')

  // Al cargar borrador: detectar si p05_sector es un valor personalizado
  useEffect(() => {
    const saved = watch('p05_sector')
    if (!saved) return
    if (SECTORES.includes(saved)) {
      setSectorRadio(saved)
    } else {
      setSectorRadio('__otro__')
      setSectorOtro(saved)
    }
  }, []) // solo al montar

  function handleSectorChange(valor) {
    setSectorRadio(valor)
    if (valor !== '__otro__') {
      setValue('p05_sector', valor)
      setSectorOtro('')
    } else {
      setValue('p05_sector', '')   // vacío hasta que el usuario escriba
    }
  }

  function handleSectorOtroChange(texto) {
    setSectorOtro(texto)
    setValue('p05_sector', texto)
  }

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
      <h2 className="text-lg font-bold text-gray-800">A — Identificación y geolocalización</h2>

      {/* P1 */}
      <Campo label="1. Código de ficha" error={errors.p01_codigo_ficha}>
        <input
          {...register('p01_codigo_ficha', { required: 'Requerido' })}
          className="input bg-gray-50"
          readOnly
        />
      </Campo>

      {/* P2 — nombre automático del alumno/admin, no editable */}
      <Campo label="2. Nombre del observador">
        <input
          {...register('p02_nombre_observador', { required: 'Requerido' })}
          className="input bg-gray-50 text-gray-600"
          readOnly
        />
      </Campo>

      {/* P3 — Coordenadas (centroide pre-rellenado) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          3. Coordenadas geográficas <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-400 mb-2">
          Centroide del predio catastral. Pulsa el botón para reemplazar con tu posición GPS.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
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
        {lat && lon && (
          <p className="text-xs text-green-700 mb-2">
            📍 {Number(lat).toFixed(6)}, {Number(lon).toFixed(6)}
          </p>
        )}
        <button
          type="button" onClick={capturarGPS} disabled={obteniendo}
          className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-gray-500 text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          {obteniendo ? '⏳ Obteniendo GPS...' : '📍 Reemplazar con mi posición GPS (opcional)'}
        </button>
      </div>

      {/* P4 */}
      <Campo label="4. Distancia al centro urbano de Malacatos (km)" error={errors.p04_distancia_centro_km}>
        <input
          {...register('p04_distancia_centro_km', { required: 'Requerido', valueAsNumber: true, min: 0 })}
          type="number" step="0.1" min="0" className="input" placeholder="2.5"
        />
        <p className="text-xs text-gray-400 mt-1">Calcular via Google Maps desde el punto GPS</p>
      </Campo>

      {/* P5 — Sector con opción Otro */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          5. Sector o barrio <span className="text-red-500">*</span>
        </p>
        {/* campo oculto registrado para validación */}
        <input type="hidden" {...register('p05_sector', { required: true })} />
        <div className="grid grid-cols-2 gap-2">
          {SECTORES.map(s => (
            <label
              key={s}
              className={`flex items-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-pointer
                ${sectorRadio === s ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}
            >
              <input
                type="radio"
                value={s}
                checked={sectorRadio === s}
                onChange={() => handleSectorChange(s)}
                className="accent-green-700"
              />
              <span className="text-sm">{s}</span>
            </label>
          ))}
          {/* Opción Otro */}
          <label
            className={`flex items-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-pointer col-span-2
              ${sectorRadio === '__otro__' ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}
          >
            <input
              type="radio"
              value="__otro__"
              checked={sectorRadio === '__otro__'}
              onChange={() => handleSectorChange('__otro__')}
              className="accent-green-700"
            />
            <span className="text-sm">Otro</span>
          </label>
        </div>

        {sectorRadio === '__otro__' && (
          <input
            type="text"
            value={sectorOtro}
            onChange={e => handleSectorOtroChange(e.target.value)}
            placeholder="Escribe el nombre del sector o barrio"
            className="input mt-2"
            autoFocus
          />
        )}
        {errors.p05_sector && (
          <p className="text-xs text-red-500 mt-1">Selecciona un sector</p>
        )}
      </div>

      {/* P6 */}
      <RadioGroup
        label="6. Tipo de vía de acceso principal"
        name="p06_tipo_via"
        opciones={TIPOS_VIA}
        register={register}
        requerido
      />

      {/* P7 */}
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
