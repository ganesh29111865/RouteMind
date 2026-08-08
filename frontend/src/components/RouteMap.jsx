import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

export default function RouteMap({ stops = [], activeStopId, height = "400px" }) {
  const defaultCenter = [12.9716, 77.6412] // Indiranagar Hub, Bengaluru
  
  const positions = stops.map(s => [s.latitude, s.longitude])
  const center = positions.length > 0 ? positions[0] : defaultCenter

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl" style={{ height }}>
      <MapContainer 
        key={stops.length > 0 ? stops[0].id + '_' + stops.length : 'empty'}
        center={center} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <RecenterMap center={center} />
        {/* Dark Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        {positions.length > 1 && (
          <Polyline 
            positions={positions} 
            color="#0284c7" 
            weight={4} 
            opacity={0.8}
            dashArray="8, 8"
          />
        )}

        {/* Stop Markers */}
        {stops.map((stop, idx) => {
          const isHub = idx === 0
          return (
            <Marker key={stop.id || idx} position={[stop.latitude, stop.longitude]}>
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between gap-2">
                    <span>{stop.stop_sequence ? `#${stop.stop_sequence}` : `#${idx+1}`} {stop.location_name}</span>
                    {isHub && <span className="bg-sky-600 text-white text-[9px] px-1.5 py-0.5 rounded">HUB</span>}
                  </div>
                  <div className="mt-1 text-slate-600">
                    <p>Package: {stop.package_id || 'N/A'}</p>
                    <p>ETA: {stop.eta || '09:00 AM'}</p>
                    {stop.cod_amount_inr > 0 && <p className="font-semibold text-emerald-600">COD: ₹{stop.cod_amount_inr}</p>}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Map Legend Floating Overlay */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel p-3 rounded-xl text-xs space-y-1.5 border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-brand-500 inline-block"></span>
          <span className="text-slate-300 font-medium">Optimized Route Line</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300 font-medium">Active Delivery Stop</span>
        </div>
      </div>
    </div>
  )
}
