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
│              React + TypeScript +
```
