# 💊 Rx Find — Medicine Discovery & Pharmacy Inventory Platform

> **Know where your medicine is before you leave home.**

Rx Find is a location-aware medicine discovery platform that helps users find, compare, and reserve medicines from nearby pharmacies.

The platform addresses the problem of medicine availability discovery by allowing users to search for a medicine, identify nearby pharmacies with available stock, compare prices, and reserve the medicine before visiting the pharmacy.

### 🔗 Links

* **Live Application:** https://medilink-tawny-gamma.vercel.app/
* **GitHub Repository:** https://github.com/Mousumiparida123456/MEDILINK

---

# 🧩 Problem Statement

Traditional medicine purchasing often follows a trial-and-error workflow:

```text
Doctor Prescription
        ↓
Visit Pharmacy
        ↓
Check Availability
        ↓
     Not Found
        ↓
Visit Another Pharmacy
        ↓
      Repeat
```

This becomes inefficient for **urgent medicines, uncommon drugs, and time-sensitive requirements**.

Rx Find converts this into a:

```text
SEARCH → DISCOVER → COMPARE → RESERVE → COLLECT
```

workflow.

---

# 💡 Solution

Rx Find acts as a digital discovery layer between **patients and pharmacies**.

```text
                     Rx Find
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     Medicine        Location       Pharmacy
      Search          Service       Inventory
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                Availability Engine
                         │
                  ┌──────┴──────┐
                  ↓             ↓
              Pricing       Reservation
                  │             │
                  └──────┬──────┘
                         ↓
                    QR Collection
```

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────┐
│                     CLIENT LAYER                     │
│                                                      │
│              React + TypeScript + Vite               │
│                                                      │
│  Search │ Pharmacy │ Inventory │ Reservation │ User  │
└─────────────────────────┬────────────────────────────┘
                          │
                          │ HTTP / REST API
                          ↓
┌──────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                  │
│                                                      │
│          Authentication & Authorization              │
│          Medicine Search Service                     │
│          Pharmacy Discovery Service                  │
│          Inventory Service                           │
│          Price Comparison Service                    │
│          Reservation Service                         │
│          QR Verification Service                     │
└─────────────────────────┬────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────┐
│                       DATA LAYER                     │
│                                                      │
│       Users │ Medicines │ Pharmacies │ Inventory     │
│       Reservations │ Prices │ Transactions           │
└──────────────────────────────────────────────────────┘
```

---

# ⚙️ Core Technical Modules

## 🔐 1. Authentication & Authorization

The authentication layer manages user identity and controls access to protected resources.

```text
User
 ↓
Authentication
 ↓
Session / Token
 ↓
Authorization
 ↓
Protected Resources
```

The architecture supports role-based access:

```text
USER
 ├── Search medicine
 ├── Find pharmacies
 ├── Compare prices
 ├── Reserve medicine
 └── View reservations

PHARMACY MANAGER
 ├── Manage inventory
 ├── Update stock
 ├── Update prices
 └── Manage reservations
```

---

# 🔍 2. Medicine Search Engine

Users can search for medicines by name.

```text
Search Query
     ↓
Normalize Input
     ↓
Medicine Lookup
     ↓
Matching Medicines
     ↓
Availability Search
```

Example:

```text
Input:
"Paracetamol 500"
        ↓
Medicine Database
        ↓
Matching Pharmacies
        ↓
┌────────────────────────────────────┐
│ Pharmacy A │ 12 units │ ₹25 │ 1.2km│
│ Pharmacy B │  5 units │ ₹23 │ 2.0km│
│ Pharmacy C │ 20 units │ ₹27 │ 2.4km│
└────────────────────────────────────┘
```

---

# 📍 3. Location-Based Pharmacy Discovery

Rx Find uses the user's location to identify nearby pharmacies.

```text
User Location
     ↓
Latitude + Longitude
     ↓
Pharmacy Coordinates
     ↓
Distance Calculation
     ↓
Nearest Pharmacies
```

A geographic distance calculation can be used to rank pharmacies based on proximity.

```text
Distance =
f(user_latitude,
  user_longitude,
  pharmacy_latitude,
  pharmacy_longitude)
```

Pharmacies can then be sorted by distance or filtered using a configurable search radius.

---

# 📦 4. Inventory Management

Each pharmacy maintains medicine inventory information.

### Medicine

```text
Medicine
 ├── medicineId
 ├── name
 ├── manufacturer
 ├── dosage
 └── category
