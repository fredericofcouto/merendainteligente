
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Archive,
  BookOpenText,
  LayoutDashboard,
  AlertTriangle,
  Users,
  Settings,
  Sparkles,
  ScrollText,
  CalendarCheck, // Added for Agendamento
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { MerendaProvider } from '@/contexts/MerendaContext';
import { AgendamentoProvider } from '@/contexts/AgendamentoContext'; // Added
import { AppLogo } from '@/components/layout/AppLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Painel de Gestão', tooltip: 'Painel' },
  { href: '/estoque', icon: Archive, label: 'Estoque', tooltip: 'Estoque' },
  { href: '/cardapios', icon: BookOpenText, label: 'Gerar Cardápio', tooltip: 'Cardápios' },
  { href: '/agendamento-merenda', icon: CalendarCheck, label: 'Agendar Merenda', tooltip: 'Agendamento' }, // Added
  { href: '/alertas', icon: AlertTriangle, label: 'Alertas de Reposição', tooltip: 'Alertas' },
  { href: '/relatorios', icon: ScrollText, label: 'Relatórios e Auditoria', tooltip: 'Relatórios' },
];

function UserProfile() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Usuário" data-ai-hint="profile avatar" />
              <AvatarFallback>MI</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent">
      <Avatar className="h-9 w-9">
        <AvatarImage src="https://placehold.co/100x100.png" alt="Usuário" data-ai-hint="profile avatar"/>
        <AvatarFallback>MI</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-sidebar-foreground">Admin</span>
        <span className="text-xs text-sidebar-foreground/70">admin@merenda.gov</span>
      </div>
    </div>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <MerendaProvider>
      <AgendamentoProvider> {/* Added AgendamentoProvider */}
        <SidebarProvider defaultOpen collapsible="icon">
          <Sidebar variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md">
            <SidebarHeader className="p-3 border-b border-sidebar-border">
               <AppLogo />
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref legacyBehavior>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/merenda-inteligente${item.href}`}
                        tooltip={item.tooltip}
                        className="justify-start"
                      >
                        <a>
                          <item.icon />
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-3 border-t border-sidebar-border">
               <UserProfile />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 shadow-sm">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                {/* Can add breadcrumbs or page title here */}
              </div>
               <Button variant="outline" size="sm">
                Ajuda
              </Button>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AgendamentoProvider> {/* Closed AgendamentoProvider */}
    </MerendaProvider>
  );
}
