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
            {/* Protected Application Routes (Require Authentication First) */}
            <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="features" element={<ProtectedRoute><Features /></ProtectedRoute>} />
            <Route path="search" element={<ProtectedRoute><SearchMedicine /></ProtectedRoute>} />
            <Route path="find" element={<ProtectedRoute><FindMedicineWizard /></ProtectedRoute>} />
            <Route path="optimizer" element={<ProtectedRoute><PrescriptionOptimizer /></ProtectedRoute>} />
            <Route path="medicine/:id" element={<ProtectedRoute><MedicineDetails /></ProtectedRoute>} />
            <Route path="pharmacies" element={<ProtectedRoute><NearbyPharmacies /></ProtectedRoute>} />
            <Route path="reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="emergency" element={<ProtectedRoute><EmergencyMode /></ProtectedRoute>} />
            <Route path="scanner" element={<ProtectedRoute><PrescriptionScanner /></ProtectedRoute>} />

            {/* Public Authentication Pages */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

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
