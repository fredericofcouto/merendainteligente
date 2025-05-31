"use client";

import { useMerenda } from '@/contexts/MerendaContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, PackageSearch } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlertasPage() {
  const { inventory, isLoading } = useMerenda();

  if (isLoading) {
    return <AlertasLoadingSkeleton />;
  }

  const lowStockItems = inventory.filter(item => item.quantity < item.lowStockThreshold);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-semibold text-foreground">Alertas de Reposição</h1>
        <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive rounded-md">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <span className="text-destructive font-medium">{lowStockItems.length} item(s) precisam de atenção</span>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Itens com Baixo Estoque</CardTitle>
          <CardDescription>
            Estes itens atingiram ou estão abaixo do limite mínimo definido e necessitam de reposição urgente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <PackageSearch className="mx-auto h-16 w-16 mb-4 text-green-500" />
              <p className="text-xl font-semibold">Tudo em ordem!</p>
              <p>Nenhum item com baixo estoque no momento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Nome do Item</TableHead>
                    <TableHead className="text-center">Qtd. Atual</TableHead>
                    <TableHead className="text-center">Unidade</TableHead>
                    <TableHead className="text-center">Limite Mínimo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ação Rápida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-destructive/5">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center font-bold text-destructive">{item.quantity}</TableCell>
                      <TableCell className="text-center">{item.unit}</TableCell>
                      <TableCell className="text-center">{item.lowStockThreshold}</TableCell>
                      <TableCell className="text-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                          Repor Urgente
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/merenda-inteligente/estoque?edit=${item.id}`} passHref>
                          <Button variant="outline" size="sm">Ver no Estoque</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AlertasLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-1/2 md:w-1/3" />
        <Skeleton className="h-10 w-48" />
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

