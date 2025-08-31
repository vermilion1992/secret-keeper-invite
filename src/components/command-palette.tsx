import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Hash, 
  ArrowRight, 
  LayoutDashboard, 
  Sparkles,
  Users,
  Terminal,
  MessageCircle,
  Command
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'View trading overview',
      icon: LayoutDashboard,
      action: () => { navigate('/'); onClose(); },
      keywords: ['dashboard', 'home', 'overview', 'main']
    },
    {
      id: 'strategy-builder',
      title: 'Strategy Builder',
      subtitle: 'Create trading strategies',
      icon: Sparkles,
      action: () => { navigate('/strategy-builder'); onClose(); },
      keywords: ['strategy', 'builder', 'create', 'build', 'trading']
    },
    {
      id: 'bot-community',
      title: 'Bot Community',
      subtitle: 'Browse trading bots',
      icon: Users,
      action: () => { navigate('/bot-community'); onClose(); },
      keywords: ['community', 'bots', 'browse', 'discover', 'public']
    },
    {
      id: 'my-bots',
      title: 'My Bots',
      subtitle: 'Manage your bots',
      icon: Terminal,
      action: () => { navigate('/my-bots'); onClose(); },
      keywords: ['my', 'bots', 'manage', 'personal', 'own']
    },
    {
      id: 'ai-chat',
      title: 'AI Chat',
      subtitle: 'Chat with AI assistant',
      icon: MessageCircle,
      action: () => { navigate('/ai-chat'); onClose(); },
      keywords: ['ai', 'chat', 'assistant', 'help', 'support']
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 border-0 bg-background/95 backdrop-blur-xl shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="overflow-hidden rounded-xl border border-border/50"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 bg-transparent text-sm font-medium"
              autoFocus
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence mode="wait">
              {filteredCommands.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-2"
                >
                  {filteredCommands.map((command, index) => {
                    const Icon = command.icon;
                    return (
                      <motion.div
                        key={command.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={command.action}
                        className={`
                          flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200
                          ${selectedIndex === index 
                            ? 'bg-primary/10 border border-primary/20 shadow-lg scale-[1.02]' 
                            : 'hover:bg-muted/50'
                          }
                        `}
                      >
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                          ${selectedIndex === index 
                            ? 'bg-primary text-primary-foreground shadow-lg' 
                            : 'bg-muted'
                          }
                        `}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {command.title}
                          </div>
                          {command.subtitle && (
                            <div className="text-xs text-muted-foreground truncate">
                              {command.subtitle}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center text-muted-foreground"
                >
                  <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No commands found</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}