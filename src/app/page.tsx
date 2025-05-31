import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
      <div className="mb-8 flex items-center justify-center">
        <UtensilsCrossed className="h-20 w-20 text-primary" />
        <div className="ml-4">
          <h1 className="font-headline text-6xl font-bold text-primary">
            Merenda
          </h1>
          <div className="flex items-baseline">
            <h2 className="font-headline text-5xl font-semibold text-primary/80">
              Inteligente
            </h2>
            <Sparkles className="ml-2 h-8 w-8 text-accent" />
          </div>
        </div>
      </div>
      <p className="mb-10 max-w-2xl text-lg text-foreground/80">
        Revolucionando a gestão da merenda escolar com tecnologia, transparência e nutrição de qualidade para um futuro mais saudável.
      </p>
      <Link href="/merenda-inteligente/dashboard" passHref>
        <Button size="lg" className="font-headline text-lg px-8 py-6">
          Acessar Painel
        </Button>
      </Link>
      <footer className="absolute bottom-8 text-sm text-foreground/60">
        © {new Date().getFullYear()} Merenda Inteligente. Todos os direitos reservados.
      </footer>
    </div>
  );
}
