// SECCIÓN C — Morfología del ocio privado / Índice IIR (preguntas 18–20)
import { CheckboxGroup, RadioGroup, NavBotones } from './ui'

const ELEMENTOS_RECREATIVOS = [
  { value: 'piscina',       label: 'Piscina (exterior visible)' },
  { value: 'bbq',           label: 'Área BBQ, quincho, pérgola o ramada' },
  { value: 'jardin',        label: 'Jardín ornamental de diseño (no solo césped)' },
  { value: 'cancha',        label: 'Cancha deportiva (cualquier tipo)' },
  { value: 'parqueadero',   label: 'Parqueadero cubierto o descubierto para ≥ 2 vehículos' },
  { value: 'terraza',       label: 'Terraza o mirador con equipamiento' },
  { value: 'juegos',        label: 'Área de juegos infantiles' },
  { value: 'ninguno',       label: 'Ninguno observable' },
]

const PROPORCION_OCIO = [
  { value: 'menos_10',       label: 'Menos del 10% del lote' },
  { value: '10_25',          label: '10–25% del lote' },
  { value: '26_50',          label: '26–50% del lote' },
  { value: 'mas_50',         label: 'Más del 50% del lote' },
  { value: 'no_determinable',label: 'No determinable' },
]

const SENALES_USO = [
  { value: 'evidencia_clara', label: 'Evidencia clara de uso reciente o actual' },
  { value: 'ambigua',         label: 'Señales ambiguas / parciales' },
  { value: 'sin_senales',     label: 'Sin señales de uso reciente (aspecto de abandono temporal)' },
  { value: 'no_determinable', label: 'No determinable' },
]

export default function SeccionC({ register, onSiguiente, onAtras, guardando }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">C — Morfología del ocio privado</h2>
      <p className="text-xs text-gray-500">
        Variables para calcular el Índice de Intensidad Recreativa (IIR).
      </p>

      <CheckboxGroup
        label="18. Elementos recreativos observables (marcar todos los visibles)"
        name="p18_elementos_recreativos"
        opciones={ELEMENTOS_RECREATIVOS}
        register={register}
      />

      <RadioGroup
        label="19. Proporción estimada del lote destinada a ocio y recreación"
        name="p19_proporcion_ocio"
        opciones={PROPORCION_OCIO}
        register={register}
        requerido
      />

      <RadioGroup
        label="20. Señales de uso reciente observable"
        name="p20_senales_uso"
        opciones={SENALES_USO}
        register={register}
        requerido
      />

      <NavBotones onAtras={onAtras} onSiguiente={onSiguiente} guardando={guardando} />
    </div>
  )
}
