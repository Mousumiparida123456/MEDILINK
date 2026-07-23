import { Search, Phone, MapPin, Clock, ShieldCheck, Star, ChevronDown, ChevronUp, Pill, HeartPulse, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';

// FAQ Data
const faqs = [
  {
    question: 'How does MediLink find nearby medicines?',
    answer: 'We partner directly with local pharmacies. Their inventory systems sync with our platform in real-time, allowing you to see exactly who has your medicine in stock right now.',
  },
  {
    question: 'Is the medicine availability 100% accurate?',
    answer: 'While we strive for 100% accuracy through real-time syncing, we recommend calling the pharmacy (using the provided button) to reserve the medicine before traveling.',
  },
  {
    question: 'Do I need an account to search?',
    answer: 'No, searching for medicines is completely free and requires no account. However, creating an account allows you to save favorite pharmacies and track regular prescriptions.',
  },
  {
    question: 'How do I handle prescription-only medicines?',
    answer: 'You can search for prescription medicines on MediLink to check availability. You will still need to present a valid prescription from a certified doctor to the pharmacist upon purchase.',
  },
];

// Testimonials Data
const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Mother of two',
    text: 'When my son had a fever at 2 AM, MediLink helped me find the only 24/7 pharmacy that had his specific pediatric medicine in stock. An absolute lifesaver!',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Chronic Patient',
    text: 'I used to spend hours calling different pharmacies for my monthly refills. Now I just search on MediLink and know exactly where to go within seconds.',
    rating: 5,
  },
  {
    name: 'Dr. Emily Ross',
    role: 'General Practitioner',
    text: 'I recommend MediLink to all my patients. It reduces their anxiety about finding prescribed medications, especially during shortages.',
    rating: 5,
  },
];

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="absolute top-32 -right-24 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl mix-blend-multiply"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-primary-dark font-medium text-sm mb-6"
              >
                <Activity className="h-4 w-4" />
                <span>Real-time inventory tracking</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:leading-[1.1]"
              >
                <span className="block">Find Medicines</span>
                <span className="block text-primary">Near You in Seconds</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0"
              >
                Never hop from store to store again. Search our network of verified pharmacies to check real-time stock availability instantly.
              </motion.p>
              
              {/* Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 max-w-xl mx-auto lg:mx-0"
              >
                <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row items-center shadow-lg border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                  <div className="flex-grow flex items-center w-full sm:w-auto px-3">
                    <Search className="h-6 w-6 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Amoxicillin, Paracetamol..."
                      className="w-full bg-transparent border-0 py-3 pl-3 text-slate-900 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button className="w-full sm:w-auto mt-2 sm:mt-0 bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-3.5 font-bold transition-colors shadow-sm whitespace-nowrap">
                    Search Now
                  </button>
                </div>
              </motion.div>

              {/* Emergency Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 flex justify-center lg:justify-start"
              >
                <button className="flex items-center gap-2 text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl font-medium transition-colors border border-rose-200 shadow-sm">
                  <Phone className="h-4 w-4" />
                  Emergency Help: Call 911
                </button>
              </motion.div>

              {/* Animated Statistics */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-8"
              >
                <div>
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-500">Pharmacies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">10k+</div>
                  <div className="text-sm text-slate-500">Medicines</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-500">Support</div>
                </div>
              </motion.div>
            </div>

            {/* Right Illustration & Floating Cards */}
            <div className="relative hidden lg:block h-[500px]">
              <motion.img 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src="/healthcare_illustration.png" 
                alt="Healthcare Illustration" 
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              />
              
              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-4"
              >
                <div className="bg-emerald-100 p-2 rounded-lg text-primary">
                  <Pill className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">In Stock</p>
                  <p className="text-xs text-slate-500">Ibuprofen 400mg</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-32 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-4"
              >
                <div className="bg-blue-100 p-2 rounded-lg text-secondary">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Available Now</p>
                  <p className="text-xs text-slate-500">City Central Pharmacy</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Smart Features for Better Health
            </h2>
            <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">
              We've redesigned the pharmacy experience from the ground up.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div whileHover={{ y: -8 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft transition-all group hover:shadow-xl hover:border-primary/20">
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Location-Based Search</h3>
              <p className="text-slate-600 leading-relaxed">Instantly locate the closest pharmacies that have your required medicines currently in stock, complete with directions.</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -8 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft transition-all group hover:shadow-xl hover:border-secondary/20">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Live Inventory</h3>
              <p className="text-slate-600 leading-relaxed">Save time with live inventory updates from our partnered pharmacy networks. No more wasted trips.</p>
            </motion.div>
            
            <motion.div whileHover={{ y: -8 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft transition-all group hover:shadow-xl hover:border-primary/20">
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Pharmacies</h3>
              <p className="text-slate-600 leading-relaxed">Your safety is our priority. All pharmacies on our platform are fully vetted, licensed, and verified.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="mt-4 text-xl text-slate-500">
              See what our community has to say about MediLink.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 flex flex-col h-full"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic mb-6 flex-grow">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={clsx(
                  "border rounded-2xl transition-all duration-200 overflow-hidden",
                  openFaq === idx ? "border-primary shadow-md bg-emerald-50/30" : "border-slate-200 bg-white hover:border-primary/50"
                )}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex justify-between items-center w-full px-6 py-5 text-left focus:outline-none"
                >
                  <span className="font-semibold text-slate-900 text-lg">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-slate-600">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
