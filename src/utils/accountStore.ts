import type { UserRole } from '../context/AuthContext';

export interface RegisteredAccount {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  pharmacyName?: string;
  licenceNumber?: string;
  pharmacistName?: string;
  pharmacistRegistrationNumber?: string;
}

const REGISTERED_ACCOUNTS_KEY = 'medilink_registered_accounts';

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    name: 'Authorized Manager',
    email: 'nlm.qwerty1289@gmail.com',
    phone: '9876543210',
    password: 'qwerty',
    role: 'manager',
  },
  {
    name: 'Demo Patient',
    email: 'patient@medilink.com',
    phone: '9876543210',
    password: 'password123',
    role: 'user',
  },
];

export const getRegisteredAccounts = (): RegisteredAccount[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  } catch (err) {
    console.warn('Failed reading registered accounts:', err);
    return DEFAULT_ACCOUNTS;
  }
};

export const findAccountByEmail = (email: string): RegisteredAccount | undefined => {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  return accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);
};

export const registerNewAccount = (newAcc: RegisteredAccount): { success: boolean; message?: string } => {
  const cleanEmail = newAcc.email.trim().toLowerCase();
  const cleanPhone = newAcc.phone.trim();
  const accounts = getRegisteredAccounts();

  const emailExists = accounts.some((acc) => acc.email.toLowerCase() === cleanEmail);
  if (emailExists) {
    return { success: false, message: 'An account with this email already exists. Please login instead.' };
  }

  if (newAcc.role === 'user') {
    const phoneExists = accounts.some((acc) => acc.role === 'user' && acc.phone.trim() === cleanPhone);
    if (phoneExists) {
      return { success: false, message: 'An account with this mobile number already exists.' };
    }
  }

  const updated = [...accounts, { ...newAcc, email: cleanEmail, phone: cleanPhone }];
  try {
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed storing registered account:', err);
  }

  return { success: true };
};
