import { Star, CheckCircle2, Quote } from 'lucide-react';

export function Reviews() {
  const reviews = [
    { name: "Sarah Jenkins", role: "Patient", rating: 5, text: "MediLink saved me so much time. I used to call 5 different pharmacies to find my asthma inhaler, now I just search and reserve it instantly." },
    { name: "David Chen", role: "Patient", rating: 5, text: "The map feature is incredible. Found a 24/7 pharmacy at 2 AM when my daughter had a fever. Highly recommend this to everyone." },
    { name: "City Pharmacy", role: "Partner", rating: 5, text: "As a pharmacy owner, the dashboard makes managing inventory and reservations a breeze. We've seen a 30% increase in new customers." },
    { name: "Emily Rodriguez", role: "Patient", rating: 4, text: "Love the UI and how fast it works. The only thing I'd love to see is more pharmacies joining the network in my specific neighborhood." },
    { name: "Michael T.", role: "Patient", rating: 5, text: "The verified reviews for medicines actually helped me choose a better generic brand. The community aspect is great." },
    { name: "Dr. James Wilson", role: "Physician", rating: 5, text: "I now recommend MediLink to all my patients so they can easily find where their prescriptions are in stock." },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Loved by Patients & Pharmacies</h1>
        <p className="text-lg text-slate-600">See what our community has to say about their experience with MediLink.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 flex flex-col relative">
            <Quote className="absolute top-8 right-8 h-12 w-12 text-slate-50 opacity-50 z-0" />
            <div className="flex gap-1 text-amber-500 mb-6 z-10">
              {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-500" />)}
            </div>
            <p className="text-slate-700 leading-relaxed flex-grow z-10 mb-8">"{r.text}"</p>
            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-lg">
                {r.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-1">
                  {r.name}
                  {r.role === 'Patient' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </h4>
                <p className="text-sm text-slate-500">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
