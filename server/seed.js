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
    
    // Create dummy Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@medilink.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true
    });

    // Create dummy pharmacy
    let pharmacy = await User.findOne({ email: 'pharmacy@medilink.com' });
    if (!pharmacy) {
      pharmacy = await User.create({
        name: 'City Central Pharmacy',
        email: 'pharmacy@medilink.com',
        password: 'hashedpassword123', // Just a placeholder for seeding
        role: 'pharmacy',
        isVerified: true
      });
    }

    const medicines = [
      {
        brandName: 'Amoxil',
        genericName: 'Amoxicillin',
        diseaseTags: ['infection', 'bacterial', 'antibiotic'],
        price: 15.99,
        stockAvailability: { inStock: true, quantity: 50 },
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        rating: 4.8
      },
      {
        brandName: 'Panadol',
        genericName: 'Paracetamol',
        diseaseTags: ['fever', 'pain relief', 'headache'],
        price: 5.50,
        stockAvailability: { inStock: true, quantity: 120 },
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        rating: 4.9
      },
      {
        brandName: 'Zyrtec',
        genericName: 'Cetirizine',
        diseaseTags: ['allergy', 'antihistamine', 'hay fever'],
        price: 12.00,
        stockAvailability: { inStock: false, quantity: 0 },
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        rating: 4.5
      },
      {
        brandName: 'Ventolin',
        genericName: 'Salbutamol',
        diseaseTags: ['asthma', 'inhaler', 'breathing'],
        price: 25.00,
        stockAvailability: { inStock: true, quantity: 15 },
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        rating: 4.7
      }
    ];

    await Medicine.insertMany(medicines);
    console.log('Database seeded with dummy medicines!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
