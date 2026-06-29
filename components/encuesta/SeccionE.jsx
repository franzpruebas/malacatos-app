// SECCIÓN E — Infraestructura y presión urbanizadora (preguntas 25–27)
import { CheckboxGroup, NavBotones } from './ui'

const SERVICIOS_BASICOS = [
  { value: 'agua',          label: 'Red de agua potable (acometida visible)' },
  { value: 'electricidad',  label: 'Red eléctrica (contador o acometida)' },
  { value: 'internet',      label: 'Antena de internet / fibra óptica visible' },
  { value: 'alcantarillado',label: 'Red de alcantarillado' },
  { value: 'pozo_septico',  label: 'Pozo séptico (tapas o ventilación visibles)' },
  { value: 'tanque',        label: 'Tanque elevado o cisterna' },
  { value: 'panel_solar',   label: 'Panel solar u otra fuente autónoma' },
  { value: 'ninguno',       label: 'Ninguno observable' },
]

const INFRAESTRUCTURA_RECIENTE = [
  { value: 'caminos',       label: 'Nuevos caminos o vías de acceso' },
  { value: 'postes',        label: 'Nuevos postes o tendido eléctrico' },
  { value: 'acometidas',    label: 'Nuevas acometidas domiciliarias' },
  { value: 'senaletica',    label: 'Señalética inmobiliaria activa' },
  { value: 'no_visible',    label: 'No visible' },
]

const URBANIZACION_ENTORNO = [
  { value: 'movimiento_tierras', label: 'Movimiento de tierras activo o reciente' },
  { value: 'cerramientos',       label: 'Nuevos cerramientos o lotización visible' },
  { value: 'construcciones',     label: 'Construcciones en proceso' },
  { value: 'parcelacion',        label: 'Parcelación reciente (lotes nuevos sin construir)' },
  { value: 'instalaciones',      label: 'Instalaciones eléctricas para nuevas edificaciones' },
  { value: 'ninguna',            label: 'Ninguna evidente' },
]

export default function SeccionE({ register, onSiguiente, onAtras, guardando }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">E — Infraestructura y presión urbanizadora</h2>
      <p className="text-xs text-gray-500">Variables de dotación e indicadores de urbanización reciente.</p>

      <CheckboxGroup
        label="25. Servicios básicos visibles en el predio (marcar todos los observables)"
        name="p25_servicios_basicos"
        opciones={SERVICIOS_BASICOS}
        register={register}
      />

      <CheckboxGroup
        label="26. Evidencia de infraestructura instalada recientemente (≤ 5 años estimados)"
        name="p26_infraestructura_reciente"
        opciones={INFRAESTRUCTURA_RECIENTE}
        register={register}
      />

      <CheckboxGroup
        label="27. Evidencia de procesos de urbanización reciente en el entorno inmediato (radio ≈ 300 m)"
        name="p27_urbanizacion_entorno"
        opciones={URBANIZACION_ENTORNO}
        register={register}
      />

      <NavBotones onAtras={onAtras} onSiguiente={onSiguiente} guardando={guardando} />
    </div>
  )
}
