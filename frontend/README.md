# Git DataHub Frontend Client (React + Vite)

This is the fully responsive user and administrator dashboard client for the Git DataHub project. It communicates directly with the MongoDB + Express backend to catalog, search, sort, filter, and modify repository instruction datasets.

## Key Features

- **Authentication System**: Secure login and sign-up forms with field-level validations (Formik + Yup) and persistent JWT storage.
- **Role-Based Protected Access**: Dynamically hides create, update, and delete actions for standard users, reserving CRUD execution capabilities to account administrators.
- **Dynamic Dataset Catalog (CRUD)**: Fully interactive data listing displaying datasets with in-place CRUD dialogue overlays (Create modal, Edit modals, and Delete confirmations).
- **Advanced Parameter Mappings**: Supports searches (q), pagination, nested Mongoose sorting (repo, type, createdAt), and flat filters (language, type).
- **Aggregations & Analytics Visualizer**: Uses **Recharts** to display real-time statistics from backend MongoDB aggregation endpoints.
- **Persistent Theme System**: Class-based Light/Dark toggle which persists user choice inside `localStorage` across page loads.
- **Dynamic SEO Helmet**: Manages dynamic document title metadata and schema.org structured JSON-LD tags route-by-route.
- **UX Polish**: Integrates Toastify notifications and loader spinners.

## Project Structure

```text
frontend/
├── index.html               # Main HTML viewport template
├── package.json             # Workspace dependencies config
├── tailwind.config.js       # Custom utility design tokens config
├── vite.config.js           # Dev server reverse proxy config (routing /api to port 5000)
└── src/
    ├── main.jsx             # React entry mounting script
    ├── App.jsx              # Main routing hub and route shields
    ├── index.css            # Tailwind directives and custom scrollbar setups
    ├── components/
    │   ├── auth/
    │   │   └── ProtectedRoute.jsx   # Role-based route guard
    │   ├── common/
    │   │   └── SEO.jsx              # Dynamic metadata tag controller
    │   └── layouts/
    │       └── DashboardLayout.jsx  # Layout shell (Sidebar + top Navbar + theme toggle)
    ├── pages/
    │   ├── auth/
    │   │   ├── Login.jsx            # Validated sign-in page
    │   │   └── Register.jsx         # Validated account sign-up page
    │   └── dashboard/
    │       ├── DataListing.jsx      # Datasets master data grid list & CRUD actions
    │       ├── Analytics.jsx        # Data visualization charts
    │       └── Profile.jsx          # Profile details & password forms
    ├── services/
    │   └── api.js                   # Central Axios client with token header interceptors
    └── store/
        ├── index.js                 # Redux state store configure
        └── slices/
            ├── authSlice.js         # Session and profiles state slice
            └── datasetSlice.js      # Datasets list, queries, and analytics slice
```

## Setup Instructions

1. **Verify Backend Status**: Ensure the backend database server is active and running on `http://localhost:5000`.
2. **Install Dependencies**:
   Open a terminal in the `frontend` folder and run:
   ```bash
   npm install
   ```
3. **Start Development Client**:
   ```bash
   npm run dev
   ```
4. **Access Portal**: Open your browser at the displayed local port (e.g. `http://localhost:3000`).
5. **Autofill Login (Testing)**: On the Login screen, click the **Demo Admin** or **Demo User** button to load test credentials immediately.
