// storage.ts - Fixed version with safe localStorage access

import { ExpenseType } from "../(project)/(private)/expense-type/page";
import { Users } from "../components/client-details";
import { Clients } from "../components/client-table";
import { Payment } from "../components/cost-center";

export function initializePayments(key: string) {
  // Check if we're in the browser (client-side)
  if (typeof window !== 'undefined' && window.localStorage) {
    const existingData = localStorage.getItem(key);
    if (!existingData) {
      localStorage.setItem(key, JSON.stringify([])); // Fix: stringify empty array
    }
  }
}

export function getPayments(key: string) {
  // Check if we're in the browser (client-side)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }
  return []; // Return empty array if not in browser
}

export function addPayment(
  key: string,
  newPayment: Payment | Clients | Users | ExpenseType
) {
  // Check if we're in the browser (client-side)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const payments = getPayments(key);
      payments.push(newPayment);
      localStorage.setItem(key, JSON.stringify(payments));
    } catch (error) {
      console.error(`Error adding payment to ${key}:`, error);
    }
  }
}

export function deletePayment(key: string, id: string) {
  // Check if we're in the browser (client-side)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const payments = getPayments(key);
      const updatedPayments = payments.filter((payment: any) => payment.id !== id);
      localStorage.setItem(key, JSON.stringify(updatedPayments));
    } catch (error) {
      console.error(`Error deleting payment from ${key}:`, error);
    }
  }
}

export function updatePayment(
  key: string,
  updatedPayment: Payment | Clients | Users | ExpenseType
) {
  // Check if we're in the browser (client-side)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const payments = getPayments(key);
      const updatedPayments = payments.map((payment: any) =>
        payment.id === updatedPayment.id ? updatedPayment : payment
      );
      localStorage.setItem(key, JSON.stringify(updatedPayments));
    } catch (error) {
      console.error(`Error updating payment in ${key}:`, error);
    }
  }
}

// Additional helper functions for better localStorage management
export function clearStorage(key: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing localStorage key ${key}:`, error);
    }
  }
}

export function getAllStorageKeys(): string[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }
  return [];
}