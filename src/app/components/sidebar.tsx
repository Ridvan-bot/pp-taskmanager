import { CheckSquare, Users, ChartLine, Settings,  FolderOpen } from "lucide-react";


interface SidebarProps {

  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const navItems = [
    { icon: CheckSquare, label: "Tasks", href: "#", active: true },
    { icon: FolderOpen, label: "Projects", href: "#" },
    { icon: Users, label: "Customers", href: "#" },
    { icon: ChartLine, label: "Reports", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <aside className={`
      w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300
      lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      fixed lg:relative z-30 h-full lg:h-auto
    `}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <CheckSquare className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TaskFlow</h1>
            <p className="text-sm text-slate-400">Project Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
              ${item.active 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-300 hover:bg-slate-700'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
        
            </p>
            <p className="text-xs text-slate-400 truncate">
            </p>
          </div>

        </div>
      </div>
    </aside>
  );
}
