
"use client";

import React, { useState, useTransition, useMemo, useEffect } from 'react';
import { useAgendamento } from '@/contexts/AgendamentoContext';
import type { AgendamentoItem, MealType } from '@/lib/types';
import { MEAL_TYPE_LABELS } from '@/lib/types';
import { AgendamentoForm, type AgendamentoFormValues } from '@/components/merenda/AgendamentoForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarCheck, ListChecks, Info, Trash2, Pencil } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SIMULATED_STUDENT_NAME = "Aluno Exemplo";

export default function AgendamentoMerendaPage() {
  const { agendamentos, addAgendamento, updateAgendamento, removeAgendamento, isLoading } = useAgendamento();
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();
  const [editingAgendamento, setEditingAgendamento] = useState<AgendamentoItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const studentAgendamentos = useMemo(() => {
    return agendamentos
      .filter(ag => ag.studentName === SIMULATED_STUDENT_NAME)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [agendamentos]);

  const handleAgendamentoSubmit = (data: AgendamentoFormValues) => {
    startTransition(() => {
      try {
        const existing = studentAgendamentos.find(
          (ag) => format(parseISO(ag.date), 'yyyy-MM-dd') === format(data.date, 'yyyy-MM-dd') && ag.mealType === data.mealType && ag.status === 'agendado'
        );
        if (existing) {
          toast({
            title: "Agendamento Duplicado",
            description: `Você já possui um agendamento para ${MEAL_TYPE_LABELS[data.mealType]} no dia ${format(data.date, "dd/MM/yyyy")}.`,
            variant: "destructive",
          });
          return;
        }

        addAgendamento(data);
        toast({
          title: "Sucesso!",
          description: `Merenda (${MEAL_TYPE_LABELS[data.mealType]}) agendada para ${format(data.date, "dd/MM/yyyy", { locale: ptBR })}.`,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível realizar o agendamento.",
          variant: "destructive",
        });
        console.error("Erro ao agendar:", error);
      }
    });
  };

  const handleOpenEditModal = (agendamento: AgendamentoItem) => {
    setEditingAgendamento(agendamento);
    setIsEditModalOpen(true);
  };

  const handleAgendamentoUpdate = (data: AgendamentoFormValues) => {
    if (!editingAgendamento) return;
    startTransition(() => {
      try {
        const conflictingSchedule = studentAgendamentos.find(
          (ag) =>
            ag.id !== editingAgendamento.id &&
            format(parseISO(ag.date), 'yyyy-MM-dd') === format(data.date, 'yyyy-MM-dd') &&
            ag.mealType === data.mealType &&
            ag.status === 'agendado'
        );

        if (conflictingSchedule) {
          toast({
            title: "Conflito de Agendamento",
            description: `Já existe outro agendamento para ${MEAL_TYPE_LABELS[data.mealType]} no dia ${format(data.date, "dd/MM/yyyy")}.`,
            variant: "destructive",
          });
          return;
        }
        
        updateAgendamento(editingAgendamento.id, data);
        toast({
          title: "Sucesso!",
          description: `Agendamento atualizado para ${MEAL_TYPE_LABELS[data.mealType]} em ${format(data.date, "dd/MM/yyyy", { locale: ptBR })}.`,
        });
        setIsEditModalOpen(false);
        setEditingAgendamento(null);
      } catch (error) {
        toast({
          title: "Erro ao Atualizar",
          description: "Não foi possível atualizar o agendamento.",
          variant: "destructive",
        });
        console.error("Erro ao atualizar agendamento:", error);
      }
    });
  };

  const handleRemoveAgendamento = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este agendamento?")) {
      removeAgendamento(id);
      toast({
        title: "Agendamento Removido",
        description: "Seu agendamento foi removido da lista.",
      });
    }
  };
  
  if (isLoading) {
    return <AgendamentoLoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-semibold text-foreground flex items-center">
        <CalendarCheck className="mr-3 h-8 w-8 text-accent" /> Agendar Minha Merenda
      </h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Novo Agendamento</CardTitle>
          <CardDescription>Selecione a data e o tipo de refeição para agendar sua merenda.</CardDescription>
        </CardHeader>
        <CardContent>
          <AgendamentoForm onSubmit={handleAgendamentoSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
        setIsEditModalOpen(isOpen);
        if (!isOpen) setEditingAgendamento(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Editar Agendamento</DialogTitle>
          </DialogHeader>
          {editingAgendamento && (
            <AgendamentoForm
              onSubmit={handleAgendamentoUpdate}
              isSubmitting={isSubmitting}
              isEditing={true}
              defaultValues={{
                date: editingAgendamento.date, 
                mealType: editingAgendamento.mealType,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <ListChecks className="mr-2 h-6 w-6 text-primary" /> Meus Agendamentos
          </CardTitle>
          <CardDescription>Visualize, edite e gerencie seus agendamentos de merenda.</CardDescription>
        </CardHeader>
        <CardContent>
          {studentAgendamentos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Info className="mx-auto h-12 w-12 mb-4 text-primary" />
              <p className="text-lg">Você ainda não possui agendamentos.</p>
              <p>Utilize o formulário acima para agendar sua merenda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Refeição</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAgendamentos.map((ag) => (
                    <TableRow key={ag.id} className={ag.status === 'cancelado' ? 'opacity-60' : ''}>
                      <TableCell>{format(parseISO(ag.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>{MEAL_TYPE_LABELS[ag.mealType]}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${ag.status === 'agendado' ? 'bg-green-100 text-green-700 border border-green-300' : 
                            ag.status === 'cancelado' ? 'bg-red-100 text-red-700 border border-red-300' :
                            'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>
                          {ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {ag.status === 'agendado' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenEditModal(ag)}
                              disabled={isSubmitting}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-600/10"
                              title="Editar Agendamento"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveAgendamento(ag.id)}
                              disabled={isSubmitting} 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Remover Agendamento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {studentAgendamentos.length > 0 && (
          <CardFooter>
            <p className="text-xs text-muted-foreground">
                Agendamentos são uma forma de garantir sua merenda e ajudar a escola a evitar desperdícios.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

function AgendamentoLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-3/4 md:w-1/2" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-full md:w-40" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-1" />
           <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-8 w-20" /> {/* Actions */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
