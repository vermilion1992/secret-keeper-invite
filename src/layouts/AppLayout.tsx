import { PropsWithChildren, useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { CommandPalette } from '@/components/command-palette';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AppLayout({ children }: PropsWithChildren) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="h-14 flex items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
              <div className="hidden md:block">
                <div 
                  onClick={() => setCommandPaletteOpen(true)}
                  className="w-[280px] px-3 py-2 bg-muted/50 border border-border/50 rounded-lg cursor-pointer hover:bg-muted/80 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Search commands...</span>
                    <div className="flex items-center gap-1 text-xs bg-background/50 px-2 py-0.5 rounded">
                      <span>⌘</span>
                      <span>K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <img 
                src="/lovable-uploads/96951b65-8a1f-4558-a65b-8626702430d1.png" 
                alt="BotForge Code Symbol" 
                className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
              <Avatar className="h-8 w-8 hover:scale-110 transition-transform duration-200">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-display font-semibold">BF</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 animate-fade-in">
            {children}
          </main>
        </SidebarInset>
        
        <CommandPalette 
          isOpen={commandPaletteOpen} 
          onClose={() => setCommandPaletteOpen(false)} 
        />
      </div>
    </SidebarProvider>
  );
}
