// SECCIÓN G — Relación con el territorio y amenidades (preguntas 33–35)
import { RadioGroup, Campo, NavBotones } from './ui'

const TOPOGRAFIA = [
  { value: 'plano',               label: 'Terreno plano (< 5% de pendiente estimada)' },
  { value: 'ladera_suave',        label: 'Ladera suave (5–15%)' },
  { value: 'ladera_pronunciada',  label: 'Ladera pronunciada (> 15%)' },
  { value: 'borde_quebrada',      label: 'Borde de quebrada o talud' },
  { value: 'terraza_artificial',  label: 'Terraza artificial sobre talud' },
]

const AMENIDADES = [
  { value: 'vista_panoramica', label: 'Vista panorámica de valle o montaña (orientación E/O)' },
  { value: 'rio_quebrada',     label: 'Río, quebrada o cuerpo de agua cercano (≤ 200 m)' },
  { value: 'bosque',           label: 'Bosque o masa vegetal densa en primer plano visual' },
  { value: 'agroecologica',    label: 'Área agroecológica / cultivos como paisaje de fondo' },
  { value: 'nucleo_urbano',    label: 'Vista hacia núcleo urbano o luces de Malacatos (amenidad nocturna)' },
  { value: 'ninguna',          label: 'Ninguna amenidad paisajística evidente' },
]

export default function SeccionG({ register, errors, onAtras, onEnviar, enviando }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">G — Relación con el territorio y amenidades</h2>

      <RadioGroup
        label="33. Relación de la vivienda con la topografía del terreno"
        name="p33_topografia"
        opciones={TOPOGRAFIA}
        register={register}
        requerido
      />

      <RadioGroup
        label="34. Amenidad paisajística predominante visible desde la vivienda"
        name="p34_amenidad"
        opciones={AMENIDADES}
        register={register}
        requerido
      />

      <Campo label="35. Observaciones cualitativas del observador" error={errors.p35_observaciones}>
        <textarea
          {...register('p35_observaciones')}
          rows={4}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="Registrar elementos no capturados por el formulario: singularidades morfológicas, conflictos de uso, contexto excepcional, dudas sobre alguna pregunta..."
        />
      </Campo>

      {/* Recordatorio antes de enviar */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ Antes de enviar</p>
        <p>Una vez enviada la encuesta no podrás editarla. Verificá que todas las respuestas sean correctas.</p>
      </div>

      <NavBotones onAtras={onAtras} onEnviar={onEnviar} enviando={enviando} />
    </div>
  )
}
