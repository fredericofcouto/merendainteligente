
"use client";

import type { AgendamentoItem, MealType } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { formatISO, parseISO } from 'date-fns';

interface AgendamentoContextType {
  agendamentos: AgendamentoItem[];
  addAgendamento: (item: Omit<AgendamentoItem, 'id' | 'studentName' | 'status' | 'date'> & { date: Date }) => void;
  removeAgendamento: (id: string) => void;
  getAgendamentosByStudent: (studentName: string) => AgendamentoItem[];
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
        date: item.date 
      })));
    } else {
      setAgendamentos([
      ]);
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
  }, []);

  const removeAgendamento = useCallback((id: string) => {
    setAgendamentos(prev =>
      prev.filter(ag => ag.id !== id)
    );
  }, []);

  const getAgendamentosByStudent = useCallback((studentName: string) => {
    return agendamentos.filter(item => item.studentName === studentName);
  }, [agendamentos]);

  const contextValue = useMemo(() => ({
    agendamentos,
    addAgendamento,
    removeAgendamento,
    getAgendamentosByStudent,
    isLoading
  }), [agendamentos, isLoading, addAgendamento, removeAgendamento, getAgendamentosByStudent]);

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
