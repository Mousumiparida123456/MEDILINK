import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Search, AlertCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function FindMedicineWizard() {
  const navigate = useNavigate();
  
  // Step Management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // State: Location & Area
  const [radius, setRadius] = useState<number>(2); // 1, 2, 5, 10
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  
  // State: Medicine Search
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);

  // State: Reservation
  const [reserving, setReserving] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);

  const [locationError, setLocationError] = useState(false);
  const [manualArea, setManualArea] = useState('');

  // Step 1 & 2: Get Location
  const requestLocation = () => {
    setLocating(true);
    setLocationError(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setLocating(false);
          fetchPharmacies(lat, lng, radius);
          setStep(2); // Move to medicine search
        },
        () => {
          setLocationError(true);
          setLocating(false);
        }
      );
    } else {
      setLocationError(true);
      setLocating(false);
    }
  };

  const handleManualLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualArea) return;
    setLocating(true);
    try {
      // Very basic geocoding using Nominatim (OpenStreetMap)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualArea)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setUserLocation([lat, lng]);
        fetchPharmacies(lat, lng, radius);
        setStep(2);
      } else {
        alert("Location not found. Please try a different city or pincode.");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    } finally {
      setLocating(false);
    }
  };

  const fetchPharmacies = async (lat: number, lng: number, maxDist: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pharmacies/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDist}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPharmacies(data);
      } else {
        console.error("API error:", data);
        setPharmacies([]);
        alert(data.error || "Failed to fetch pharmacies. The backend may be having issues.");
      }
    } catch (err) {
      console.error(err);
      setPharmacies([]);
    }
  };

  // Step 3 & 4: Search Medicine
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const fetchSuggest = async () => {
      try {
        const [lat, lng] = userLocation || [0,0];
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medicines/suggest?q=${searchQuery}&lat=${lat}&lng=${lng}&maxDistance=${radius}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(fetchSuggest, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, userLocation, radius]);

  const handleSearch = async (e?: React.FormEvent, forceQuery?: string) => {
    if (e) e.preventDefault();
    const query = forceQuery || searchQuery;
    if (!query || !userLocation) return;
    
    setSearchQuery(query);
    setShowSuggestions(false);
    setSearching(true);
    try {
      const [lat, lng] = userLocation;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medicines/search?q=${query}&lat=${lat}&lng=${lng}&maxDistance=${radius}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Group by medicine
        const uniqueMeds = Array.from(new Set(data.map((m: any) => m.brandName)))
          .map(name => data.find((m: any) => m.brandName === name));
        setSearchResults(uniqueMeds);
      } else {
        console.error("API error:", data);
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const selectMedicine = async (med: any) => {
    setSelectedMedicine(med);
    setStep(3); // Move to Details & Compare
    
    // Fetch all pharmacies that have this medicine
    try {
      const [lat, lng] = userLocation || [0,0];
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medicines/search?q=${med.brandName}&lat=${lat}&lng=${lng}&maxDistance=${radius}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data); // Reusing searchResults to hold pharmacy inventory data for the selected medicine
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    }
  };

  const handleReserve = async (pharmacyId: string, medicineId: string) => {
    setReserving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login to reserve medicines");
        navigate('/login');
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ pharmacyId, medicineId, quantity: 1, pickupTime: new Date(Date.now() + 3600000) })
      });
      if (res.ok) {
        setReservationComplete(true);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to reserve');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Wizard Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Find & Reserve Medicine</h1>
        <div className="flex items-center justify-center gap-4 text-sm font-bold">
          <div className={clsx("flex items-center gap-2", step >= 1 ? "text-primary" : "text-slate-400")}>
            <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-white", step >= 1 ? "bg-primary" : "bg-slate-200")}>1</div> Area
          </div>
          <div className="w-10 h-0.5 bg-slate-200">
            <div className="h-full bg-primary transition-all" style={{ width: step >= 2 ? '100%' : '0%' }}></div>
          </div>
          <div className={clsx("flex items-center gap-2", step >= 2 ? "text-primary" : "text-slate-400")}>
            <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-white", step >= 2 ? "bg-primary" : "bg-slate-200")}>2</div> Search
          </div>
          <div className="w-10 h-0.5 bg-slate-200">
            <div className="h-full bg-primary transition-all" style={{ width: step >= 3 ? '100%' : '0%' }}></div>
          </div>
          <div className={clsx("flex items-center gap-2", step >= 3 ? "text-primary" : "text-slate-400")}>
            <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-white", step >= 3 ? "bg-primary" : "bg-slate-200")}>3</div> Compare & Reserve
          </div>
        </div>
      </div>

      {/* STEP 1: Location */}
      {step === 1 && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <MapPin className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Where do you want to find your medicine?</h2>
          <p className="text-slate-500 mb-8">Select your search radius to find pharmacies nearby.</p>
          
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            {[2, 5, 10, 25, 50].map(r => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={clsx(
                  "px-6 py-3 rounded-xl font-bold border-2 transition-all",
                  radius === r ? "border-primary bg-emerald-50 text-primary" : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                {r} km
              </button>
            ))}
          </div>

          {locationError ? (
            <div className="mt-6 text-left">
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-4 text-sm font-medium border border-rose-200">
                Please allow location access to find pharmacies near you.
              </div>
              <p className="font-bold text-slate-700 mb-2">Select Area Manually</p>
              <form onSubmit={handleManualLocation} className="flex gap-2">
                <input
                  type="text"
                  placeholder="City, Locality, or Pincode"
                  value={manualArea}
                  onChange={(e) => setManualArea(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <button type="submit" disabled={locating} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50">
                  {locating ? '...' : 'Search'}
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={requestLocation}
              disabled={locating}
              className="w-full bg-primary text-white text-lg font-bold py-4 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
            >
              {locating ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Navigation className="h-5 w-5" />}
              {locating ? "Locating..." : "Share Live Location"}
            </button>
          )}
        </div>
      )}

      {/* STEP 2: Search */}
      {step === 2 && (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Pharmacies in your area</h2>
            <p className="text-slate-500 mb-6">We found {pharmacies.length} pharmacies within {radius} km.</p>
            
            {/* List of pharmacies */}
            <div className="mb-8 space-y-3 max-h-48 overflow-y-auto pr-2">
              {pharmacies.map(p => (
                <div key={p._id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center hover:bg-emerald-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" /> {p.distance} km away
                    </div>
                  </div>
                  {p.isOpen ? <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Open</span> : <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded">Closed</span>}
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2 mt-auto pt-6 border-t border-slate-100">What medicine are you looking for?</h2>
            <p className="text-slate-500 mb-6">Search to see which of these pharmacies have it in stock.</p>
            
            <form onSubmit={handleSearch} className="relative mb-4 z-20">
              <input
                type="text"
                placeholder="e.g., Paracetamol, Dolo 650"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-0 text-lg outline-none transition-colors font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800">
                {searching ? '...' : 'Search'}
              </button>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                    Available in selected radius
                  </div>
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 hover:bg-emerald-50 cursor-pointer font-medium text-slate-700 transition-colors"
                      onClick={() => handleSearch(undefined, s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </form>

            <div className="space-y-4">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm font-bold text-emerald-600 mb-2">Available locally:</p>
                  {searchResults.map((med, idx) => (
                    <div key={idx} onClick={() => selectMedicine(med)} className="p-4 border-2 border-emerald-100 bg-emerald-50/30 rounded-xl hover:border-primary cursor-pointer transition-all flex items-center justify-between group">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{med.brandName}</h3>
                        <p className="text-sm text-slate-500">{med.genericName} • {med.dosageForm || 'Tablet'}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </>
              ) : searchQuery && !searching ? (
                <div className="text-center py-6">
                  <p className="text-slate-500 mb-4 font-medium">This exact medicine isn't available nearby.</p>
                  <p className="text-sm text-slate-400">Try searching for the generic composition (e.g., "Paracetamol") to find alternatives.</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-100 relative z-0">
            {userLocation && (
              <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={userLocation} zoom={14} />
                <Marker position={userLocation}><Popup>You are here</Popup></Marker>
                {/* Draw radius circle */}
                <Circle center={userLocation} radius={radius * 1000} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} />
                
                {pharmacies.map((p) => (
                  <Marker key={p._id} position={p.coords}>
                    <Popup>
                      <strong>{p.name}</strong><br/>
                      {p.distance} km away<br/>
                      <div className="mt-1 flex gap-1">
                        {p.isOpen ? <span className="text-xs text-emerald-600 font-bold">Open</span> : <span className="text-xs text-rose-600 font-bold">Closed</span>}
                        {p.isEmergency && <span className="text-xs bg-rose-100 text-rose-700 px-1 rounded font-bold">24x7</span>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Compare & Reserve */}
      {step === 3 && selectedMedicine && !reservationComplete && (
        <div className="animate-in fade-in slide-in-from-right-8 space-y-8">
          {/* Medicine Info Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 text-primary">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-1">{selectedMedicine.brandName}</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <p><span className="text-slate-500">Composition:</span> <strong className="text-slate-700">{selectedMedicine.composition || selectedMedicine.genericName}</strong></p>
                <p><span className="text-slate-500">Dosage Form:</span> <strong className="text-slate-700">{selectedMedicine.dosageForm || 'Tablet'}</strong></p>
                <p><span className="text-slate-500">Prescription Required:</span> <strong className="text-slate-700">{selectedMedicine.prescriptionRequired ? 'Yes' : 'No'}</strong></p>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="text-sm font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-4 py-2 rounded-lg">
              ← Change Medicine
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900">Pharmacies within {radius} km</h3>
          
          {/* Pharmacy Comparison Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-500">
                    <th className="p-4">Pharmacy</th>
                    <th className="p-4">Distance</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {searchResults.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-lg">{inv.pharmacyName}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          {inv.pharmacy?.isOpen ? <span className="text-emerald-600 font-bold">Open</span> : <span className="text-rose-500 font-bold">Closed</span>}
                          {inv.pharmacy?.isEmergency && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">24x7</span>}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {Number(inv.distance).toFixed(1)} km</div>
                      </td>
                      <td className="p-4">
                        {inv.inStock ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-200">
                            <Check className="h-4 w-4" /> Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-sm font-bold border border-rose-200">
                            <AlertCircle className="h-4 w-4" /> Out of stock
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-extrabold text-xl text-slate-900">
                        ₹{inv.price}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleReserve(inv.pharmacyId, inv.id)}
                          disabled={!inv.inStock || reserving}
                          className="bg-slate-900 text-white font-bold px-6 py-2 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-slate-900/20"
                        >
                          Reserve
                        </button>
                      </td>
                    </tr>
                  ))}
                  {searchResults.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No pharmacies found with this medicine in your radius.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Success / QR */}
      {reservationComplete && (
        <div className="max-w-md mx-auto mt-10 bg-white rounded-3xl shadow-2xl border border-emerald-100 p-8 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Reserved!</h2>
          <p className="text-slate-500 mb-8">Your medicine has been successfully reserved. Please visit the pharmacy to collect it.</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border-2 border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-400 mb-2">RESERVATION QR / ID</p>
            <div className="w-32 h-32 bg-white border border-slate-200 mx-auto mb-4 flex items-center justify-center rounded-xl shadow-sm">
              {/* Fake QR code using CSS pattern */}
              <div className="w-24 h-24 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80 mix-blend-multiply"></div>
            </div>
            <p className="font-mono font-bold text-slate-900 tracking-widest text-lg">MED-89X4P</p>
          </div>

          <button
            onClick={() => navigate('/my-reservations')}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
          >
            View My Reservations
          </button>
        </div>
      )}

    </div>
  );
}
