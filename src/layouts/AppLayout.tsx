import { PropsWithChildren } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="h-14 flex items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="hidden md:block">
                <Input placeholder="Search..." className="w-[280px]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="relative h-20 w-20 overflow-hidden">
                <img 
                  src="/lovable-uploads/ded5f715-d507-4710-ac01-f02504f8268b.png" 
                  alt="BotForge Code Symbol" 
                  className="h-20 w-auto object-contain opacity-80 absolute -left-8"
                  style={{
                    clipPath: 'inset(0 60% 0 0)'
                  }}
                />
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>BF</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 animate-fade-in">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
