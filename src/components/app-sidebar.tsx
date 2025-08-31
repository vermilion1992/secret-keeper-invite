import { NavLink, useLocation } from 'react-router-dom';
import { 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon, 
  UsersIcon, 
  CommandLineIcon, 
  Squares2X2Icon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/', icon: Squares2X2Icon },
  { title: 'Strategy Builder', url: '/strategy-builder', icon: SparklesIcon },
  { title: 'Bot Community', url: '/bot-community', icon: UsersIcon },
  { title: 'My Bots', url: '/my-bots', icon: CommandLineIcon },
  { title: 'AI Chat', url: '/ai-chat', icon: ChatBubbleLeftRightIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : '';

  return (
    <Sidebar className={state === 'collapsed' ? 'w-14' : 'w-60'} collapsible="icon">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/ded5f715-d507-4710-ac01-f02504f8268b.png" 
            alt="BotForge Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        {/* Fallback trigger visible in mini state */}
        <SidebarTrigger className="m-1" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
