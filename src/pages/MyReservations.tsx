import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, MapPin, Pill } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export function MyReservations() {
  const { token, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchReservations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/reservations/my-reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setReservations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [token, isAuthenticated]);

  if (!isAuthenticated) return <div className="p-20 text-center">Please login to view reservations.</div>;
  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-[80vh]">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Reservations</h1>

      {reservations.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <Pill className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No active reservations</h3>
          <p className="text-slate-500">Search for medicines and reserve them for pickup.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reservations.map((res) => (
            <div key={res._id} className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 flex flex-col md:flex-row gap-8 items-center">
              
              <div className="flex-grow w-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{res.medicineId?.brandName}</h3>
                    <p className="text-slate-500 font-medium">{res.medicineId?.genericName}</p>
                  </div>
                  <div className={clsx("px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider", 
                    res.status === 'pending' ? "bg-amber-100 text-amber-700" :
                    res.status === 'confirmed' ? "bg-blue-100 text-blue-700" :
                    res.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                    "bg-rose-100 text-rose-700"
                  )}>
                    {res.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Quantity</p>
                    <p className="font-bold text-slate-700">{res.quantity} Unit(s)</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Total Price</p>
                    <p className="font-bold text-primary">${(res.quantity * (res.medicineId?.price || 0)).toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" /> Pickup from: <strong>{res.pharmacyId?.name}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" /> Scheduled Time: <strong>{format(new Date(res.pickupTime), 'PPp')}</strong>
                  </div>
                </div>
              </div>

              <div className="shrink-0 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <QRCodeSVG value={res.qrCodeToken} size={120} />
                <p className="text-xs text-slate-400 mt-3 font-medium">Scan at counter</p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
