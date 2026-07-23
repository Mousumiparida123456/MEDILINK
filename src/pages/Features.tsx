import { Search, MapPin, ShieldCheck, Bell, Store, Smartphone, HeartPulse, Clock } from 'lucide-react';

export function Features() {
  const features = [
    { icon: <Search className="h-6 w-6" />, title: "Smart Medicine Search", desc: "Instantly find medicines by brand, generic name, or symptoms across local pharmacies." },
    { icon: <MapPin className="h-6 w-6" />, title: "Live Pharmacy Map", desc: "Discover nearby pharmacies using real-time geolocation and see which ones are open now." },
    { icon: <Clock className="h-6 w-6" />, title: "Instant Reservations", desc: "Reserve medicines directly through the platform and pick them up at your convenience." },
    { icon: <Bell className="h-6 w-6" />, title: "Real-time Alerts", desc: "Get notified immediately when your reserved medicines are confirmed or back in stock." },
    { icon: <Store className="h-6 w-6" />, title: "Pharmacy Dashboard", desc: "A powerful portal for pharmacies to manage stock, analyze trends, and handle reservations." },
    { icon: <ShieldCheck className="h-6 w-6" />, title: "Verified Reviews", desc: "Read authentic reviews from actual patients who have completed reservations." },
    { icon: <Smartphone className="h-6 w-6" />, title: "Mobile Optimized", desc: "Access the entire MediLink platform seamlessly from your phone, tablet, or desktop." },
    { icon: <HeartPulse className="h-6 w-6" />, title: "Emergency Support", desc: "Quickly filter the map for 24/7 and emergency pharmacies when you need them most." },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Powerful Features for Modern Healthcare</h1>
        <p className="text-lg text-slate-600">MediLink bridges the gap between patients and pharmacies with state-of-the-art tools designed for speed, reliability, and convenience.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary mb-6">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
            <p className="text-slate-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
