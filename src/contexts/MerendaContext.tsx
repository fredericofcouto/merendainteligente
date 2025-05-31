"use client";

import type { AppFoodItem } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface MerendaContextType {
  inventory: AppFoodItem[];
  addFoodItem: (item: Omit<AppFoodItem, 'id'>) => void;
  updateFoodItemQuantity: (id: string, newQuantity: number) => void;
  updateFoodItem: (item: AppFoodItem) => void;
  deleteFoodItem: (id: string) => void;
  getFoodItemById: (id: string) => AppFoodItem | undefined;
  isLoading: boolean;
}

const MerendaContext = createContext<MerendaContextType | undefined>(undefined);

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const initialInventory: AppFoodItem[] = [
  { id: generateId(), name: 'Arroz Integral', quantity: 50, unit: 'kg', nutritionalInfo: 'Rico em fibras, vitaminas do complexo B.', lowStockThreshold: 10 },
  { id: generateId(), name: 'Feijão Carioca', quantity: 40, unit: 'kg', nutritionalInfo: 'Fonte de proteína vegetal, ferro e fibras.', lowStockThreshold: 10 },
  { id: generateId(), name: 'Peito de Frango', quantity: 30, unit: 'kg', nutritionalInfo: 'Proteína magra, vitaminas B6 e B12.', lowStockThreshold: 5 },
  { id: generateId(), name: 'Maçã', quantity: 100, unit: 'un', nutritionalInfo: 'Rica em fibras, vitamina C e antioxidantes.', lowStockThreshold: 20 },
  { id: generateId(), name: 'Cenoura', quantity: 20, unit: 'kg', nutritionalInfo: 'Fonte de vitamina A (betacaroteno) e fibras.', lowStockThreshold: 5 },
  { id: generateId(), name: 'Leite em Pó', quantity: 15, unit: 'kg', nutritionalInfo: 'Fonte de cálcio e proteína.', lowStockThreshold: 3 },
];

export const MerendaProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<AppFoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from storage or API
    const storedInventory = localStorage.getItem('merendaInventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    } else {
      setInventory(initialInventory);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('merendaInventory', JSON.stringify(inventory));
    }
  }, [inventory, isLoading]);

  const addFoodItem = (item: Omit<AppFoodItem, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    setInventory(prev => [...prev, newItem]);
  };

  const updateFoodItemQuantity = (id: string, newQuantity: number) => {
    setInventory(prev => 
      prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item)
    );
  };

  const updateFoodItem = (updatedItem: AppFoodItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteFoodItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const getFoodItemById = (id: string) => {
    return inventory.find(item => item.id === id);
  };

  return (
    <MerendaContext.Provider value={{ inventory, addFoodItem, updateFoodItemQuantity, updateFoodItem, deleteFoodItem, getFoodItemById, isLoading }}>
      {children}
    </MerendaContext.Provider>
  );
};

export const useMerenda = () => {
  const context = useContext(MerendaContext);
  if (context === undefined) {
    throw new Error('useMerenda must be used within a MerendaProvider');
  }
  return context;
};
