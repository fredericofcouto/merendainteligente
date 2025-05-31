
"use client";

import type { AgendamentoItem, MealType } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { formatISO, parseISO } from 'date-fns';

interface AgendamentoContextType {
  agendamentos: AgendamentoItem[];
  addAgendamento: (item: Omit<AgendamentoItem, 'id' | 'studentName' | 'status' | 'date'> & { date: Date }) => void;
  cancelAgendamento: (id: string) => void;
  getAgendamentosByStudent: (studentName: string) => AgendamentoItem[];
  isLoading: boolean;
}

const AgendamentoContext = createContext<AgendamentoContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

// Simulated student name
const SIMULATED_STUDENT_NAME = "Aluno Exemplo";

export const AgendamentoProvider = ({ children }: { children: ReactNode }) => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAgendamentos = localStorage.getItem('merendaAgendamentos');
    if (storedAgendamentos) {
      setAgendamentos(JSON.parse(storedAgendamentos).map((item: AgendamentoItem) => ({
        ...item,
        date: item.date // Keep as string, parse when needed
      })));
    } else {
      // Optional: Add some initial dummy data for testing
      setAgendamentos([
        // Example:
        // { id: generateId(), date: formatISO(new Date()), mealType: 'almoco', studentName: SIMULATED_STUDENT_NAME, status: 'agendado' }
      ]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('merendaAgendamentos', JSON.stringify(agendamentos));
    }
  }, [agendamentos, isLoading]);

  const addAgendamento = (item: Omit<AgendamentoItem, 'id' | 'studentName' | 'status' | 'date'> & { date: Date }) => {
    const newAgendamento: AgendamentoItem = {
      ...item,
      id: generateId(),
      studentName: SIMULATED_STUDENT_NAME,
      status: 'agendado',
      date: formatISO(item.date, { representation: 'date' }), // Store date only
    };
    setAgendamentos(prev => [...prev, newAgendamento].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()));
  };

  const cancelAgendamento = (id: string) => {
    setAgendamentos(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'cancelado' } : item))
    );
  };

  const getAgendamentosByStudent = (studentName: string) => {
    return agendamentos.filter(item => item.studentName === studentName);
  };

  return (
    <AgendamentoContext.Provider value={{ agendamentos, addAgendamento, cancelAgendamento, getAgendamentosByStudent, isLoading }}>
      {children}
    </AgendamentoContext.Provider>
  );
};

export const useAgendamento = () => {
  const context = useContext(AgendamentoContext);
  if (context === undefined) {
    throw new Error('useAgendamento must be used within an AgendamentoProvider');
  }
  return context;
};
