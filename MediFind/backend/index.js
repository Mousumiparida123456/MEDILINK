const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock database
const users = [
  { id: '1', name: 'Demo Patient (Om)', email: 'patient@medilink.com', password: 'password', role: 'user', phone: '+1 (555) 019-2834' },
  { id: '2', name: 'City Central Pharmacy', email: 'pharmacy@medilink.com', password: 'password', role: 'pharmacy', phone: '+1 (555) 890-1234' },
  { id: '3', name: 'System Administrator', email: 'admin@medilink.com', password: 'password', role: 'admin', phone: '+1 (555) 999-0000' },
];

const medicines = [
  {
    _id: 'med_1',
    brandName: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    diseaseTags: ['fever', 'pain', 'headache'],
    price: 12.50,
    stockAvailability: { inStock: true, quantity: 45 },
    pharmacyName: 'Apollo Pharmacy',
    rating: 4.8,
    distance: 1.2,
    location: { coordinates: [85.8245, 20.2961] }
  },
  {
    _id: 'med_2',
    brandName: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    diseaseTags: ['infection', 'bacterial', 'antibiotic'],
    price: 24.00,
    stockAvailability: { inStock: true, quantity: 20 },
    pharmacyName: 'MedPlus Chemist',
    rating: 4.6,
    distance: 2.4,
    location: { coordinates: [85.8300, 20.3000] }
  },
  {
    _id: 'med_3',
    brandName: 'Cetirizine 10mg',
    genericName: 'Cetirizine Hydrochloride',
    diseaseTags: ['allergy', 'cold', 'sneezing'],
    price: 8.75,
    stockAvailability: { inStock: true, quantity: 100 },
    pharmacyName: 'City Central Pharmacy',
    rating: 4.9,
    distance: 0.8,
    location: { coordinates: [85.8200, 20.2900] }
  }
];

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'MediLink Backend Express API is running' });
});

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User already exists with this email' });
  }

  const newUser = { id: String(Date.now()), name, email, password, role: role || 'user', phone };
  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    message: 'User registered successfully',
    user: userWithoutPassword,
    token: `token_express_${newUser.id}_${Date.now()}`
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: 'Login successful',
    user: userWithoutPassword,
    token: `token_express_${user.id}_${Date.now()}`
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ message: 'Password reset link sent (mock)' });
});

// Medicine Routes
app.get('/api/medicines/search', (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase();
  const filtered = medicines.filter(m => 
    !q || m.brandName.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.diseaseTags.some(t => t.toLowerCase().includes(q))
  );
  res.json(filtered);
});

app.get('/api/medicines/suggest', (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase();
  const suggestions = medicines
    .filter(m => m.brandName.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q))
    .map(m => m.brandName);
  res.json(suggestions);
});

// Notifications Route
app.get('/api/notifications', (req, res) => {
  res.json([
    { title: 'Welcome to MediLink!', message: 'Explore nearest pharmacies and medicine search.', isRead: false },
    { title: 'Order Confirmed', message: 'Your Paracetamol reservation is ready for pickup.', isRead: true }
  ]);
});

app.patch('/api/notifications/read-all', (req, res) => {
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`MediLink Express Backend running on http://localhost:${PORT}`);
});
