import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, AlertCircle, MapPin, Pill, Star, Info, Upload, ThumbsUp } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function MedicineDetails() {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [medicine, setMedicine] = useState<any>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reservation state
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pickupTime, setPickupTime] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [reserving, setReserving] = useState(false);
  const [qrCode, setQrCode] = useState('');

  // Notify Me state
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyRadius, setNotifyRadius] = useState(5);
  const [creatingAlert, setCreatingAlert] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const fetchMed = async () => {
      let isSuccess = false;
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl && apiUrl !== 'undefined') {
        try {
          const res = await fetch(`${apiUrl}/api/medicines/${id}`);
          if (res.ok) {
            const data = await res.json();
            setMedicine(data);
            isSuccess = true;
          }
        } catch (err) {
          console.warn("Using offline master medicine details dataset.");
        }
      }

      if (!isSuccess) {
        // Fallback medicine detail item
        setMedicine({
          _id: id || 'm1',
          brandName: 'Dolo 650 Tablet',
          genericName: 'Paracetamol 650mg',
          price: 32.50,
          manufacturer: 'Micro Labs Ltd',
          dosage: '1 tablet every 6-8 hours after meals',
          diseaseTags: ['Fever', 'Pain Relief', 'Headache'],
          pharmacyName: 'Apollo Pharmacy KIIT Square',
          pharmacyId: { _id: 'p1', name: 'Apollo Pharmacy KIIT Square' },
          stockAvailability: { inStock: true, quantity: 45 },
          rating: 4.8
        });
      }
      setLoading(false);
    };

    const fetchAlternatives = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl && apiUrl !== 'undefined') {
        try {
          const res = await fetch(`${apiUrl}/api/medicines/generic/${id}`);
          if (res.ok) {
            setAlternatives(await res.json());
            return;
          }
        } catch (err) {
          console.warn("Using offline generic alternatives.");
        }
      }

      setAlternatives([
        { id: 'alt1', brandName: 'Generic Paracetamol 650mg', genericName: 'Paracetamol', price: 18.00, pharmacyName: 'Jan Aushadhi Generic Chemist', distance: 1.2, stockAvailability: { inStock: true } },
        { id: 'alt2', brandName: 'Crocin 650mg', genericName: 'Paracetamol', price: 30.00, pharmacyName: 'MedPlus Pharmacy Patia', distance: 1.5, stockAvailability: { inStock: true } }
      ]);
    };
    
    const fetchReviews = async () => {
      setReviews([
        { userId: { name: 'Rahul S.' }, rating: 5, comment: 'Very fast relief for fever. Highly recommended!', isVerifiedPurchase: true, createdAt: new Date().toISOString(), likes: [1,2,3] },
        { userId: { name: 'Priya K.' }, rating: 4, comment: 'Effective medicine and easily available at local stores.', isVerifiedPurchase: true, createdAt: new Date().toISOString(), likes: [1] }
      ]);
    }
    
    if (id) {
      fetchMed();
      fetchAlternatives();
      fetchReviews();
    }
  }, [id]);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setReserving(true);
    try {
      const formData = new FormData();
      formData.append('pharmacyId', medicine.pharmacyId._id || medicine.pharmacyId);
      formData.append('medicineId', medicine._id);
      formData.append('quantity', quantity.toString());
      formData.append('pickupTime', new Date(pickupTime).toISOString());
      if (file) formData.append('prescription', file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQrCode(data.qrCodeToken);
    } catch (err) {
      console.error(err);
      alert('Reservation failed');
    } finally {
      setReserving(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ medicineId: medicine._id, rating: reviewRating, comment: reviewComment })
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setShowReviewModal(false);
        setReviewComment('');
        toast.success('Review posted!');
      }
    } catch (err) {
      toast.error('Failed to post review');
    }
  };
  
  const handleLikeReview = async (reviewId: string) => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews(reviews.map(r => r._id === updated._id ? { ...r, likes: updated.likes } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    
    setCreatingAlert(true);
    try {
      // Need location for the alert
      navigator.geolocation.getCurrentPosition(async (position) => {
        const payload = {
          medicineId: medicine._id,
          radius: notifyRadius,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/alerts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          toast.success(`You will be notified when ${medicine.brandName} is available within ${notifyRadius}km.`);
          setShowNotifyModal(false);
        } else {
          toast.error("Failed to set alert");
        }
        setCreatingAlert(false);
      }, () => {
        toast.error("Please enable location services to set alerts");
        setCreatingAlert(false);
      });
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
      setCreatingAlert(false);
    }
  };

  if (loading || !medicine) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Product Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white p-8 rounded-3xl shadow-soft border border-slate-100 mb-12">
        <div className="lg:col-span-1 bg-slate-50 rounded-2xl flex items-center justify-center p-12 border border-slate-100">
          <Pill className="w-32 h-32 text-primary opacity-20" />
        </div>
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900">{medicine.brandName}</h1>
              <p className="text-xl text-slate-500 font-medium mt-1">{medicine.genericName}</p>
            </div>
            <div className="text-3xl font-extrabold text-primary">${medicine.price.toFixed(2)}</div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {medicine.diseaseTags?.map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">{tag}</span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 flex-grow">
            <div>
              <p className="text-sm text-slate-500 mb-1">Manufacturer</p>
              <p className="font-semibold text-slate-900">{medicine.manufacturer || 'PharmaCorp Inc.'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Dosage</p>
              <p className="font-semibold text-slate-900">{medicine.dosage || 'As prescribed by doctor'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Available at</p>
              <p className="font-semibold text-slate-900 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" /> {medicine.pharmacyName || medicine.pharmacyId?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Stock Status</p>
              <div className="flex items-center gap-1">
                {medicine.stockAvailability?.inStock ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> In Stock ({medicine.stockAvailability?.quantity})</span>
                ) : (
                  <span className="font-bold text-rose-600 flex items-center gap-1"><AlertCircle className="h-4 w-4"/> Out of Stock</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowModal(true)}
              disabled={!medicine.stockAvailability?.inStock}
              className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-soft transition-colors"
            >
              Reserve for Pickup
            </button>
            {!medicine.stockAvailability?.inStock && (
              <button 
                onClick={() => setShowNotifyModal(true)}
                className="w-full sm:w-auto px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg shadow-soft transition-colors"
              >
                Notify Me When Available
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Info className="h-6 w-6 text-primary"/> Uses & Benefits</h3>
            <p className="text-slate-600 leading-relaxed">
              This medication is primarily used for the treatment of associated symptoms. It works by targeting the specific receptors in the body to provide fast relief. Always consult your physician before starting any new medication.
            </p>
          </section>
          
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"><AlertCircle className="h-6 w-6 text-rose-500"/> Side Effects</h3>
            <ul className="list-disc list-inside text-slate-600 leading-relaxed space-y-2">
              <li>Mild dizziness or drowsiness</li>
              <li>Dry mouth or throat</li>
              <li>Upset stomach (if taken without food)</li>
              <li>Rarely, mild allergic reactions (rash)</li>
            </ul>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><Star className="h-5 w-5 fill-amber-500 text-amber-500"/> Patient Reviews</h4>
            <div className="text-4xl font-extrabold text-amber-600 mb-1">{medicine.rating?.toFixed(1) || '4.5'}</div>
            <p className="text-amber-700 text-sm mb-4">Based on verified patient reviews.</p>
            <button 
              onClick={() => setShowReviewModal(true)}
              className="w-full py-2 bg-amber-200 text-amber-900 font-bold rounded-xl hover:bg-amber-300 transition-colors"
            >
              Write a Review
            </button>
          </div>

          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-bold text-slate-900 flex items-center gap-2">
                      {r.userId?.name || 'Anonymous'}
                      {r.isVerifiedPurchase && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Verified</span>}
                    </h5>
                    <p className="text-xs text-slate-500">{format(new Date(r.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-500" />)}
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-3">{r.comment}</p>
                <button 
                  onClick={() => handleLikeReview(r._id)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" /> {r.likes?.length || 0} Helpful
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mt-6">
            <h4 className="font-bold text-slate-900 mb-2">Alternatives</h4>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-700">
                Do not change a prescribed medicine without confirmation from a doctor or pharmacist.
              </p>
            </div>
            <div className="space-y-4">
              {alternatives.length > 0 ? alternatives.map(alt => (
                <div key={alt.id || alt._id} onClick={() => navigate(`/medicine/${alt.id || alt._id}`)} className="p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{alt.brandName}</p>
                      <p className="text-xs text-slate-500">{alt.genericName}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {alt.pharmacyName} {alt.distance && `(${alt.distance}km)`}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${alt.price?.toFixed(2)}</p>
                      {alt.inStock || alt.stockAvailability?.inStock ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">In Stock</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full uppercase">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No alternatives found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900">Reserve Medicine</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-8">
              {qrCode ? (
                <div className="text-center">
                  <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5"/> Reservation Confirmed
                  </div>
                  <div className="inline-block p-4 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
                    <QRCodeSVG value={qrCode} size={200} />
                  </div>
                  <p className="text-slate-500 text-sm mb-6">Show this QR code at the pharmacy counter to pick up your order.</p>
                  <button onClick={() => navigate('/reservations')} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark">
                    View My Reservations
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReserve} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                    <input 
                      type="number" min="1" max={medicine.stockAvailability?.quantity || 1}
                      value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pickup Time</label>
                    <input 
                      type="datetime-local" required
                      value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Prescription (Optional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                      <input 
                        type="file" 
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*,.pdf"
                      />
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-medium">
                        {file ? file.name : 'Click or drag file to upload'}
                      </p>
                    </div>
                  </div>
                  
                  <button type="submit" disabled={reserving} className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark disabled:opacity-70 transition-colors flex justify-center items-center">
                    {reserving ? 'Processing...' : 'Confirm Reservation'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900">Write a Review</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button 
                        key={star} type="button" 
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star className={clsx("h-8 w-8 transition-colors", star <= reviewRating ? "fill-amber-500 text-amber-500" : "text-slate-300")} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Comment</label>
                  <textarea 
                    required rows={4}
                    value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Share your experience with this medicine..."
                  ></textarea>
                </div>
                
                <button type="submit" className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors">
                  Post Review
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notify Me Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Availability Alert 🔔</h2>
              <button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleNotifySubmit} className="space-y-6">
                <p className="text-slate-600 text-sm">
                  We will notify you when <strong>{medicine.brandName}</strong> becomes available at a pharmacy near you.
                </p>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Search Radius (km)</label>
                  <select 
                    value={notifyRadius} onChange={e => setNotifyRadius(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value={2}>2 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                  </select>
                </div>
                
                <button type="submit" disabled={creatingAlert} className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-70">
                  {creatingAlert ? 'Setting Alert...' : 'Notify Me When Available'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
