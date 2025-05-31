
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMerenda } from "@/contexts/MerendaContext";
import { Archive, AlertTriangle, PieChart, ScrollText, Utensils } from "lucide-react"; // Changed ListChecks to ScrollText
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { inventory, isLoading } = useMerenda();

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity < item.lowStockThreshold);
  const lowStockCount = lowStockItems.length;

  const chartData = inventory
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5) // Top 5 items by quantity
    .map(item => ({ name: item.name, quantidade: item.quantity, limiteBaixoEstoque: item.lowStockThreshold }));

  const chartConfig = {
    quantidade: {
      label: "Quantidade",
      color: "hsl(var(--chart-1))",
    },
    limiteBaixoEstoque: {
      label: "Limite Baixo Estoque",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;


  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-semibold text-foreground">Painel de Gestão</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens Cadastrados</CardTitle>
            <Archive className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Variedade de alimentos no sistema</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens com Baixo Estoque</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Necessitam de reposição urgente</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cardápios Planejados</CardTitle>
            <Utensils className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">Cardápios gerados este mês</p>
          </CardContent>
        </Card>
        <Link href="/merenda-inteligente/relatorios" className="block h-full">
          <Card className="shadow-lg hover:shadow-xl transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios e Auditoria</CardTitle>
              <ScrollText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 tipos</div> 
              <p className="text-xs text-muted-foreground">Relatórios disponíveis para consulta</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Visão Geral do Estoque (Top 5)</CardTitle>
            <CardDescription>Quantidades dos 5 itens mais abundantes.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="quantidade" fill="var(--color-quantidade)" radius={4} />
                    <Bar dataKey="limiteBaixoEstoque" fill="var(--color-limiteBaixoEstoque)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10">Nenhum item no estoque para exibir gráfico.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Alertas de Reposição Recentes</CardTitle>
            <CardDescription>Itens que atingiram o nível mínimo de estoque.</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockCount > 0 ? (
              <ul className="space-y-3 max-h-[280px] overflow-y-auto">
                {lowStockItems.slice(0,5).map(item => ( // Show top 5 recent low stock items
                  <li key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <p className="text-xs text-destructive">Estoque atual: {item.quantity} {item.unit} (Mínimo: {item.lowStockThreshold})</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-10">Nenhum item com baixo estoque no momento.</p>
            )}
            {lowStockCount > 0 && (
              <div className="mt-4 text-center">
                 <Link href="/merenda-inteligente/alertas" passHref>
                    <Button variant="outline" size="sm">Ver Todos os Alertas</Button>
                 </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-1/3" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/2 mb-1" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3 max-h-[280px]">
            {[...Array(3)].map((_, i) => (
               <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
