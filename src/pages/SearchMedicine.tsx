import { Search, Mic, SlidersHorizontal, MapPin, Pill, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';

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
}

export function SearchMedicine() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Filters
  const [maxPrice, setMaxPrice] = useState(50);
  const [inStockOnly, setInStockOnly] = useState(false);

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
        const res = await fetch(`http://localhost:5000/api/medicines/suggest?q=${query}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch suggestions");
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Fetch Results
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setShowSuggestions(false);
    
    try {
      let url = `http://localhost:5000/api/medicines/search?q=${query}&maxPrice=${maxPrice}`;
      if (inStockOnly) url += '&inStock=true';

      const res = await fetch(url);
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when filters change
  useEffect(() => {
    handleSearch();
  }, [maxPrice, inStockOnly]);

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
      // Auto trigger search after setting query (need slight delay for state to update)
      setTimeout(() => document.getElementById('search-btn')?.click(), 100);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header & Main Search */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">Intelligent Search</h1>
        <p className="text-slate-500 max-w-2xl mx-auto mb-8">Search by medicine brand, generic name, or related disease symptoms to find availability near you.</p>
        
        <div className="max-w-3xl mx-auto relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="flex bg-white rounded-2xl shadow-soft border border-slate-200 p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="flex-grow flex items-center px-4 relative">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-transparent border-0 py-3 pl-3 text-slate-900 focus:outline-none placeholder:text-slate-400 text-lg"
                placeholder="e.g. Paracetamol, Asthma..."
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={clsx("p-2 rounded-full transition-colors", isListening ? "bg-rose-100 text-rose-500 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                title="Voice Search"
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
            <button id="search-btn" type="submit" className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-3 font-bold transition-colors shadow-sm ml-2">
              Search
            </button>
          </form>

          {/* Auto Suggestions Dropdown */}
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
                          setTimeout(() => handleSearch(), 0);
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 sticky top-24">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
              <SlidersHorizontal className="h-5 w-5 text-primary" /> Filters
            </div>

            <div className="space-y-6">
              {/* Availability Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Availability</h3>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    <div className={clsx("w-5 h-5 rounded border flex items-center justify-center transition-colors", inStockOnly ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary")}>
                      {inStockOnly && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-slate-600 text-sm">In Stock Only</span>
                </label>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">Max Price</h3>
                  <span className="text-xs font-bold text-primary">${maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Distance Filter (Placeholder UI for now) */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">Distance</h3>
                  <span className="text-xs font-bold text-primary">Within 10km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50"
                  defaultValue="10" 
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary opacity-50"
                  disabled
                />
                <p className="text-xs text-slate-400 mt-2">Distance filter requires location permission.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : medicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medicines.map((med: Medicine) => (
                <div key={med._id} className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                  <Link to={`/medicine/${med._id}`}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="p-5 border-b border-slate-50 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{med.brandName}</h3>
                          <span className="font-bold text-lg text-primary">${med.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 font-medium">{med.genericName}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {med.diseaseTags?.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-auto">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{med.pharmacyName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-600 mt-2">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span>{med.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>
                      
                      <div className={clsx("p-4 flex items-center justify-between text-sm font-medium", med.stockAvailability.inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                        <div className="flex items-center gap-2">
                          {med.stockAvailability.inStock ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                          {med.stockAvailability.inStock ? `${med.stockAvailability.quantity} in stock` : 'Out of stock'}
                        </div>
                        <button className={clsx("px-4 py-1.5 rounded-lg text-white transition-colors", med.stockAvailability.inStock ? "bg-primary hover:bg-primary-dark" : "bg-slate-400 cursor-not-allowed")} disabled={!med.stockAvailability.inStock}>
                          Details
                        </button>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
              <Pill className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No medicines found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or filters to find what you need.</p>
              {query === '' && (
                <button onClick={() => handleSearch()} className="mt-4 text-primary font-medium hover:underline">
                  Load all available medicines
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
