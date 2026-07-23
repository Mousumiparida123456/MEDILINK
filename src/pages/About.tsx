import { Activity, ShieldPlus } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Revolutionizing <span className="text-primary">Healthcare Access</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            MediLink was created with a simple mission: to make healthcare accessible by helping people find their essential medicines quickly and locally. We partner with local pharmacies to provide real-time inventory tracking, ensuring that you never have to visit multiple stores just to find out a medication is out of stock.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex-1">
              <div className="text-3xl font-extrabold text-primary mb-2">500+</div>
              <div className="text-emerald-800 font-medium">Partner Pharmacies</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex-1">
              <div className="text-3xl font-extrabold text-blue-600 mb-2">10k+</div>
              <div className="text-blue-800 font-medium">Medicines Tracked</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-500/10 rounded-full blur-3xl -z-10 transform scale-110"></div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-4 sm:translate-y-12">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <ShieldPlus className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Verified Partners</h3>
            <p className="text-slate-600">Every pharmacy on our platform undergoes strict verification for safety.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Real-time Stock</h3>
            <p className="text-slate-600">Inventory levels are synced in real-time to guarantee availability.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
