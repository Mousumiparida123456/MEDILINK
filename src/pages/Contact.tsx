import { Mail, Phone, MapPin, Send } from 'lucide-react';

export function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Get in Touch</h1>
        <p className="text-lg text-slate-600">Have questions about MediLink? We're here to help patients, pharmacies, and developers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary transition-all" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary transition-all" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input type="email" className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
              <textarea rows={5} className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary transition-all" placeholder="How can we help you?"></textarea>
            </div>
            <button className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
              <Send className="h-5 w-5" /> Send Message
            </button>
          </form>
        </div>

        <div className="space-y-8 lg:pl-12">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Email Us</h4>
                  <p className="text-slate-600">support@medilink.com</p>
                  <p className="text-slate-600">partners@medilink.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Call Us</h4>
                  <p className="text-slate-600">1-800-MEDILINK</p>
                  <p className="text-slate-500 text-sm mt-1">Mon-Fri from 8am to 8pm.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Headquarters</h4>
                  <p className="text-slate-600">123 Health Ave, Suite 400<br/>San Francisco, CA 94103</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Are you a Pharmacy?</h4>
            <p className="text-slate-600 text-sm mb-4">Join our network to digitize your inventory and reach thousands of local patients instantly.</p>
            <a href="/register" className="text-primary font-bold hover:underline">Apply for Partnership →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
