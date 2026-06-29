'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import maplibregl from 'maplibre-gl'
import { createClient } from '@/lib/supabase-browser'

// Colores por estado visual
const COLOR_ESTADO = {
  libre:          '#9E9E9E',  // gris
  en_proceso_propio: '#FFC107',  // amarillo (este alumno)
  en_proceso_otro:   '#F44336',  // rojo (otro alumno)
  completado:     '#4CAF50',  // verde
}

export default function MapaInteractivo({ usuario, perfil }) {
  const mapRef    = useRef(null)
  const mapInst   = useRef(null)
  const markerRef = useRef(null)
  const router    = useRouter()
  const supabase  = createClient()

  const [gpsActivo, setGpsActivo] = useState(false)
  const [posicion,  setPosicion]  = useState(null)
  const [cargando,  setCargando]  = useState(false)
  const [mensaje,   setMensaje]   = useState(null)

  // ── Inicializar mapa ────────────────────────────────────────
  useEffect(() => {
    if (mapInst.current) return

    mapInst.current = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri World Imagery',
          },
        },
        layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [-79.22, -4.22],  // Centro aproximado Malacatos
      zoom: 13,
    })

    mapInst.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Fuente y capas para predios (vacías inicialmente)
    mapInst.current.on('load', () => {
      mapInst.current.addSource('predios', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      // Relleno
      mapInst.current.addLayer({
        id: 'predios-fill',
        type: 'fill',
        source: 'predios',
        paint: {
          'fill-color': [
            'match', ['get', 'estado_visual'],
            'libre',            COLOR_ESTADO.libre,
            'en_proceso_propio',COLOR_ESTADO.en_proceso_propio,
            'en_proceso_otro',  COLOR_ESTADO.en_proceso_otro,
            'completado',       COLOR_ESTADO.completado,
            '#CCCCCC'
          ],
          'fill-opacity': 0.55,
        },
      })

      // Borde
      mapInst.current.addLayer({
        id: 'predios-outline',
        type: 'line',
        source: 'predios',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.8,
          'line-opacity': 0.6,
        },
      })

      // Highlight al hover
      mapInst.current.addLayer({
        id: 'predios-hover',
        type: 'fill',
        source: 'predios',
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': [
            'case', ['boolean', ['feature-state', 'hover'], false], 0.25, 0
          ],
        },
      })
    })

    // Hover
    let hoveredId = null
    mapInst.current.on('mousemove', 'predios-fill', (e) => {
      if (hoveredId !== null) {
        mapInst.current.setFeatureState({ source: 'predios', id: hoveredId }, { hover: false })
      }
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
  }, [])

  // ── Cargar predios por GPS ───────────────────────────────────
  const cargarPredios = useCallback(async (lat, lon) => {
    if (!mapInst.current) return
    setCargando(true)

    const { data, error } = await supabase.rpc('get_predios_cercanos', {
      lat, lon, radio_m: 500
    })

    if (error) { setCargando(false); return }

    const features = (data || []).map((p, idx) => ({
      type: 'Feature',
      id: idx,
      geometry: p.geom_json,
      properties: {
        id: p.id,
        clave_cata: p.clave_cata,
        tipo_predi: p.tipo_predi,
        estado: p.estado,
        estado_visual:
          p.estado === 'en_proceso'
            ? (p.alumno_id === usuario.id ? 'en_proceso_propio' : 'en_proceso_otro')
            : p.estado,
      },
    }))

    const source = mapInst.current.getSource('predios')
    if (source) {
      source.setData({ type: 'FeatureCollection', features })
    }

    setCargando(false)
  }, [supabase, usuario])

  // ── Actualizar predios cuando cambia la posición ────────────
  useEffect(() => {
    if (posicion) {
      cargarPredios(posicion.lat, posicion.lon)
    }
  }, [posicion, cargarPredios])

  // ── Click en predio ─────────────────────────────────────────
  useEffect(() => {
    if (!mapInst.current) return

    const handleClick = async (e) => {
      if (!e.features?.length) return
      const props = e.features[0].properties
      const { id, clave_cata, estado_visual } = props

      if (estado_visual === 'completado') {
        mostrarMensaje(`Predio ${clave_cata} ya fue levantado ✓`, 'verde')
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

      // Estado libre → asignar
      setCargando(true)
      const { data: resultado, error } = await supabase.rpc('asignar_predio', { predio_id: id })

      if (error || resultado !== 'ok') {
        mostrarMensaje('El predio acaba de ser tomado por otro alumno', 'rojo')
        if (posicion) cargarPredios(posicion.lat, posicion.lon)
        setCargando(false)
        return
      }

      setCargando(false)
      router.push(`/encuesta/${id}`)
    }

    mapInst.current.on('click', 'predios-fill', handleClick)
    return () => mapInst.current?.off('click', 'predios-fill', handleClick)
  }, [posicion, cargarPredios, router, supabase])

  // ── Activar GPS ─────────────────────────────────────────────
  function activarGPS() {
    if (!navigator.geolocation) {
      mostrarMensaje('Tu dispositivo no tiene GPS', 'rojo')
      return
    }

    setGpsActivo(true)
    navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setPosicion({ lat, lon })

        // Mover mapa a la posición
        mapInst.current?.flyTo({ center: [lon, lat], zoom: 15 })

        // Marcador de posición
        if (markerRef.current) {
          markerRef.current.setLngLat([lon, lat])
        } else {
          const el = document.createElement('div')
          el.className = 'gps-marker'
          el.style.cssText = `
            width: 16px; height: 16px; border-radius: 50%;
            background: #2196F3; border: 3px solid white;
            box-shadow: 0 0 8px rgba(33,150,243,0.6);
          `
          markerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([lon, lat])
            .addTo(mapInst.current)
        }
      },
      (err) => {
        console.error('GPS error:', err)
        mostrarMensaje('No se pudo obtener la ubicación', 'rojo')
        setGpsActivo(false)
      },
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
      {/* Mapa */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-12 z-10 bg-white/90 backdrop-blur px-4 py-2 flex items-center justify-between shadow">
        <div>
          <p className="font-semibold text-green-800 text-sm leading-tight">
            {perfil?.nombre?.split(' ').slice(0, 2).join(' ')}
          </p>
          <p className="text-xs text-gray-500">Paralelo {perfil?.paralelo}</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1"
        >
          Salir
        </button>
      </div>

      {/* Botón GPS */}
      {!gpsActivo && (
        <button
          onClick={activarGPS}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-green-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg text-sm flex items-center gap-2"
        >
          <span>📍</span> Activar ubicación para ver predios
        </button>
      )}

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
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur rounded-xl p-3 shadow text-xs space-y-1">
        {[
          ['libre',             COLOR_ESTADO.libre,            'Libre'],
          ['en_proceso_propio', COLOR_ESTADO.en_proceso_propio,'Tuyo (en proceso)'],
          ['en_proceso_otro',   COLOR_ESTADO.en_proceso_otro,  'Otro alumno'],
          ['completado',        COLOR_ESTADO.completado,       'Completado'],
        ].map(([, color, label]) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
