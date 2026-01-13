// Simple reusable SVG icons with consistent stroke and size
// Usage: <MenuIcon />, <UserIcon />, <LogoutIcon /> etc.
import React from 'react';

const base = {
  width: 24,
  height: 24,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export const MenuIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const UserIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const LogoutIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

// Category icons
export const FoodIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 3v7a2 2 0 0 0 2 2h2V3" />
    <path d="M10 3v9a4 4 0 0 1-4 4H4" />
    <path d="M14 3v7a5 5 0 1 0 10 0V3" />
  </svg>
);

export const TransportIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 17h14l1-5-3-6H7L4 12l1 5z" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="16.5" cy="17.5" r="1.5" />
  </svg>
);

export const ShoppingIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2l1 4h10l1-4" />
    <path d="M6 6h12l-1 14H7L6 6z" />
    <path d="M9 10a3 3 0 0 0 6 0" />
  </svg>
);

export const EntertainmentIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5h16v14H4z" />
    <path d="M9 10l6 3-6 3v-6z" />
  </svg>
);

export const HealthIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Additional generic UI icons
export const ChartIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 3v18h18" />
    <path d="M7 15l4-4 3 3 5-6" />
  </svg>
);

export const CalendarIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 9h18" />
  </svg>
);

export const WalletIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 7h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    <path d="M17 12h2" />
  </svg>
);

// Finance/dashboard icons
export const ReceiptIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2z" />
    <path d="M8 7h8M8 11h8M8 15h6" />
  </svg>
);

export const BalanceIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v18" />
    <path d="M3 7h18" />
    <path d="M6 7l-3 6a3 3 0 0 0 6 0L6 7zM18 7l-3 6a3 3 0 0 0 6 0L18 7z" />
  </svg>
);

export const CountIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 3l4 18M15 3l4 18" />
    <path d="M3 8h18M2 16h18" />
  </svg>
);

export const BillsIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </svg>
);

export const OthersIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12h6M12 9v6" />
  </svg>
);

// System and utility icons
export const TransferIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 7h10l-3-3M7 17h10l-3 3" />
    <path d="M7 7v10" />
  </svg>
);

export const EditIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export const TrashIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const WarningIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const NoteIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 3h12l4 4v14H4z" />
    <path d="M16 3v4h4" />
    <path d="M8 13h8M8 17h6M8 9h5" />
  </svg>
);

// Account and finance specific icons
export const BankIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3L3 7v2h18V7l-9-4z" />
    <path d="M4 11h16M6 11v8M10 11v8M14 11v8M18 11v8M3 19h18" />
  </svg>
);

export const CreditCardIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h3" />
  </svg>
);

export const PiggyBankIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 11a7 7 0 0 1 12 0v3h2v2h-3a5 5 0 0 1-10 0H3v-2h2v-3z" />
    <circle cx="9" cy="10" r="1" />
  </svg>
);

export const InvestmentIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 3v18h18" />
    <path d="M7 17l4-4 3 3 5-6" />
  </svg>
);

export const HomeIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 12l9-9 9 9" />
    <path d="M5 10v10h14V10" />
  </svg>
);

export const ShieldIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
  </svg>
);

export const BookIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M4 4h16v13H6.5A2.5 2.5 0 0 0 4 19.5z" />
  </svg>
);

export const BoltIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
  </svg>
);

// Basic UI icons
export const PlusIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const EyeIcon = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
