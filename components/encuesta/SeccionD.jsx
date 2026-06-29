// SECCIÓN D — Cerramiento y privatización / Índice IP (preguntas 21–24)
import { EscalaLikert, RadioGroup, NavBotones } from './ui'

const ANCLAS_CERRAMIENTO = [
  'Sin cerramiento',
  'Cerca vegetal o estacas de madera',
  'Reja metálica (≤ 1.5 m)',
  'Muro bajo (≤ 1.5 m) de bloque, ladrillo u hormigón',
  'Muro alto (> 1.5 m) con o sin remate de seguridad',
]

const ANCLAS_CONTROL = [
  'Sin control: acceso libre y abierto',
  'Portón sin seguridad adicional (abierto o sin cerradura visible)',
  'Portón con cerradura o candado',
  'Acceso restringido con intercomunicador o cámara',
  'Garita de vigilancia o sistema de control activo',
]

const ANCLAS_PRIVATIZACION = [
  'Completamente abierta y visible desde vía pública',
  'Mayormente visible con elementos de privatización incipientes',
  'Parcialmente visible (cerramiento opaco en uno o dos frentes)',
  'Alta privatización: solo fachada o nada visible',
  'Completamente cerrada: ninguna vista interior desde vía pública',
]

const APROPIACION = [
  { value: 'si_evidente',   label: 'Sí, evidencia clara y visible' },
  { value: 'parcial',       label: 'Parcialmente visible / presunción razonable' },
  { value: 'no',            label: 'No' },
  { value: 'no_determinable',label: 'No determinable' },
]

export default function SeccionD({ register, onSiguiente, onAtras, guardando }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">D — Cerramiento y privatización</h2>
      <p className="text-xs text-gray-500">Variables para calcular el Índice de Privatización (IP).</p>

      <EscalaLikert label="21. Tipo de cerramiento perimetral" name="p21_cerramiento" register={register} anclas={ANCLAS_CERRAMIENTO} requerido />
      <EscalaLikert label="22. Sistema de control de acceso vehicular y peatonal" name="p22_control_acceso" register={register} anclas={ANCLAS_CONTROL} requerido />
      <EscalaLikert label="23. Nivel de privatización visual del predio" name="p23_privatizacion_visual" register={register} anclas={ANCLAS_PRIVATIZACION} requerido />

      <RadioGroup
        label="24. Evidencia de apropiación o restricción de bienes de uso público"
        name="p24_apropiacion_bienes"
        opciones={APROPIACION}
        register={register}
        requerido
      />

      <NavBotones onAtras={onAtras} onSiguiente={onSiguiente} guardando={guardando} />
    </div>
  )
}
