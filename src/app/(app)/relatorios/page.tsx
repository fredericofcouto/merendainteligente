
"use client";

import React, { useState, useTransition } from 'react';
import { useMerenda } from '@/contexts/MerendaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker'; 
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, ScrollText, Download, PackageSearch, TableProperties } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportData {
  title: string;
  period: string;
  generatedAt: string;
  data: Array<Record<string, any>>;
  summary?: string;
}

const reportOptions = [
  { value: "inventario_completo", label: "Relatório de Inventário Completo" },
  { value: "baixo_estoque", label: "Relatório de Itens com Baixo Estoque" },
  { value: "atividade_simulada", label: "Relatório de Atividade de Estoque (Simulado)" },
];

export default function RelatoriosPage() {
  const { inventory, isLoading: inventoryLoading } = useMerenda();
  const { toast } = useToast();
  const [isGenerating, startTransition] = useTransition();
  
  const [reportType, setReportType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reportContent, setReportContent] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!reportType || !startDate || !endDate) {
      toast({ title: "Campos Obrigatórios", description: "Selecione o tipo de relatório e o período.", variant: "destructive" });
      return;
    }
    if (endDate < startDate) {
      toast({ title: "Período Inválido", description: "A data final deve ser posterior à data inicial.", variant: "destructive" });
      return;
    }

    setError(null);
    setReportContent(null);

    startTransition(async () => {
      // Simulate API call / processing time
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      let generatedReport: ReportData = {
        title: reportOptions.find(opt => opt.value === reportType)?.label || `Relatório ${reportType}`,
        period: `De ${format(startDate, "dd/MM/yyyy", { locale: ptBR })} a ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`,
        generatedAt: format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
        data: [],
      };

      try {
        switch (reportType) {
          case "inventario_completo":
            generatedReport.data = inventory.map(item => ({
              "Nome": item.name,
              "Quantidade": item.quantity,
              "Unidade": item.unit,
              "Info Nutricional": item.nutritionalInfo,
              "Limite Baixo Estoque": item.lowStockThreshold,
            }));
            generatedReport.summary = `Total de ${inventory.length} itens no inventário.`;
            break;
          case "baixo_estoque":
            const lowStockItems = inventory.filter(item => item.quantity < item.lowStockThreshold);
            generatedReport.data = lowStockItems.map(item => ({
              "Nome": item.name,
              "Quantidade Atual": item.quantity,
              "Unidade": item.unit,
              "Limite Mínimo": item.lowStockThreshold,
              "Necessidade Reposição": item.lowStockThreshold - item.quantity,
            }));
            generatedReport.summary = `${lowStockItems.length} item(ns) estão com baixo estoque.`;
            break;
          case "atividade_simulada":
            generatedReport.data = [
              { Item: "Arroz Integral", Movimentacao: "Saída", Quantidade: 10, Data: format(startDate, "dd/MM/yyyy", { locale: ptBR }) },
              { Item: "Feijão Carioca", Movimentacao: "Entrada", Quantidade: 20, Data: format(new Date(startDate.getTime() + 86400000 * 2 > endDate.getTime() ? endDate : new Date(startDate.getTime() + 86400000 * 2)), "dd/MM/yyyy", { locale: ptBR }) },
              { Item: "Maçã", Movimentacao: "Saída", Quantidade: 50, Data: format(endDate, "dd/MM/yyyy", { locale: ptBR }) },
            ];
            generatedReport.summary = `Simulação de 3 movimentações de estoque no período. (Dados Fictícios)`;
            break;
          default:
            throw new Error("Tipo de relatório desconhecido.");
        }
        setReportContent(generatedReport);
        toast({ title: "Relatório Gerado", description: "Seu relatório está pronto para visualização." });
      } catch (e: any) {
        console.error("Erro ao gerar relatório:", e);
        setError(`Falha ao gerar relatório: ${e.message || 'Erro desconhecido.'}`);
        toast({ title: "Erro", description: `Falha ao gerar relatório: ${e.message || 'Erro desconhecido.'}`, variant: "destructive" });
      }
    });
  };
  
  if (inventoryLoading) {
    return <RelatoriosLoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-semibold text-foreground flex items-center">
        Relatórios e Auditoria <ScrollText className="inline-block ml-3 h-8 w-8 text-accent" />
      </h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Configurar Relatório</CardTitle>
          <CardDescription>Selecione o tipo de relatório e o período desejado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="reportType" className="mb-2 block font-medium">Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType" className="w-full md:w-1/2">
                <SelectValue placeholder="Selecione um tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                {reportOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="startDate" className="mb-2 block font-medium">Data Inicial</Label>
              <DatePicker date={startDate} setDate={setStartDate} placeholder="Data de início" />
            </div>
            <div>
              <Label htmlFor="endDate" className="mb-2 block font-medium">Data Final</Label>
              <DatePicker date={endDate} setDate={setEndDate} placeholder="Data de fim" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateReport} disabled={isGenerating || !reportType || !startDate || !endDate} className="w-full md:w-auto">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              "Gerar Relatório"
            )}
          </Button>
        </CardFooter>
      </Card>

      {isGenerating && (
        <div className="text-center py-6">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Aguarde, estamos processando seu relatório...</p>
        </div>
      )}

      {error && !isGenerating && (
        <Card className="border-destructive bg-destructive/10 shadow-md">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive font-headline">Erro ao Gerar Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {!reportContent && !isGenerating && !error && (
        <Card className="shadow-md border-dashed border-primary/30">
          <CardContent className="py-10 text-center text-muted-foreground">
            <TableProperties className="mx-auto h-12 w-12 mb-4 text-primary" />
            <p className="text-lg font-medium">Selecione os parâmetros e gere um relatório.</p>
            <p className="text-sm">Os dados do relatório aparecerão aqui após a geração.</p>
          </CardContent>
        </Card>
      )}
      
      {reportContent && !isGenerating && !error && (
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{reportContent.title}</CardTitle>
            <CardDescription>
              Período: {reportContent.period} <span className="mx-2">|</span> Gerado em: {reportContent.generatedAt}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportContent.data && reportContent.data.length > 0 ? (
              <>
                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(reportContent.data[0]).map(key => <TableHead key={key} className="bg-muted/50">{key}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportContent.data.map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value, i) => <TableCell key={i}>{String(value)}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {reportContent.summary && <p className="mt-4 text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">{reportContent.summary}</p>}
              </>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <PackageSearch className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg">Nenhum dado para exibir para este relatório e período.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={() => toast({title: "Funcionalidade Indisponível", description: "O download de PDF será implementado em breve."})}>
              <Download className="mr-2 h-4 w-4" /> Baixar Relatório (PDF)
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

function RelatoriosLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-1/2 md:w-1/3" /> {/* Title */}
      <Card className="shadow-lg"> {/* Config Card */}
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-10 w-full md:w-1/2" />
          </div>
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
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full md:w-48" /> {/* Generate Button */}
        </CardFooter>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
           <Skeleton className="h-40 w-full" />
        </CardContent>
         <CardFooter className="justify-end">
          <Skeleton className="h-10 w-44" />
        </CardFooter>
      </Card>
    </div>
  );
}

    