"use client";

import React, { useState, useTransition } from 'react';
import { useMerenda } from '@/contexts/MerendaContext';
import type { InventoryFoodItem, MenuItem, MenuSuggestion } from '@/lib/types';
import { generateMenuFromInventory, GenerateMenuFromInventoryInput } from '@/ai/flows/generate-menu-from-inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, ChefHat, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CardapiosPage() {
  const { inventory, isLoading: inventoryLoading } = useMerenda();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | ''>('');
  const [nutritionalGuidelines, setNutritionalGuidelines] = useState<string>('Foco em alimentos integrais, baixo teor de açúcar e sódio, variedade de grupos alimentares.');
  const [menuSuggestion, setMenuSuggestion] = useState<MenuSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!mealType) {
      toast({ title: "Erro de Validação", description: "Por favor, selecione o tipo de refeição.", variant: "destructive" });
      return;
    }
    if (inventory.length === 0) {
      toast({ title: "Estoque Vazio", description: "Não há itens no estoque para gerar um cardápio.", variant: "destructive" });
      return;
    }

    setError(null);
    setMenuSuggestion(null);

    const currentInventory: InventoryFoodItem[] = inventory.map(item => ({
      name: item.name,
      quantity: item.quantity,
      nutritionalInfo: item.nutritionalInfo,
    }));

    const input: GenerateMenuFromInventoryInput = {
      inventory: currentInventory,
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
      nutritionalGuidelines,
    };

    startTransition(async () => {
      try {
        const result = await generateMenuFromInventory(input);
        if (result && result.menuSuggestions) {
          setMenuSuggestion({ menuItems: result.menuSuggestions, reasoning: result.reasoning });
        } else {
          throw new Error("A IA não retornou sugestões válidas.");
        }
      } catch (e: any) {
        console.error("Erro ao gerar cardápio:", e);
        setError(`Falha ao gerar cardápio: ${e.message || 'Erro desconhecido.'}`);
        toast({ title: "Erro", description: `Falha ao gerar cardápio: ${e.message || 'Erro desconhecido.'}`, variant: "destructive" });
      }
    });
  };
  
  if (inventoryLoading) {
    return <CardapiosLoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-semibold text-foreground">Cardápio Inteligente <ChefHat className="inline-block ml-2 h-8 w-8 text-accent" /></h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Configurar Geração de Cardápio</CardTitle>
          <CardDescription>Forneça os detalhes para que a IA sugira um cardápio balanceado utilizando o estoque atual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="mealType" className="mb-2 block font-medium">Tipo de Refeição</Label>
              <Select value={mealType} onValueChange={(value) => setMealType(value as 'breakfast' | 'lunch' | 'dinner' | '')}>
                <SelectTrigger id="mealType" className="w-full">
                  <SelectValue placeholder="Selecione o tipo de refeição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Café da Manhã</SelectItem>
                  <SelectItem value="lunch">Almoço</SelectItem>
                  <SelectItem value="dinner">Jantar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="nutritionalGuidelines" className="mb-2 block font-medium">Diretrizes Nutricionais</Label>
            <Textarea
              id="nutritionalGuidelines"
              placeholder="Ex: Priorizar proteínas magras, vegetais variados, evitar frituras..."
              value={nutritionalGuidelines}
              onChange={(e) => setNutritionalGuidelines(e.target.value)}
              className="min-h-[100px] resize-none"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isPending || inventory.length === 0} className="w-full md:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Cardápio...
              </>
            ) : (
              "Gerar Cardápio com IA"
            )}
          </Button>
        </CardFooter>
      </Card>

      {isPending && (
        <div className="text-center py-6">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Aguarde, a inteligência artificial está preparando as sugestões...</p>
        </div>
      )}

      {error && (
        <Card className="border-destructive bg-destructive/10 shadow-md">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive font-headline">Erro ao Gerar Cardápio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {menuSuggestion && !isPending && (
        <Card className="shadow-lg bg-green-50 dark:bg-green-900/20 border-primary/30">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <Lightbulb className="mr-2 h-7 w-7 text-yellow-500" />
              Sugestões de Cardápio Geradas!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2">Itens do Cardápio:</h3>
              {menuSuggestion.menuItems.length > 0 ? (
                <ul className="space-y-4">
                  {menuSuggestion.menuItems.map((item, index) => (
                    <li key={index} className="p-4 border border-primary/20 rounded-lg bg-background shadow-sm">
                      <p className="font-semibold text-primary">{item.name}</p>
                      <p className="text-sm"><span className="font-medium">Ingredientes:</span> {item.ingredients.join(', ')}</p>
                      <p className="text-sm"><span className="font-medium">Valor Nutricional:</span> {item.nutritionalValue}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nenhuma sugestão de item de menu foi gerada.</p>
              )}
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2">Justificativa da IA:</h3>
              <p className="text-sm p-4 border border-primary/20 rounded-lg bg-background shadow-sm whitespace-pre-wrap">
                {menuSuggestion.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CardapiosLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-1/2 md:w-1/3" />
      <Card className="shadow-lg">
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
          </div>
          <div>
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-48" />
        </CardFooter>
      </Card>
    </div>
  );
}
