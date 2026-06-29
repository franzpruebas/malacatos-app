'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function PanelAdmin({ stats, prediosActivos, adminId }) {
  const router = useRouter()
  const supabase = createClient()
  const [liberando, setLiberando] = useState(null)
  const [filtro, setFiltro] = useState('todos')

  async function liberarPredio(predioId) {
    setLiberando(predioId)
    await supabase.rpc('admin_liberar_predio', { predio_id: predioId })
    setLiberando(null)
    router.refresh()
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const prediosFiltrados = filtro === 'todos'
    ? prediosActivos
    : prediosActivos.filter(p => p.estado === filtro)

  return (
    <div className="min-h-screen bg-gray-50" style={{ overflow: 'auto' }}>

      {/* Header */}
      <div className="bg-green-800 text-white px-4 py-4 shadow">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Panel Administrador</h1>
            <p className="text-green-300 text-sm">Malacatos — Levantamiento territorial</p>
          </div>
          <button onClick={cerrarSesion} className="text-green-200 text-sm hover:text-white">
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total predios',  valor: stats?.total_predios, color: 'bg-gray-100 text-gray-800' },
            { label: 'Libres',         valor: stats?.libres,        color: 'bg-gray-200 text-gray-700' },
            { label: 'En proceso',     valor: stats?.en_proceso,    color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Completados',    valor: stats?.completados,   color: 'bg-green-100 text-green-800' },
          ].map(t => (
            <div key={t.label} className={`rounded-xl p-4 ${t.color}`}>
              <p className="text-2xl font-bold">{t.valor ?? '—'}</p>
              <p className="text-xs mt-1">{t.label}</p>
            </div>
          ))}
        </div>

        {/* Progreso por paralelo */}
        {stats?.por_paralelo && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">Progreso por paralelo</h2>
            <div className="grid grid-cols-2 gap-4">
              {stats.por_paralelo.map(p => {
                const pct = p.total_asignadas > 0
                  ? Math.round((p.completadas / p.total_asignadas) * 100)
                  : 0
                return (
                  <div key={p.paralelo}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Paralelo {p.paralelo}</span>
                      <span className="text-gray-500">{p.completadas} / {p.total_asignadas}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-green-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{pct}% completado</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tabla por alumno */}
        {stats?.por_alumno && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <h2 className="font-semibold text-gray-800 px-4 py-3 border-b">Avance por alumno</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Alumno</th>
                    <th className="px-4 py-2 text-center">Par.</th>
                    <th className="px-4 py-2 text-center">En proceso</th>
                    <th className="px-4 py-2 text-center">Completadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.por_alumno.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-800">
                        {a.nombre.split(' ').slice(0, 3).join(' ')}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-500">{a.paralelo}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${a.en_proceso > 0 ? 'bg-yellow-100 text-yellow-700' : 'text-gray-300'}`}>
                          {a.en_proceso}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${a.completadas > 0 ? 'bg-green-100 text-green-700' : 'text-gray-300'}`}>
                          {a.completadas}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabla de predios activos con acción de liberar */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">Predios asignados</h2>
            <select
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="text-sm border rounded-lg px-2 py-1 text-gray-600"
            >
              <option value="todos">Todos</option>
              <option value="en_proceso">En proceso</option>
              <option value="completado">Completados</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Clave catastral</th>
                  <th className="px-4 py-2 text-left">Alumno</th>
                  <th className="px-4 py-2 text-center">Estado</th>
                  <th className="px-4 py-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prediosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{p.clave_cata}</td>
                    <td className="px-4 py-2">
                      <span className="text-gray-800">
                        {p.profiles?.nombre?.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">({p.profiles?.paralelo})</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.estado === 'completado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.estado === 'completado' ? 'Completado' : 'En proceso'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {p.estado === 'en_proceso' && (
                        <button
                          onClick={() => liberarPredio(p.id)}
                          disabled={liberando === p.id}
                          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 underline"
                        >
                          {liberando === p.id ? 'Liberando...' : 'Liberar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {prediosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      No hay predios en este estado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
