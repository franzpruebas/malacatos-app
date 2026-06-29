// SECCIÓN B — Morfología arquitectónica (preguntas 8–17)
import { RadioGroup, EscalaLikert, NavBotones } from './ui'

const TIPOLOGIAS = [
  { value: 'quinta',               label: 'Quinta vacacional (1.000–2.000 m², piscina, BBQ, portón)' },
  { value: 'residencia_turistica', label: 'Residencia turística dispersa (2.500–5.000 m², ladera/quebrada)' },
  { value: 'urbanizacion_cerrada', label: 'Urbanización cerrada / conjunto planificado (1.000–2.500 m²/lote)' },
  { value: 'gremial',             label: 'Vivienda gremial / cooperativa (lotes 200–500 m², morfología en serie)' },
  { value: 'tradicional',         label: 'Vivienda tradicional adaptada (con función productiva visible)' },
  { value: 'cabana',              label: 'Cabaña / construcción de baja permanencia (materiales ligeros)' },
]

const IMPLANTACION = [
  { value: 'aislada',           label: 'Aislada de todos los linderos (retiros perimetrales visibles)' },
  { value: 'adosada_lateral',   label: 'Adosada lateral (≤ 1 lindero lateral)' },
  { value: 'adosada_posterior', label: 'Adosada posterior' },
  { value: 'dispersas',         label: 'Varias edificaciones dispersas en el lote' },
  { value: 'no_determinable',   label: 'No determinable desde punto de observación' },
]

const PISOS = [
  { value: '1',    label: '1 piso' },
  { value: '2',    label: '2 pisos' },
  { value: '3',    label: '3 pisos' },
  { value: '4_mas',label: '4 o más pisos' },
]

const AREAS = [
  { value: 'hasta_80', label: 'Hasta 80 m²' },
  { value: '81_150',   label: '81–150 m²' },
  { value: '151_300',  label: '151–300 m²' },
  { value: '301_500',  label: '301–500 m²' },
  { value: 'mas_500',  label: 'Más de 500 m²' },
]

const MATERIALES = [
  { value: 'hormigon_enlucido', label: 'Hormigón armado / bloque enlucido' },
  { value: 'bloque_visto',      label: 'Bloque visto sin enlucir' },
  { value: 'madera_bambu',      label: 'Madera o bambú estructural' },
  { value: 'piedra',            label: 'Piedra' },
  { value: 'mixto',             label: 'Mixto contemporáneo (hormigón + madera + vidrio)' },
  { value: 'vernacular',        label: 'Materiales locales vernáculos' },
]

const PRODUCCION = [
  { value: 'autor',           label: 'Diseño arquitectónico de autor / encargado a profesional' },
  { value: 'estandarizada',   label: 'Construcción estandarizada / catálogo' },
  { value: 'autoconstruccion',label: 'Autoconstrucción por fases (visible irregularidad formal)' },
  { value: 'utilitaria',      label: 'Vivienda utilitaria / sin aspiración estética evidente' },
  { value: 'otro',            label: 'Otro' },
]

const ANCLAS_ARTIFICIALIZACION = [
  'Predominio natural: >80% vegetal, sin pavimentos ni jardines formales',
  'Baja artificialización: 60–80% vegetal, sin jardín ornamental',
  'Artificialización moderada: 40–60% vegetal, jardín parcialmente ornamental',
  'Alta artificialización: <40% vegetal, pavimentos, jardines formales',
  'Predominio artificial: superficie casi totalmente impermeabilizada',
]

const ANCLAS_COBERTURA = [
  'Predominio construido: cobertura vegetal <10%',
  'Vegetación escasa: 10–30%',
  'Cobertura moderada: 31–60%',
  'Alta cobertura: 61–80%',
  'Predominio vegetal: >80%',
]

const ANCLAS_INTEGRACION = [
  'Muy integrada: materiales, colores y escala coherentes con el paisaje rural',
  'Integración alta: leves contrastes, predomina la integración',
  'Integración moderada: contraste parcial visible',
  'Contraste evidente: materiales o escala ajenos al entorno rural',
  'Muy contrastante: ruptura total del paisaje',
]

const ANCLAS_DOMINANCIA = [
  'Poco o nada visible desde vía pública',
  'Baja presencia: visible pero no prominente',
  'Presencia moderada: elemento reconocible del paisaje',
  'Alta presencia: referente visual claro en el entorno',
  'Dominante: hito visual que subordina el entorno inmediato',
]

export default function SeccionB({ register, errors, onSiguiente, onAtras, guardando }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">B — Morfología arquitectónica</h2>
      <p className="text-xs text-gray-500">Características observables desde vía pública.</p>

      <RadioGroup label="8. Tipología edificatoria observable" name="p08_tipologia" opciones={TIPOLOGIAS} register={register} requerido />
      <RadioGroup label="9. Implantación de la vivienda dentro del lote" name="p09_implantacion" opciones={IMPLANTACION} register={register} requerido />
      <RadioGroup label="10. Número de pisos sobre nivel de suelo" name="p10_num_pisos" opciones={PISOS} register={register} requerido />
      <RadioGroup label="11. Área aproximada de construcción (m²)" name="p11_area_construccion" opciones={AREAS} register={register} requerido />
      <RadioGroup label="12. Material predominante en fachada observable" name="p12_material_fachada" opciones={MATERIALES} register={register} requerido />
      <RadioGroup label="13. Tipo de producción arquitectónica predominante" name="p13_produccion" opciones={PRODUCCION} register={register} requerido />

      <EscalaLikert label="14. Nivel de artificialización del predio" name="p14_artificializacion" register={register} anclas={ANCLAS_ARTIFICIALIZACION} requerido />
      <EscalaLikert label="15. Cobertura vegetal observable del lote" name="p15_cobertura_vegetal" register={register} anclas={ANCLAS_COBERTURA} requerido />
      <EscalaLikert label="16. Nivel de integración visual con el entorno rural" name="p16_integracion_visual" register={register} anclas={ANCLAS_INTEGRACION} requerido />
      <EscalaLikert label="17. Dominancia visual de la vivienda en el paisaje" name="p17_dominancia_visual" register={register} anclas={ANCLAS_DOMINANCIA} requerido />

      <NavBotones onAtras={onAtras} onSiguiente={onSiguiente} guardando={guardando} />
    </div>
  )
}
