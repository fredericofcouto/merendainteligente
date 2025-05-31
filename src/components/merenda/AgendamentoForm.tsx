
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { MealType, AgendamentoItem } from "@/lib/types";
import { MEAL_TYPE_OPTIONS } from "@/lib/types";
import { addDays, startOfDay, parseISO } from "date-fns";
import { useEffect } from "react";

const agendamentoFormSchema = z.object({
  date: z.date({
    required_error: "A data é obrigatória.",
  }).min(startOfDay(new Date()), { message: "A data não pode ser no passado." }),
  mealType: z.string().nonempty({ message: "O tipo de refeição é obrigatório." }) as z.ZodSchema<MealType>,
});

export type AgendamentoFormValues = z.infer<typeof agendamentoFormSchema>;

interface AgendamentoFormProps {
  onSubmit: (data: AgendamentoFormValues) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<Pick<AgendamentoItem, 'mealType'> & { date: string | Date }>; // Date can be string from context or Date object
  isEditing?: boolean;
}

export function AgendamentoForm({ onSubmit, isSubmitting, defaultValues, isEditing = false }: AgendamentoFormProps) {
  const form = useForm<AgendamentoFormValues>({
    resolver: zodResolver(agendamentoFormSchema),
    defaultValues: {
      date: defaultValues?.date ? (typeof defaultValues.date === 'string' ? parseISO(defaultValues.date) : defaultValues.date) : undefined,
      mealType: defaultValues?.mealType || undefined,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        date: defaultValues.date ? (typeof defaultValues.date === 'string' ? parseISO(defaultValues.date) : defaultValues.date) : undefined,
        mealType: defaultValues.mealType || undefined,
      });
    } else {
      form.reset({
        date: undefined,
        mealType: undefined,
      });
    }
  }, [defaultValues, form]);

  const handleSubmit = (data: AgendamentoFormValues) => {
    onSubmit(data);
    if (!isEditing) {
      form.reset({ date: undefined, mealType: undefined });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Merenda</FormLabel>
                <DatePicker 
                  date={field.value} 
                  setDate={field.onChange}
                  placeholder="Selecione a data"
                  disabled={(date) => date < startOfDay(new Date()) || date > addDays(new Date(), 30)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mealType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Refeição</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={defaultValues?.mealType}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEAL_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting 
            ? (isEditing ? "Salvando..." : "Agendando...") 
            : (isEditing ? "Salvar Alterações" : "Agendar Merenda")}
        </Button>
      </form>
    </Form>
  );
}
