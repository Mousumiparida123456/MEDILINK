import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { UserDashboard } from './pages/UserDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { PrescriptionOptimizer } from './pages/PrescriptionOptimizer';
import { EmergencyMode } from './pages/EmergencyMode';
import { PrescriptionScanner } from './pages/PrescriptionScanner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';



import { useAuth } from './context/AuthContext';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'manager' || user.role === 'admin' || user.role === 'pharmacy') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Index route redirects unauthenticated visitors to /login first */}
            <Route index element={<RootRedirect />} />
            <Route path="home" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="features" element={<Features />} />
            <Route path="search" element={<SearchMedicine />} />
            <Route path="find" element={<FindMedicineWizard />} />
            <Route path="optimizer" element={<PrescriptionOptimizer />} />
            <Route path="medicine/:id" element={<MedicineDetails />} />
            <Route path="pharmacies" element={<NearbyPharmacies />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="emergency" element={<EmergencyMode />} />
            <Route path="scanner" element={<PrescriptionScanner />} />

            {/* Protected USER Routes */}
            <Route 
              path="user/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="user" 
              element={<Navigate to="/user/dashboard" replace />} 
            />
            <Route 
              path="reservations" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MyReservations />
                </ProtectedRoute>
              } 
            />

            {/* Protected MANAGER Routes */}
            <Route 
              path="manager/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'pharmacy']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="manager" 
              element={<Navigate to="/manager/dashboard" replace />} 
            />
            <Route 
              path="admin" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'pharmacy']}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}

export default App;
