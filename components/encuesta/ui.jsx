// Componentes UI reutilizables para el formulario de encuesta

export function Campo({ label, error, children }) {
  return (
    <div>
      {label && <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error.message || 'Requerido'}</p>}
    </div>
  )
}

export function RadioGroup({ label, name, opciones, register, requerido }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">
        {label} {requerido && <span className="text-red-500">*</span>}
      </p>
      <div className="space-y-2">
        {opciones.map(op => (
          <label
            key={op.value}
            className="flex items-start gap-3 bg-white border rounded-xl px-3 py-2.5 cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-500"
          >
            <input
              type="radio"
              value={op.value}
              {...register(name, requerido ? { required: true } : {})}
              className="mt-0.5 accent-green-700 flex-shrink-0"
            />
            <span className="text-sm leading-snug">{op.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function CheckboxGroup({ label, name, opciones, register }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="space-y-2">
        {opciones.map(op => (
          <label
            key={op.value}
            className="flex items-start gap-3 bg-white border rounded-xl px-3 py-2.5 cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-500"
          >
            <input
              type="checkbox"
              value={op.value}
              {...register(name)}
              className="mt-0.5 accent-green-700 flex-shrink-0"
            />
            <span className="text-sm leading-snug">{op.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function EscalaLikert({ label, name, register, anclas, requerido }) {
  // anclas: array de 5 strings descriptivos, uno por valor
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">
        {label} {requerido && <span className="text-red-500">*</span>}
      </p>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((n, i) => (
          <label
            key={n}
            className="flex items-start gap-3 bg-white border rounded-xl px-3 py-2.5 cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-500"
          >
            <input
              type="radio"
              value={n}
              {...register(name, requerido ? { required: true, valueAsNumber: true } : { valueAsNumber: true })}
              className="mt-0.5 accent-green-700 flex-shrink-0"
            />
            <span className="text-sm leading-snug">
              <strong>{n}</strong> — {anclas?.[i] || ''}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function NavBotones({ onAtras, onSiguiente, onEnviar, guardando, enviando }) {
  return (
    <div className="flex gap-3 pt-4 pb-8">
      {onAtras && (
        <button
          type="button"
          onClick={onAtras}
          className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 font-medium"
        >
          ← Atrás
        </button>
      )}
      {onSiguiente && (
        <button
          type="button"
          onClick={onSiguiente}
          disabled={guardando}
          className="flex-1 bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Siguiente →'}
        </button>
      )}
      {onEnviar && (
        <button
          type="button"
          onClick={onEnviar}
          disabled={enviando}
          className="flex-1 bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar encuesta ✓'}
        </button>
      )}
    </div>
  )
}
