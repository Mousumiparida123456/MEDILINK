import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, AlertTriangle, Navigation, Clock, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export function EmergencyMode() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          toast.error("Please enable location services for emergency search");
        }
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    if (!location) {
      toast.error("Location is required for emergency search");
      return;
    }

    setLoading(true);
    try {
      // First, we need to find the medicine ID
      const medRes = await fetch(`http://localhost:5000/api/medicines/search?q=${searchTerm}&limit=1`);
      const meds = await medRes.json();
      
      if (!meds || meds.length === 0) {
        toast.error("Medicine not found in our database");
        setLoading(false);
        return;
      }
      
      const medicineId = meds[0].id || meds[0]._id; // Handle whatever the backend returns

      // Now search for emergency pharmacies with this medicine
      const res = await fetch(`http://localhost:5000/api/pharmacies/emergency?lat=${location.lat}&lng=${location.lng}&medicineId=${medicineId}`);
      if (!res.ok) throw new Error("Failed to fetch emergency pharmacies");
      const data = await res.json();
      setResults(data);
      if (data.length === 0) {
        toast.error("No nearby open pharmacies have this medicine in stock");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while searching");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-rose-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-rose-100 text-rose-600 rounded-full mb-4">
            <Activity className="h-10 w-10 animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-rose-900 mb-4">Emergency Medicine Search 🔴</h1>
          <p className="text-xl text-rose-700">Find life-saving medicines at the closest, open pharmacies.</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-8 border border-rose-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 h-6 w-6 text-slate-400" />
              <input
                type="text"
                placeholder="Enter medicine name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchTerm}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg py-4 px-8 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Find Immediately'}
            </button>
          </div>
          {!location && (
            <p className="text-rose-500 mt-3 text-sm flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Waiting for location access...
            </p>
          )}
        </form>

        <div className="space-y-6">
          {results.map((pharmacy) => (
            <div key={pharmacy._id} className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-rose-500 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">{pharmacy.name}</h3>
                  {pharmacy.isOpen && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">Open Now</span>}
                  {pharmacy.isEmergency && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">24/7</span>}
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Navigation className="h-4 w-4 text-slate-400" />
                    <span>{pharmacy.distance} km away (~{pharmacy.travelTime} min)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Stock verified {getTimeAgo(pharmacy.lastUpdated)}</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="font-semibold">In Stock ({pharmacy.stockQuantity} units)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                <a href={`tel:${pharmacy.phone || ''}`} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                  <Phone className="h-5 w-5" />
                  Call Pharmacy
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.coords[0]},${pharmacy.coords[1]}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
