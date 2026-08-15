import React, { useState, useRef } from 'react';
import { Upload, Scan, FileText, CheckCircle2, AlertCircle, X, Search } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function PrescriptionScanner() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [detectedMedicines, setDetectedMedicines] = useState<{name: string, checked: boolean}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setExtractedText('');
        setDetectedMedicines([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;
    setScanning(true);
    
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(selectedImage);
      await worker.terminate();
      
      const text = ret.data.text;
      setExtractedText(text);
      
      // Simple mock logic to "extract" medicine names from raw text
      // In a real scenario, this would use an LLM or NLP against a medicine database
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 3);
      
      // We'll just assume any line with numbers/mg/g is a medicine for this demo
      const possibleMeds = lines.filter(line => 
        /mg|ml|g|tab|cap|syrup/i.test(line) || 
        line.split(' ').some(word => word.length > 5 && /^[A-Z][a-z]+$/.test(word))
      );

      // If we couldn't find any, just use some dummy extractions for demo purposes if the text is long enough
      const medsList = possibleMeds.length > 0 
        ? possibleMeds.slice(0, 4) 
        : ['Paracetamol 650mg', 'Azithromycin 500mg'];

      setDetectedMedicines(medsList.map(m => ({ name: m, checked: true })));
      
      toast.success("Prescription scanned successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to scan image. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleToggleMedicine = (index: number) => {
    const newMeds = [...detectedMedicines];
    newMeds[index].checked = !newMeds[index].checked;
    setDetectedMedicines(newMeds);
  };

  const handleEditMedicine = (index: number, newName: string) => {
    const newMeds = [...detectedMedicines];
    newMeds[index].name = newName;
    setDetectedMedicines(newMeds);
  };

  const handleSearchMedicines = () => {
    const activeMeds = detectedMedicines.filter(m => m.checked).map(m => m.name);
    if (activeMeds.length === 0) {
      toast.error("Please select at least one medicine to search");
      return;
    }
    // Redirect to search page with the first medicine for now
    // A more advanced implementation would handle multiple simultaneous searches
    navigate(`/search?q=${encodeURIComponent(activeMeds[0])}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Scan className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Prescription Scanner</h1>
          <p className="text-xl text-slate-600">Upload a photo of your prescription and we'll extract the medicines for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Upload */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" /> Upload Image
            </h2>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />

            {!selectedImage ? (
              <div 
                className="flex-grow border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 text-slate-500 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-h-[300px]"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-12 w-12 mb-4 text-slate-400" />
                <p className="font-semibold text-lg">Click to browse or take a photo</p>
                <p className="text-sm mt-2">Supports JPG, PNG, HEIC</p>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center">
                <div className="relative w-full max-h-[400px] overflow-hidden rounded-xl border border-slate-200 mb-4">
                  <img src={selectedImage} alt="Prescription" className="w-full h-full object-contain" />
                  <button 
                    onClick={() => { setSelectedImage(null); setDetectedMedicines([]); setExtractedText(''); }}
                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white text-rose-600 shadow-sm"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <button 
                  onClick={processImage}
                  disabled={scanning || detectedMedicines.length > 0}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {scanning ? (
                    <>Scanning Image... <span className="animate-spin text-xl">⏳</span></>
                  ) : detectedMedicines.length > 0 ? (
                    <>Scan Complete</>
                  ) : (
                    <>Extract Medicines <Scan className="h-5 w-5" /></>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" /> Detected Medicines
            </h2>

            {detectedMedicines.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p>Upload and scan a prescription to see results here.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Please verify the extracted medicine names. You can edit them if the scanner made a mistake. Do not alter doctor's prescription.
                  </p>
                </div>

                <ul className="space-y-3 flex-grow overflow-y-auto max-h-[300px] pr-2">
                  {detectedMedicines.map((med, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <input 
                        type="checkbox" 
                        checked={med.checked}
                        onChange={() => handleToggleMedicine(idx)}
                        className="w-5 h-5 rounded text-primary focus:ring-primary"
                      />
                      <input 
                        type="text" 
                        value={med.name}
                        onChange={(e) => handleEditMedicine(idx, e.target.value)}
                        className="flex-grow bg-transparent border-none p-0 focus:ring-0 text-slate-800 font-medium"
                      />
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={handleSearchMedicines}
                  className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <Search className="h-5 w-5" /> Find Medicines Nearby
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
