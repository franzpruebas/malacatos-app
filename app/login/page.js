'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [cedula, setCedula] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const email = cedula === 'admin'
      ? 'admin@malacatos.local'
      : `${cedula}@malacatos.local`

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Cédula o contraseña incorrecta')
      setLoading(false)
      return
    }

    // Verificar rol para redirigir al destino correcto
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', (await supabase.auth.getUser()).data.user.id)
      .single()

    router.push(profile?.role === 'admin' ? '/admin' : '/mapa')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-4" style={{ overflow: 'auto' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">

        {/* Logo / título */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🗺️</div>
          <h1 className="text-2xl font-bold text-green-800">Malacatos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Levantamiento de segundas viviendas
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de cédula
            </label>
            <input
              type="text"
              inputMode="text"
              maxLength={10}
              value={cedula}
              onChange={e => setCedula(e.target.value.replace(/[^0-9a-z]/gi, ''))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0000000000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (cedula !== 'admin' && cedula.length !== 10)}
            className="w-full bg-green-700 text-white rounded-xl px-4 py-3 font-semibold text-base hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          La contraseña inicial es tu número de cédula
        </p>
      </div>
    </main>
  )
}
