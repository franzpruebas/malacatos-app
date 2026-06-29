'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import maplibregl from 'maplibre-gl'
import { createClient } from '@/lib/supabase-browser'

const COLOR_ESTADO = {
  libre:             '#9E9E9E',
  en_proceso_propio: '#FFC107',
  en_proceso_otro:   '#F44336',
  completado:        '#4CAF50',
}

export default function MapaInteractivo({ usuario, perfil }) {
  const mapRef   = useRef(null)
  const mapInst  = useRef(null)
  const markerRef = useRef(null)
  const router   = useRouter()
  const supabase = createClient()

  const [cargando, setCargando] = useState(false)
  const [mensaje,  setMensaje]  = useState(null)
  const [zoom,     setZoom]     = useState(13)

  // WebGL no disponible (VMs, sesiones remotas, browsers sin GPU)
  if (!maplibregl.supported()) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
          <p className="text-4xl mb-4">🗺️</p>
          <h2 className="font-bold text-gray-800 text-lg mb-2">Mapa no disponible</h2>
          <p className="text-sm text-gray-500">
            Este dispositivo o navegador no soporta WebGL, necesario para mostrar el mapa interactivo.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Abre la app desde <strong>Chrome o Safari en un celular</strong> para el levantamiento de campo.
          </p>
          <button
            onClick={async () => { await createClient().auth.signOut(); router.push('/login') }}
            className="mt-6 text-sm text-gray-400 underline"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  // ── Cargar predios según viewport ───────────────────────────
  const cargarPredios = useCallback(async () => {
    const map = mapInst.current
    if (!map) return
    const z = map.getZoom()
    setZoom(z)
    if (z < 13) return          // demasiado alejado, no cargar

    const b = map.getBounds()
    setCargando(true)

    const { data, error } = await supabase.rpc('get_predios_viewport', {
      p_xmin: b.getWest(),
      p_ymin: b.getSouth(),
      p_xmax: b.getEast(),
      p_ymax: b.getNorth(),
    })

    if (error) { setCargando(false); return }

    const features = (data || []).map((p, idx) => ({
      type: 'Feature',
      id: idx,
      geometry: p.geom_json,
      properties: {
        id:         p.id,
        clave_cata: p.clave_cata,
        tipo_predi: p.tipo_predi,
        estado:     p.estado,
        estado_visual:
          p.estado === 'en_proceso'
            ? (p.alumno_id === usuario.id ? 'en_proceso_propio' : 'en_proceso_otro')
            : p.estado,
      },
    }))

    const source = map.getSource('predios')
    if (source) source.setData({ type: 'FeatureCollection', features })
    setCargando(false)
  }, [supabase, usuario])

  // ── Inicializar mapa ─────────────────────────────────────────
  useEffect(() => {
    if (mapInst.current) return

    mapInst.current = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Esri World Imagery',
          },
        },
        layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [-79.22, -4.22],
      zoom: 13,
    })

    mapInst.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    mapInst.current.on('load', () => {
      mapInst.current.addSource('predios', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      mapInst.current.addLayer({
        id: 'predios-fill',
        type: 'fill',
        source: 'predios',
        paint: {
          'fill-color': [
            'match', ['get', 'estado_visual'],
            'libre',             COLOR_ESTADO.libre,
            'en_proceso_propio', COLOR_ESTADO.en_proceso_propio,
            'en_proceso_otro',   COLOR_ESTADO.en_proceso_otro,
            'completado',        COLOR_ESTADO.completado,
            '#CCCCCC',
          ],
          'fill-opacity': 0.55,
        },
      })

      mapInst.current.addLayer({
        id: 'predios-outline',
        type: 'line',
        source: 'predios',
        paint: { 'line-color': '#ffffff', 'line-width': 0.8, 'line-opacity': 0.6 },
      })

      mapInst.current.addLayer({
        id: 'predios-hover',
        type: 'fill',
        source: 'predios',
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.25, 0],
        },
      })

      // Cargar predios al iniciar
      cargarPredios()
    })

    // Recargar al mover o cambiar zoom
    mapInst.current.on('moveend', cargarPredios)

    // Hover
    let hoveredId = null
    mapInst.current.on('mousemove', 'predios-fill', (e) => {
      if (hoveredId !== null)
        mapInst.current.setFeatureState({ source: 'predios', id: hoveredId }, { hover: false })
      hoveredId = e.features[0].id
      mapInst.current.setFeatureState({ source: 'predios', id: hoveredId }, { hover: true })
      mapInst.current.getCanvas().style.cursor = 'pointer'
    })
    mapInst.current.on('mouseleave', 'predios-fill', () => {
      if (hoveredId !== null) {
        mapInst.current.setFeatureState({ source: 'predios', id: hoveredId }, { hover: false })
        hoveredId = null
      }
      mapInst.current.getCanvas().style.cursor = ''
    })

    return () => mapInst.current?.remove()
  }, [cargarPredios])

  // ── Click en predio ──────────────────────────────────────────
  useEffect(() => {
    const map = mapInst.current
    if (!map) return

    const handleClick = async (e) => {
      if (!e.features?.length) return
      const { id, clave_cata, estado_visual } = e.features[0].properties

      if (estado_visual === 'completado') {
        mostrarMensaje(`Predio ${clave_cata} ya fue levantado`, 'verde')
        return
      }
      if (estado_visual === 'en_proceso_otro') {
        mostrarMensaje('Este predio está siendo levantado por otro alumno', 'rojo')
        return
      }
      if (estado_visual === 'en_proceso_propio') {
        router.push(`/encuesta/${id}`)
        return
      }

      // Libre → asignar
      setCargando(true)
      const { data: resultado, error } = await supabase.rpc('asignar_predio', { predio_id: id })
      if (error || resultado !== 'ok') {
        mostrarMensaje('El predio acaba de ser tomado por otro alumno', 'rojo')
        cargarPredios()
        setCargando(false)
        return
      }
      setCargando(false)
      router.push(`/encuesta/${id}`)
    }

    map.on('click', 'predios-fill', handleClick)
    return () => map?.off('click', 'predios-fill', handleClick)
  }, [cargarPredios, router, supabase])

  // ── GPS opcional — solo centra el mapa ──────────────────────
  function irAMiUbicacion() {
    if (!navigator.geolocation) {
      mostrarMensaje('Tu dispositivo no tiene GPS', 'rojo')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        mapInst.current?.flyTo({ center: [lon, lat], zoom: 16 })

        if (markerRef.current) {
          markerRef.current.setLngLat([lon, lat])
        } else {
          const el = document.createElement('div')
          el.style.cssText = `width:16px;height:16px;border-radius:50%;
            background:#2196F3;border:3px solid white;
            box-shadow:0 0 8px rgba(33,150,243,0.6);`
          markerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([lon, lat])
            .addTo(mapInst.current)
        }
      },
      () => mostrarMensaje('No se pudo obtener la ubicación', 'rojo'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3500)
  }

  async function cerrarSesion() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative w-full" style={{ height: '100dvh' }}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-12 z-10 bg-white/90 backdrop-blur px-4 py-2 flex items-center justify-between shadow">
        <div>
          <p className="font-semibold text-green-800 text-sm leading-tight">
            {perfil?.nombre?.split(' ').slice(0, 2).join(' ')}
          </p>
          <p className="text-xs text-gray-500">Paralelo {perfil?.paralelo}</p>
        </div>
        <button onClick={cerrarSesion} className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1">
          Salir
        </button>
      </div>

      {/* Aviso zoom bajo */}
      {zoom < 13 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white text-xs px-4 py-2 rounded-full">
          Acerca el mapa para ver los predios
        </div>
      )}

      {/* Botón GPS opcional */}
      <button
        onClick={irAMiUbicacion}
        className="absolute bottom-8 right-4 z-10 bg-white border border-gray-300 rounded-full w-11 h-11 flex items-center justify-center shadow-lg text-xl"
        title="Ir a mi ubicación"
      >
        📍
      </button>

      {/* Loading */}
      {cargando && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-full shadow text-sm text-gray-600">
          Cargando predios...
        </div>
      )}

      {/* Mensaje flotante */}
      {mensaje && (
        <div className={`absolute top-16 left-4 right-4 z-20 px-4 py-3 rounded-xl shadow-lg text-white text-sm text-center font-medium
          ${mensaje.tipo === 'rojo' ? 'bg-red-500' : 'bg-green-600'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur rounded-xl p-3 shadow text-xs space-y-1">
        {[
          [COLOR_ESTADO.libre,             'Libre'],
          [COLOR_ESTADO.en_proceso_propio, 'Tuyo (en proceso)'],
          [COLOR_ESTADO.en_proceso_otro,   'Otro alumno'],
          [COLOR_ESTADO.completado,        'Completado'],
        ].map(([color, label]) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