```

### Inventory

```text
Inventory
 ├── inventoryId
 ├── pharmacyId
 ├── medicineId
 ├── quantity
 ├── price
 └── updatedAt
```

Basic availability can be determined using:

```text
quantity > 0
```

The `updatedAt` field can be used to determine how recently inventory information was synchronized.

---

# 💰 5. Price Comparison

When multiple pharmacies have the requested medicine, Rx Find can compare their prices.

```text
Medicine
   ↓
Available Pharmacies
   ↓
Fetch Prices
   ↓
Sort by Price
   ↓
Display Comparison
```

Example:

| Pharmacy   | Availability | Price | Distance |
| ---------- | -----------: | ----: | -------: |
| Pharmacy A |     12 units |   ₹25 |   1.2 km |
| Pharmacy B |      5 units |   ₹23 |   2.0 km |
| Pharmacy C |     20 units |   ₹27 |   2.4 km |

Users can optimize their choice based on **price, distance, or availability**.

---

# 🔒 6. Reservation System

After selecting a pharmacy, the user can reserve the required medicine.

### Reservation Lifecycle

```text
AVAILABLE
    ↓
RESERVE REQUEST
    ↓
VALIDATE STOCK
    ↓
STOCK AVAILABLE?
   / \
 YES  NO
  ↓    ↓
LOCK   REJECT
STOCK
  ↓
CREATE RESERVATION
  ↓
GENERATE QR
  ↓
RESERVED
  ↓
PHARMACY COLLECTION
  ↓
COMPLETED
```

Stock should be validated at the time of reservation to reduce race conditions when multiple users attempt to reserve limited inventory.

---

# 🎫 7. QR-Based Collection

After a successful reservation:

```text
Reservation
     ↓
Generate Unique Reservation ID
     ↓
Generate QR Code
     ↓
User Presents QR
     ↓
Pharmacy Verification
     ↓
Reservation Confirmed
     ↓
Inventory Updated
```

The QR code provides a convenient way for the pharmacy to identify and verify the reservation.

---

# 💊 8. Generic Alternative Discovery

If the requested medicine is unavailable:

```text
Requested Medicine
        ↓
Check Availability
        ↓
     Unavailable
        ↓
Find Equivalent Medicines
        ↓
Display Alternatives
```

Alternative medicines should be presented as informational suggestions and not as automatic prescription substitutions. Users should consult a qualified doctor or pharmacist before changing medication.

---

# 🔄 End-to-End Data Flow

```text
                    USER
                     │
                     ↓
              Search Medicine
                     │
                     ↓
              Medicine Service
                     │
                     ↓
             Location Service
                     │
                     ↓
          Nearby Pharmacy Search
                     │
                     ↓
             Inventory Service
                     │
              ┌──────┴──────┐
              ↓             ↓
         Available       Unavailable
              │             │
              ↓             ↓
       Price Comparison   Alternatives
              │
              ↓
         Select Pharmacy
              │
              ↓
        Reservation API
              │
              ↓
        Stock Validation
              │
              ↓
       Reservation Created
              │
              ↓
           QR Code
              │
              ↓
       Pharmacy Collection
```

---

# 🗃️ Data Model

A simplified relational model:

```text
┌──────────────┐
│    Users     │
├──────────────┤
│ id           │
│ name         │
│ email        │
│ role         │
└──────┬───────┘
       │
       │ 1:N
       ↓
┌────────────────┐
│ Reservations   │
├────────────────┤
│ id             │
│ userId         │
│ pharmacyId     │
│ medicineId     │
│ quantity       │
│ status         │
│ createdAt      │
└───────┬────────┘
        │
        │ N:1
        ↓
┌────────────────┐
│   Pharmacy     │
├────────────────┤
│ id             │
│ name           │
│ latitude       │
│ longitude      │
│ address        │
└───────┬────────┘
        │
        │ 1:N
        ↓
┌────────────────┐
│   Inventory    │
├────────────────┤
│ id             │
│ pharmacyId     │
│ medicineId     │
│ quantity       │
│ price          │
│ updatedAt      │
└───────┬────────┘
        │
        │ N:1
        ↓
