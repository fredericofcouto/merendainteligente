"use client";

import React, { useState } from 'react';
import { useMerenda } from '@/contexts/MerendaContext';
import type { AppFoodItem } from '@/lib/types';
import { FoodItemForm } from '@/components/merenda/FoodItemForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit3, Trash2, PackageSearch, MinusCircle, PlusSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

export default function EstoquePage() {
  const { inventory, addFoodItem, updateFoodItem, deleteFoodItem, isLoading } = useMerenda();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<AppFoodItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const handleAddSubmit = (data: Omit<AppFoodItem, 'id'>) => {
    addFoodItem(data);
    toast({ title: "Sucesso!", description: "Item adicionado ao estoque." });
    setIsFormModalOpen(false);
  };

  const handleEditSubmit = (data: Omit<AppFoodItem, 'id'>) => {
    if (editingItem) {
      updateFoodItem({ ...editingItem, ...data });
      toast({ title: "Sucesso!", description: "Item atualizado." });
      setEditingItem(null);
      setIsFormModalOpen(false);
    }
  };

  const openEditModal = (item: AppFoodItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };
  
  const openAddModal = () => {
    setEditingItem(null); // Ensure editingItem is null for add mode
    setIsFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Basic confirmation dialog
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      deleteFoodItem(id);
      toast({ title: "Excluído!", description: "Item removido do estoque.", variant: "destructive" });
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <EstoqueLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="font-headline text-3xl font-semibold text-foreground">Gerenciamento de Estoque</h1>
        <Button onClick={openAddModal} className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Novo Item
        </Button>
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {editingItem ? "Editar Item" : "Adicionar Novo Item"}
            </DialogTitle>
          </DialogHeader>
          <FoodItemForm 
            onSubmit={editingItem ? handleEditSubmit : handleAddSubmit}
            defaultValues={editingItem || undefined}
            isEditing={!!editingItem}
          />
        </DialogContent>
      </Dialog>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Buscar item no estoque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            aria-label="Buscar item"
          />
        </div>

        {filteredInventory.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <PackageSearch className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg">Nenhum item encontrado.</p>
            <p>Tente ajustar sua busca ou adicione novos itens ao estoque.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Nome</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Info. Nutricional</TableHead>
                  <TableHead className="text-center">Baixo Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className={item.quantity < item.lowStockThreshold ? "bg-destructive/10 hover:bg-destructive/20" : ""}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.nutritionalInfo}>{item.nutritionalInfo}</TableCell>
                    <TableCell className="text-center">{item.lowStockThreshold}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(item)} title="Editar Item">
                        <Edit3 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Excluir Item">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function EstoqueLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Skeleton className="h-9 w-1/2 md:w-1/3" />
        <Skeleton className="h-10 w-full md:w-48" />
      </div>
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
