require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('./src/models/Medicine');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    await Medicine.deleteMany({});
    await User.deleteMany({ role: 'pharmacy' });
    
    // Create dummy Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    let adminUser = await User.findOne({ email: 'admin@medilink.com' });
    if (!adminUser) {
        adminUser = await User.create({
        name: 'Super Admin',
        email: 'admin@medilink.com',
        password: adminPassword,
        role: 'admin',
        isVerified: true
        });
    }

    // Coordinates around Patia, Bhubaneswar (User is likely near 20.2961, 85.8245 or standard testing location)
    // We'll also add some near New York (40.7128, -74.0060) just in case they are using the fallback
    const pharmaciesData = [
      {
        name: 'Apollo Pharmacy',
        email: 'apollo@medilink.com',
        password: 'hashedpassword123',
        role: 'pharmacy',
        isVerified: true,
        isOpen: true,
        isEmergency: true,
        location: {
          type: 'Point',
          coordinates: [85.8240, 20.2955] // [lng, lat]
        }
      },
      {
        name: 'MedPlus',
        email: 'medplus@medilink.com',
        password: 'hashedpassword123',
        role: 'pharmacy',
        isVerified: true,
        isOpen: true,
        isEmergency: false,
        location: {
          type: 'Point',
          coordinates: [85.8400, 20.3100]
        }
      },
      {
        name: 'Care Pharmacy',
        email: 'care@medilink.com',
        password: 'hashedpassword123',
        role: 'pharmacy',
        isVerified: true,
        isOpen: false,
        isEmergency: false,
        location: {
          type: 'Point',
          coordinates: [85.8100, 20.2800]
        }
      },
      // NY Fallback Data
      {
        name: 'NY Central Pharmacy',
        email: 'nycentral@medilink.com',
        password: 'hashedpassword123',
        role: 'pharmacy',
        isVerified: true,
        isOpen: true,
        isEmergency: true,
        location: {
          type: 'Point',
          coordinates: [-74.0050, 40.7130] // [lng, lat]
        }
      }
    ];

    const createdPharmacies = await User.insertMany(pharmaciesData);

    const medicines = [];
    
    // Add Paracetamol and other medicines for all pharmacies
    createdPharmacies.forEach(pharmacy => {
      // Paracetamol
      medicines.push({
        brandName: 'Panadol',
        genericName: 'Paracetamol',
        diseaseTags: ['fever', 'pain relief', 'headache'],
        price: pharmacy.name === 'MedPlus' ? 27 : 25,
        stockAvailability: { 
            inStock: pharmacy.name !== 'Care Pharmacy', 
            quantity: pharmacy.name === 'Care Pharmacy' ? 0 : (pharmacy.name === 'Apollo Pharmacy' ? 20 : 10) 
        },
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        location: pharmacy.location,
        rating: pharmacy.name === 'Apollo Pharmacy' ? 5 : 4
      });

      // Amoxicillin
      medicines.push({
        brandName: 'Amoxil',
        genericName: 'Amoxicillin',
        diseaseTags: ['infection', 'bacterial', 'antibiotic'],
        price: 15.99,
        stockAvailability: { inStock: true, quantity: 50 },
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        location: pharmacy.location,
        rating: 4.8
      });

      // Cetirizine
      medicines.push({
        brandName: 'Zyrtec',
        genericName: 'Cetirizine',
        diseaseTags: ['allergy', 'antihistamine', 'hay fever'],
        price: 12.00,
        stockAvailability: { inStock: false, quantity: 0 },
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        location: pharmacy.location,
        rating: 4.5
      });
    });

    await Medicine.insertMany(medicines);
    console.log('Database seeded with dummy pharmacies and medicines!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
