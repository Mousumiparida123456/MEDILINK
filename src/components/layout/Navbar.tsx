import { Link } from 'react-router-dom';
import { Pill, Search, Menu, X, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, user, logout, token } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    
    const fetchNotifs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setNotifications(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Optimizer', path: '/optimizer' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Nearby', path: '/pharmacies' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed w-full z-50 glass top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl text-white shadow-soft">
                <Pill className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">
                Medi<span className="text-primary">Link</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 hover:text-primary transition-colors font-medium text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/search"
              className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-medium text-sm"
            >
              <Search className="h-4 w-4" />
              Search Medicine
            </Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'pharmacy' && (
                  <Link to="/dashboard" className="text-slate-600 hover:text-primary font-medium text-sm">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'user' && (
                  <Link to="/reservations" className="text-slate-600 hover:text-primary font-medium text-sm">
                    My Reservations
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-primary font-medium text-sm">
                    Admin Panel
                  </Link>
                )}
                
                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-600 hover:text-primary transition-colors rounded-full hover:bg-slate-50"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <button 
                          onClick={async () => {
                            await fetch('http://localhost:5000/api/notifications/read-all', { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }});
                            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                          }}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm">No notifications yet.</div>
                        ) : (
                          notifications.map((n, i) => (
                            <div key={i} className={clsx("p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors", !n.isRead && "bg-blue-50/30")}>
                              <h4 className={clsx("text-sm", !n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700")}>{n.title}</h4>
                              <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-5 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-primary font-medium text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-soft"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'md:hidden absolute w-full bg-white shadow-soft border-t border-slate-100 transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-screen py-4 opacity-100' : 'max-h-0 py-0 opacity-0 overflow-hidden'
        )}
      >
        <div className="px-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary hover:bg-emerald-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-slate-100 pt-3 flex flex-col space-y-2">
            <Link
              to="/search"
              className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-600 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <Search className="h-4 w-4" />
              Search Medicine
            </Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'pharmacy' && (
                  <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                )}
                {user?.role === 'user' && (
                  <Link to="/reservations" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary" onClick={() => setIsOpen(false)}>
                    My Reservations
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-center bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors mt-2"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
