import { Link } from 'react-router-dom';
import { Pill, Globe, Mail, Phone, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Pill className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Medi<span className="text-primary">Link</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your smart pharmacy finder. Bridging the gap between patients and essential medicines with real-time availability.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <span className="sr-only">Website</span>
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <span className="sr-only">Contact</span>
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <span className="sr-only">Phone</span>
                <Phone className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <span className="sr-only">Social</span>
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Features</h3>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-sm text-slate-500 hover:text-primary transition-colors">Medicine Search</Link></li>
              <li><Link to="/nearby" className="text-sm text-slate-500 hover:text-primary transition-colors">Nearby Pharmacies</Link></li>
              <li><Link to="/features" className="text-sm text-slate-500 hover:text-primary transition-colors">Real-time Stock</Link></li>
              <li><Link to="/features" className="text-sm text-slate-500 hover:text-primary transition-colors">Prescriptions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-slate-500 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-500 hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/reviews" className="text-sm text-slate-500 hover:text-primary transition-colors">Reviews</Link></li>
              <li><Link to="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} MediLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
