import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    isActive
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium rounded-md transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_24px_hsl(var(--primary)/0.35)] hover:ring-1 hover:ring-[hsl(var(--primary)/0.25)]'
      : 'rounded-md transition-all duration-300 hover:scale-[1.02] hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground hover:shadow-[0_0_24px_hsl(var(--primary)/0.35)] hover:ring-1 hover:ring-[hsl(var(--primary)/0.25)]';

  return (
    <Sidebar className={state === 'collapsed' ? 'w-14' : 'w-60'} collapsible="icon">
      <div className="flex items-center justify-center px-3 py-6 min-h-[96px]">
        <AnimatePresence mode="wait">
          {state !== 'collapsed' && (
            <motion.div
              key="logo"
              initial={{ 
                opacity: 0, 
                scale: 0.5, 
                rotateY: -45,
                rotateX: 15,
                y: 20,
                filter: "blur(8px)"
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotateY: 0,
                rotateX: 0,
                y: 0,
                filter: "blur(0px)"
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.7, 
                rotateY: 45,
                rotateX: -10,
                y: -15,
                filter: "blur(4px)"
              }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300,
                mass: 0.8,
                opacity: { duration: 0.3 },
                filter: { duration: 0.4 }
              }}
              className="flex items-center gap-2 perspective-1000"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.1,
                  type: "spring",
                  damping: 15,
                  stiffness: 400
                }}
                className="relative"
              >
                <motion.img 
                  src="/lovable-uploads/ded5f715-d507-4710-ac01-f02504f8268b.png" 
                  alt="BotForge Logo" 
                  className="h-24 w-auto drop-shadow-2xl"
                  initial={{ filter: "brightness(0.7)" }}
                  animate={{ filter: "brightness(1)" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
