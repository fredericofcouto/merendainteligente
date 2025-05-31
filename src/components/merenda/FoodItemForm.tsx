"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AppFoodItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const foodItemSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  quantity: z.coerce.number().min(0, { message: "A quantidade não pode ser negativa." }),
  unit: z.string().min(1, { message: "A unidade é obrigatória." }),
  nutritionalInfo: z.string().min(5, { message: "Informações nutricionais são obrigatórias (mínimo 5 caracteres)." }),
  lowStockThreshold: z.coerce.number().min(0, { message: "O limite não pode ser negativo." }),
});

type FoodItemFormValues = z.infer<typeof foodItemSchema>;

interface FoodItemFormProps {
  onSubmit: (data: FoodItemFormValues) => void;
  defaultValues?: Partial<AppFoodItem>;
  isEditing?: boolean;
}

export function FoodItemForm({ onSubmit, defaultValues, isEditing = false }: FoodItemFormProps) {
  const form = useForm<FoodItemFormValues>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      quantity: defaultValues?.quantity || 0,
      unit: defaultValues?.unit || "",
      nutritionalInfo: defaultValues?.nutritionalInfo || "",
      lowStockThreshold: defaultValues?.lowStockThreshold || 0,
    },
  });

  const handleSubmit = (data: FoodItemFormValues) => {
    onSubmit(data);
    if (!isEditing) {
      form.reset(); // Reset form only if not editing
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{isEditing ? "Editar Item" : "Adicionar Novo Item ao Estoque"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Alimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Arroz Integral" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: kg, L, un" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade em Estoque</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite para Baixo Estoque</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="nutritionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações Nutricionais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva as propriedades nutricionais do alimento..."
                      className="resize-none"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto">
              {isEditing ? "Salvar Alterações" : "Adicionar Item"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
