
"use client";

import type { AgendamentoItem, MealType } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { formatISO, parseISO } from 'date-fns';

interface AgendamentoContextType {
  agendamentos: AgendamentoItem[];
  addAgendamento: (item: Omit<AgendamentoItem, 'id' | 'studentName' | 'status' | 'date'> & { date: Date }) => void;
  updateAgendamento: (id: string, data: { date: Date; mealType: MealType }) => void;
  removeAgendamento: (id: string) => void;
  // getAgendamentosByStudent: (studentName: string) => AgendamentoItem[]; // No longer used by agendamento page directly for list
  isLoading: boolean;
}

const AgendamentoContext = createContext<AgendamentoContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

const SIMULATED_STUDENT_NAME = "Aluno Exemplo";

export const AgendamentoProvider = ({ children }: { children: ReactNode }) => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAgendamentos = localStorage.getItem('merendaAgendamentos');
    if (storedAgendamentos) {
      setAgendamentos(JSON.parse(storedAgendamentos).map((item: AgendamentoItem) => ({
        ...item,
      })));
    } else {
      setAgendamentos([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('merendaAgendamentos', JSON.stringify(agendamentos));
    }
  }, [agendamentos, isLoading]);

  const addAgendamento = useCallback((item: Omit<AgendamentoItem, 'id' | 'studentName' | 'status' | 'date'> & { date: Date }) => {
    const newAgendamento: AgendamentoItem = {
      ...item,
      id: generateId(),
      studentName: SIMULATED_STUDENT_NAME,
      status: 'agendado',
      date: formatISO(item.date, { representation: 'date' }), 
    };
    setAgendamentos(prev => [...prev, newAgendamento].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()));
  }, [setAgendamentos]);

  const updateAgendamento = useCallback((id: string, data: { date: Date; mealType: MealType }) => {
    setAgendamentos(prev =>
      prev.map(ag =>
        ag.id === id
          ? { ...ag, date: formatISO(data.date, { representation: 'date' }), mealType: data.mealType, status: 'agendado' }
          : ag
      ).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    );
  }, [setAgendamentos]);

  // Changed to depend on `agendamentos` state directly for filtering
  // This makes the `removeAgendamento` function reference change when `agendamentos` changes.
  const removeAgendamento = useCallback((idToRemove: string) => {
    const newAgendamentos = agendamentos.filter(ag => ag.id !== idToRemove);
    setAgendamentos(newAgendamentos);
  }, [agendamentos, setAgendamentos]);


  // getAgendamentosByStudent is not actively used by the page for rendering the list anymore,
  // but kept here if other future components might need it.
  // const getAgendamentosByStudent = useCallback((studentName: string) => {
  //   return agendamentos.filter(item => item.studentName === studentName);
  // }, [agendamentos]);

  const contextValue = useMemo(() => ({
    agendamentos,
    addAgendamento,
    updateAgendamento,
    removeAgendamento,
    // getAgendamentosByStudent,
    isLoading
  }), [agendamentos, isLoading, addAgendamento, updateAgendamento, removeAgendamento /*, getAgendamentosByStudent*/]);

  return (
    <AgendamentoContext.Provider value={contextValue}>
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
