# React + TypeScript + Vite

"Imagine it's 11:30 PM. A patient's child suddenly develops a high fever. The doctor prescribes an emergency medicine, but after visiting three pharmacies, none have it. Every minute matters. Our platform solves this by showing which nearby pharmacy has the medicine in stock before the patient leaves home."

project deployement link : https://medi-link-liard.vercel.app/

"Google Maps tells you where a place is.

Swiggy tells you which restaurant has food.

MediFind tells you exactly where your medicine is available."

Search Medicine

Problem:
"I don't know which pharmacy has it."

Solution:
Search once.

Nearby Pharmacy

Problem:
"I don't know which shop is nearest."

Solution:
GPS shows the closest pharmacy.

Live Stock

Problem:
"I reach the shop only to find it's out of stock."

Solution:
Real-time inventory.

Reservation

Problem:
"Someone may buy the last strip before I reach."

Solution:
Reserve instantly.

Generic Alternative

Problem:
"My medicine isn't available."

Solution:
Show equivalent generic medicines with doctor-approved information.

Price Comparison

Problem:
"One pharmacy charges much more."

Solution:
Compare prices before purchasing.

#FLOW

Register

↓

Search Medicine

↓

Current Location

↓

Nearby Pharmacies

↓

Availability

↓

Compare Price

↓

Reserve Medicine

↓

Receive QR Code

↓

Visit Pharmacy

↓

Collect Medicine

# MediLink (MediFind)

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
