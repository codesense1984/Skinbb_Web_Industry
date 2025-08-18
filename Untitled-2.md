src/
├── app/ # Application shell only
│ ├── main.tsx
│ ├── vite-env.d.ts
│ └── router/
│ └── index.tsx # Aggregates module routes
│ └── providers/
│ ├── ThemeProvider.tsx
│ └── StoreProvider.tsx
│ └── guards/ # Generic route guards
│
├── core/ # Cross-cutting, shared, stable layer
│ ├── assets/
│ │ ├── fonts/
│ │ ├── icons/
│ │ └── images/
│ ├── components/
│ │ ├── ui/ # your shadcn components
│ │ │ ├── form.tsx
│ │ │ ├── form-input.tsx
│ │ │ ├── textarea.tsx
│ │ │ ├── table.tsx
│ │ │ ├── select.tsx
│ │ │ ├── structure.tsx
│ │ │ └── data-table.tsx
│ │ ├── charts/
│ │ ├── dialogs/
│ │ ├── cytoscape/
│ │ └── table/
│ ├── config/
│ │ ├── baseUrls.ts
│ │ ├── constants.ts
│ │ ├── status.ts
│ │ └── svg.tsx
│ ├── hooks/
│ │ ├── useDebounce.ts
│ │ ├── useMediaQuery.ts
│ │ ├── use-file-upload.ts
│ │ └── useImagePreview.tsx
│ ├── lib/
│ ├── services/
│ │ └── http/
│ │ ├── base.service.ts
│ │ └── token.service.ts
│ ├── store/
│ │ ├── index.ts # configureStore
│ │ └── slices/ # truly global slices (rare)
│ ├── styles/
│ │ ├── font.css
│ │ ├── globals.css
│ │ └── index.css
│ ├── types/
│ │ ├── base.type.ts
│ │ └── index.ts
│ └── utils/
│ ├── classnames.ts
│ ├── date.ts
│ ├── number.ts
│ └── string.ts
│
├── modules/
│ ├── auth/
│ │ ├── components/
│ │ │ └── Guard.tsx
│ │ ├── features/
│ │ │ ├── sign-in/
│ │ │ ├── sign-up/
│ │ │ └── sign-in-simple/
│ │ ├── hooks/
│ │ │ ├── useAuth.ts
│ │ │ └── usePermission.ts
│ │ ├── routes/
│ │ │ ├── constants.ts
│ │ │ ├── routes.tsx
│ │ │ ├── PrivateRoute.tsx
│ │ │ └── PublicRoute.tsx
│ │ ├── services/
│ │ │ └── auth.service.ts
│ │ ├── store/
│ │ │ └── slices/
│ │ │ └── authSlice.ts
│ │ └── types/
│ │ ├── user.type.ts
│ │ └── permission.type.ts
│ │
│ ├── ecommerce/
│ │ ├── components/
│ │ ├── features/
│ │ │ └── dashboard/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── store/
│ │ │ └── slices/
│ │ └── types/
│ │ ├── brand.type.ts
│ │ └── company.type.ts
│ │
│ ├── survey/
│ │ ├── components/
│ │ ├── features/
│ │ │ ├── create/
│ │ │ ├── list/
│ │ │ └── detail/
│ │ ├── routes/
│ │ ├── services/
│ │ │ └── survey.service.ts
│ │ ├── store/
│ │ │ └── slices/
│ │ │ └── surveySlice.ts
│ │ └── types/
│ │ └── research.type.ts
│ │
│ └── core-experiences/ # optional, for big cross-domain features
│ ├── analytics/
│ └── chat/
│
└── pages/ # optional if you do file-based routing
