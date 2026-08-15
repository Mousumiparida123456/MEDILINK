import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Features } from './pages/Features';
import { SearchMedicine } from './pages/SearchMedicine';
import { NearbyPharmacies } from './pages/NearbyPharmacies';
import { FindMedicineWizard } from './pages/FindMedicineWizard';
import { Reviews } from './pages/Reviews';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MedicineDetails } from './pages/MedicineDetails';
import { MyReservations } from './pages/MyReservations';
import { PharmacyDashboard } from './pages/PharmacyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PrescriptionOptimizer } from './pages/PrescriptionOptimizer';
import { EmergencyMode } from './pages/EmergencyMode';
import { PrescriptionScanner } from './pages/PrescriptionScanner';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="features" element={<Features />} />
          <Route path="search" element={<SearchMedicine />} />
          <Route path="find" element={<FindMedicineWizard />} />
          <Route path="optimizer" element={<PrescriptionOptimizer />} />
          <Route path="medicine/:id" element={<MedicineDetails />} />
          <Route path="pharmacies" element={<NearbyPharmacies />} />
          <Route path="reservations" element={<MyReservations />} />
          <Route path="dashboard" element={<PharmacyDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="emergency" element={<EmergencyMode />} />
          <Route path="scanner" element={<PrescriptionScanner />} />
        </Route>
      </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}

export default App;
