import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Clock, Phone, Star, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function NearbyPharmacies() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterEmergency, setFilterEmergency] = useState(false);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          fetchPharmacies(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback location (e.g. city center)
          const fallback: [number, number] = [40.7128, -74.0060];
          setUserLocation(fallback);
          fetchPharmacies(fallback[0], fallback[1]);
        }
      );
    } else {
      fetchPharmacies(40.7128, -74.0060);
    }
  }, []);

  const fetchPharmacies = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/pharmacies/nearby?lat=${lat}&lng=${lng}`;
      if (filterOpen) url += '&openNow=true';
      if (filterEmergency) url += '&isEmergency=true';

      const res = await fetch(url);
      const data = await res.json();
      
      const mapped = data.map((p: any) => ({
        ...p,
        coords: p.coords || [lat, lng] // fallback if missing
      }));
      setPharmacies(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchPharmacies(userLocation[0], userLocation[1]);
    }
  }, [filterOpen, filterEmergency]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-slate-50">
      
      {/* Sidebar List */}
      <div className="w-full lg:w-1/3 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4">Nearby Pharmacies</h1>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={clsx("px-4 py-2 rounded-xl text-sm font-medium transition-colors border", filterOpen ? "bg-emerald-50 border-primary text-primary" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
            >
              Open Now
            </button>
            <button 
              onClick={() => setFilterEmergency(!filterEmergency)}
              className={clsx("px-4 py-2 rounded-xl text-sm font-medium transition-colors border flex items-center gap-2", filterEmergency ? "bg-rose-50 border-rose-500 text-rose-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
            >
              <AlertCircle className="h-4 w-4" /> 24x7 Emergency
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : pharmacies.length > 0 ? (
            pharmacies.map((pharmacy) => (
              <div key={pharmacy._id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">{pharmacy.name}</h3>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {pharmacy.rating}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{pharmacy.distance} km away</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className={clsx("font-medium", pharmacy.isOpen ? "text-emerald-600" : "text-rose-500")}>
                      {pharmacy.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                    {pharmacy.isEmergency && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded ml-2 font-bold">24/7</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                    <Navigation className="h-4 w-4" /> Route
                  </button>
                  <button className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                    <Phone className="h-4 w-4" /> Call
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-10 text-slate-500">
              No pharmacies found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 h-[50vh] lg:h-full relative z-0">
        {userLocation ? (
          <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={userLocation} />
            
            {/* User Location Marker */}
            <Marker position={userLocation}>
              <Popup>
                <strong>You are here</strong>
              </Popup>
            </Marker>

            {/* Pharmacy Markers */}
            {pharmacies.map((pharmacy) => (
              <Marker key={pharmacy._id} position={pharmacy.coords}>
                <Popup>
                  <div className="p-1">
                    <strong className="block mb-1">{pharmacy.name}</strong>
                    <span className="text-sm text-slate-500">{pharmacy.distance} km away</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-100">
            <div className="animate-pulse flex flex-col items-center">
              <MapPin className="h-10 w-10 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Acquiring location...</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
