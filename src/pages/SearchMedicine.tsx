import { Search, Mic, MapPin, Pill, Star, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// SpeechRecognition global type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Types
interface Medicine {
  _id: string;
  brandName: string;
  genericName: string;
  diseaseTags: string[];
  price: number;
  stockAvailability: {
    inStock: boolean;
    quantity: number;
  };
  pharmacyName: string;
  rating: number;
  distance?: number;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
}

export function SearchMedicine() {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [maxPrice] = useState(50);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Auto-suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medicines/suggest?q=${query}`);
        const data = await res.json();
        if (Array.isArray(data)) {
           setSuggestions(data);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions");
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Fetch Results
  const handleSearch = async () => {
    setLoading(true);
    setShowSuggestions(false);
    setStep(3); // Move to results step
    
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/medicines/search?q=${query}&maxPrice=${maxPrice}`;
      if (inStockOnly) url += '&inStock=true';
      if (userLocation) {
        url += `&lat=${userLocation[0]}&lng=${userLocation[1]}&maxDistance=${maxDistance}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      // CRASH PREVENTION: Ensure data is an array
      if (res.ok && Array.isArray(data)) {
        setMedicines(data);
      } else {
        setMedicines([]);
        console.error("API Error:", data);
      }
    } catch (err) {
      console.error("Search failed");
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // Voice Search (Web Speech API)
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Geolocation error:", err)
      );
    }
  };

  // --- Step 1 UI: The Query ---
  const renderStep1 = () => (
    <motion.div 
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-3xl mx-auto mt-10"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">What medicine do you need?</h1>
        <p className="text-lg text-slate-500">Search by brand, generic name, or symptom.</p>
      </div>

      <div className="relative" ref={searchRef}>
        <div className="flex bg-white rounded-2xl shadow-soft border border-slate-200 p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <div className="flex-grow flex items-center px-4 relative">
            <Search className="h-6 w-6 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-transparent border-0 py-4 pl-4 text-slate-900 focus:outline-none placeholder:text-slate-400 text-xl"
              placeholder="e.g. Paracetamol, Asthma..."
              autoFocus
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={clsx("p-3 rounded-full transition-colors", isListening ? "bg-rose-100 text-rose-500 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
              title="Voice Search"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left"
            >
              <ul>
                {suggestions.map((suggestion: string, idx: number) => (
                  <div key={idx}>
                    <button
                      type="button"
                      className="w-full text-left px-5 py-3 text-slate-700 hover:bg-emerald-50 hover:text-primary transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                      onClick={() => {
                        setQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      <Search className="h-4 w-4 opacity-50" />
                      {suggestion}
                    </button>
                  </div>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={() => setStep(2)}
          disabled={!query.trim()}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-4 font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          Next Step <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );

  // --- Step 2 UI: Filters & Location ---
  const renderStep2 = () => (
    <motion.div 
      key="step2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-2xl mx-auto mt-10"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
          <MapPin className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Where are you?</h1>
        <p className="text-lg text-slate-500">Set your preferences so we can find the closest available stock for <span className="font-bold text-primary">"{query}"</span>.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 space-y-8">
        
        {/* Location Toggle */}
        <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
          <div className="flex items-center gap-3">
            <div className={clsx("p-2 rounded-xl", userLocation ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500")}>
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Current Location</p>
              <p className="text-sm text-slate-500">{userLocation ? "Location acquired successfully" : "Not yet provided"}</p>
            </div>
          </div>
          {!userLocation ? (
            <div className="flex gap-3">
              <button onClick={() => setUserLocation([20.2961, 85.8245])} className="text-emerald-600 font-bold text-sm hover:underline border border-emerald-200 px-3 py-1.5 rounded-lg bg-emerald-50">
                Use Demo Location (Patia)
              </button>
              <button onClick={requestLocation} className="text-primary font-bold text-sm hover:underline border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/5">
                Share Real Location
              </button>
            </div>
          ) : (
             <button onClick={() => setUserLocation(null)} className="text-slate-500 font-bold text-sm hover:underline">
               Clear Location
             </button>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 text-lg">Search Radius</h3>
            <span className="font-bold text-primary px-3 py-1 bg-emerald-50 rounded-lg">{maxDistance} km</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="500"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className={clsx("w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary", !userLocation && "opacity-50")}
            disabled={!userLocation}
          />
          {!userLocation && <p className="text-xs text-rose-500 mt-2 font-medium">Please share your location to enable distance filtering.</p>}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="flex items-center gap-4 cursor-pointer group p-4 bg-emerald-50/50 rounded-2xl hover:bg-emerald-50 transition-colors border border-emerald-100/50">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <div className={clsx("w-6 h-6 rounded border-2 flex items-center justify-center transition-colors", inStockOnly ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary")}>
                {inStockOnly && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900">In Stock Only</p>
              <p className="text-sm text-slate-500">Only show pharmacies that currently have this medicine.</p>
            </div>
          </label>
        </div>

      </div>

      <div className="mt-8 flex justify-between">
        <button 
          onClick={() => setStep(1)}
          className="text-slate-500 hover:text-slate-700 font-bold px-6 py-4 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <button 
          onClick={handleSearch}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-4 font-bold transition-colors shadow-sm flex items-center gap-2 text-lg"
        >
          <Search className="h-5 w-5" /> Find Pharmacies
        </button>
      </div>
    </motion.div>
  );

  // --- Step 3 UI: Results with Map ---
  const renderStep3 = () => (
    <motion.div 
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Nearest Pharmacies</h1>
          <p className="text-slate-500 mt-1">Showing matches for <span className="font-bold text-primary">"{query}"</span></p>
        </div>
        <button 
          onClick={() => { setStep(1); setMedicines([]); }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <Search className="h-4 w-4" /> New Search
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
        </div>
      ) : medicines.length > 0 ? (
        <div className="flex flex-col lg:flex-row h-[600px] bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
          
          {/* Left Sidebar: List View */}
          <div className="w-full lg:w-1/3 border-r border-slate-100 overflow-y-auto bg-slate-50 p-4 space-y-4">
            {medicines.map((med: Medicine, idx: number) => (
              <div key={med._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {med.rating?.toFixed(1) || '4.5'}
                </div>

                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4 pr-12">
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-bold shrink-0">{idx + 1}</span>
                  {med.pharmacyName || 'Pharmacy'}
                </h3>
                
                <div className="space-y-3 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Distance</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{med.distance !== undefined ? `${med.distance.toFixed(1)} km` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      {med.stockAvailability?.inStock ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />} 
                      Stock
                    </span>
                    <span className={clsx("font-bold px-2 py-0.5 rounded", med.stockAvailability?.inStock ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                      {med.stockAvailability?.inStock ? `${med.stockAvailability.quantity || 'Yes'} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5"><Pill className="h-4 w-4" /> Price</span>
                    <span className="font-extrabold text-primary text-base">${med.price?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <Link to={`/medicine/${med._id}`} className="block w-full">
                  <button 
                    disabled={!med.stockAvailability?.inStock}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm"
                  >
                    Reserve
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* Right Main Area: Map View */}
          <div className="flex-1 h-[400px] lg:h-full relative z-0">
            <MapContainer 
              center={userLocation || [40.7128, -74.0060]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {userLocation && <MapUpdater center={userLocation} />}
              
              {/* User Location Marker */}
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup><strong>You are here</strong></Popup>
                </Marker>
              )}

              {/* Pharmacy Markers */}
              {medicines.map((med) => {
                if (med.location && med.location.coordinates && med.location.coordinates.length === 2) {
                  // MongoDB stores coordinates as [longitude, latitude], Leaflet expects [latitude, longitude]
                  const position: [number, number] = [med.location.coordinates[1], med.location.coordinates[0]];
                  
                  return (
                    <Marker key={med._id} position={position}>
                      <Popup>
                        <div className="p-2 min-w-[180px]">
                          <strong className="block text-base mb-2 border-b border-slate-100 pb-2">🏥 {med.pharmacyName}</strong>
                          <div className="text-sm text-slate-600 mb-3 space-y-1">
                            <p className={med.stockAvailability?.inStock ? "text-emerald-600 font-bold flex items-center gap-1" : "text-rose-600 font-bold flex items-center gap-1"}>
                              {med.stockAvailability?.inStock ? <><CheckCircle2 className="h-3 w-3" /> In Stock</> : <><AlertCircle className="h-3 w-3" /> Out of Stock</>}
                            </p>
                            <p className="font-bold text-slate-900">₹{med.price?.toFixed(2)}</p>
                            {med.distance !== undefined && <p>{med.distance.toFixed(1)} km</p>}
                            <p className="text-emerald-600 font-medium text-xs">Open Now</p>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/medicine/${med._id}`} className="flex-1">
                              <button disabled={!med.stockAvailability?.inStock} className="w-full bg-primary hover:bg-primary-dark text-white text-xs py-2 rounded-lg font-bold disabled:bg-slate-300">Reserve</button>
                            </Link>
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-lg font-bold">Navigate</button>
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Pill className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">No pharmacies found</h3>
          <p className="text-lg text-slate-500 mt-2 max-w-md mx-auto">We couldn't find any pharmacies carrying this medicine nearby.</p>
          <button 
            onClick={() => setStep(1)} 
            className="mt-8 bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-md"
          >
            Try Another Search
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-160px)]">
      
      {/* Stepper Indicator */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm",
              step === num ? "bg-primary text-white scale-110 ring-4 ring-primary/20" : 
              step > num ? "bg-primary text-white" : "bg-white text-slate-400 border-2 border-slate-200"
            )}>
              {step > num ? <CheckCircle2 className="h-5 w-5" /> : num}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
          <span className={step >= 1 ? "text-primary" : ""}>Search</span>
          <span className={step >= 2 ? "text-primary" : ""}>Filters</span>
          <span className={step >= 3 ? "text-primary" : ""}>Results</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </AnimatePresence>

    </div>
  );
}