┌────────────────┐
│   Medicines    │
├────────────────┤
│ id             │
│ name           │
│ manufacturer   │
│ dosage         │
│ category       │
└────────────────┘
```

---

# 🛠️ Technology Stack

### Frontend

* **React**
* **TypeScript**
* **Vite**
* HTML5
* CSS3

### Architecture

* Component-based architecture
* Client-side routing
* REST API integration
* Modular service architecture
* State-driven UI
* Role-based access control

### Location

* Browser Geolocation API
* Latitude/longitude-based pharmacy discovery
* Distance-based pharmacy ranking

### Data

* Medicine catalogue
* Pharmacy records
* Inventory records
* Pricing information
* User accounts
* Reservation records

### Deployment

* **Vercel**

---

# 📁 Project Structure

```text
RX-FIND/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── MedicineCard/
│   │   ├── PharmacyCard/
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── MedicineSearch/
│   │   ├── Pharmacy/
│   │   ├── Reservation/
│   │   └── ...
│   │
│   ├── services/
│   │   ├── medicineService
│   │   ├── pharmacyService
│   │   ├── inventoryService
│   │   └── reservationService
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mousumiparida123456/MEDILINK.git
```

### 2. Navigate to the project

```bash
cd MEDILINK
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the local development URL displayed in the terminal.

---

# 🌐 Deployment

Rx Find is deployed using **Vercel**.

### Live Application

https://medilink-tawny-gamma.vercel.app/

---

# 🔐 Security Considerations

For production deployment, Rx Find should implement:

* Secure authentication
* Password hashing
* Token/session management
* Role-based authorization
* API authorization
* Input validation
* Rate limiting
* HTTPS
* Secure environment variables
* Reservation concurrency control
* Audit logging
* Protection of prescription-related information

---

# ⚡ Scalability

The architecture can evolve toward independent services:

```text
                    API Gateway
                         │
              ┌──────────┼──────────┐
              ↓          ↓          ↓
          Medicine   Pharmacy   Reservation
           Service    Service      Service
              │          │          │
              └──────────┼──────────┘
                         ↓
                      Database
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
           Cache                 Search
          Layer                  Index
```

Potential optimizations:

* Redis caching for frequently searched medicines
* Database indexing
* Geospatial database indexing
* Background inventory synchronization
* Queue-based notifications
* Horizontal API scaling
* CDN-based frontend delivery

---

# 🔮 Future Enhancements

### Pharmacy Management

* Real-time inventory dashboard
* Low-stock alerts
* Expiry-date tracking
* Bulk inventory updates

### User Experience

* Interactive map-based pharmacy discovery
* Medicine availability notifications
* Reservation expiry timers
* Order history
* Advanced search and filtering

### Healthcare Integration

* Digital prescription upload
* Prescription verification
* Doctor/pharmacist approval workflow
* Medicine interaction warnings

### Intelligence

* Medicine demand prediction
* Low-stock prediction
* Pharmacy analytics
* Intelligent pharmacy ranking
* AI-powered medicine information assistant

---

# 📊 Key Engineering Challenges

Rx Find involves several real-world engineering challenges:

### 1. Real-Time Inventory

Keeping pharmacy inventory synchronized is critical because a displayed availability status becomes useless if the stock information is stale.

### 2. Geospatial Search

Pharmacies need to be efficiently filtered and ranked based on the user's location.

### 3. Concurrent Reservations

Multiple users may attempt to reserve the same limited stock simultaneously. Reservation logic therefore needs atomic stock validation and controlled inventory updates.

### 4. Data Consistency

Medicine availability, price, and reservation status must remain consistent across the application.

### 5. Role-Based Access

Users and pharmacy managers require different permissions and application workflows.

---

# 🎯 Core Value Proposition

Traditional workflow:

```text
SEARCH
  ↓
TRAVEL
  ↓
CHECK
  ↓
OUT OF STOCK
  ↓
REPEAT
```

Rx Find workflow:

```text
SEARCH
  ↓
LOCATE
  ↓
VERIFY
  ↓
COMPARE
  ↓
RESERVE
  ↓
COLLECT
```

> **Rx Find reduces the uncertainty and wasted travel involved in finding medicines by connecting users with pharmacy availability information before they visit.**

---

# 👨‍💻 Project

**Rx Find — Medicine Discovery & Pharmacy Inventory Platform**

Built with **React, TypeScript and Vite**, focusing on location-aware pharmacy discovery, medicine availability, price comparison, reservation management, and QR-based collection.
