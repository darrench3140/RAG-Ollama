import { cn } from '@/lib/utils';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoDocumentAttachOutline, IoHomeOutline } from 'react-icons/io5';

const Sidebar = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const pathName = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const [hasMounted, setHasMounted] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { title: 'Home', icon: <IoHomeOutline className='text-xl min-w-6' />, href: '/home' },
    { title: 'Documents', icon: <IoDocumentAttachOutline className='text-xl min-w-6' />, href: '/document' },
    // Add more menu items as needed
  ];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <nav
      className={`fixed left-0 top-0 h-screen w-16 bg-gray-800 text-white transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <button className='w-16 h-16 flex items-center justify-center text-white' onClick={toggleSidebar}>
        <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h8m-8 6h16' />
        </svg>
      </button>
      <header className='px-2 flex flex-col justify-between h-[calc(100%-100px)] overflow-y-scroll'>
        <div>
          {menuItems.map((item, i) => {
            return (
              <MenuItem key={`menu-${i}`} name={item.title} sidebarOpen={sidebarOpen} selected={item.href === pathName} href={item.href}>
                {item.icon}
              </MenuItem>
            );
          })}
        </div>
        <div>
          <div className='mt-3 hover:bg-primary rounded-lg transition-all duration-500'>
            <button onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')} className='flex rounded-lg items-center gap-4 h-14'>
              {hasMounted && <div>{resolvedTheme === 'light' ? <Sun className='ml-3 min-w-6' /> : <Moon className='ml-3 min-w-6' />}</div>}
              <span className={cn('text-lg font-semibold whitespace-nowrap', sidebarOpen ? 'opacity-100' : 'opacity-0 invisible')}>Mode</span>
            </button>
          </div>
          <div className='mt-3 hover:bg-primary rounded-lg transition-all duration-500'>
            <button onClick={() => {}} className='flex rounded-lg items-center gap-4 h-14'>
              <LogOut className='ml-3 min-w-6' />
              <span className={cn('text-lg font-semibold whitespace-nowrap', sidebarOpen ? 'opacity-100' : 'opacity-0 invisible')}>Logout</span>
            </button>
          </div>
        </div>
      </header>
    </nav>
  );
};

const MenuItem = ({
  name,
  sidebarOpen,
  children,
  selected,
  href,
}: {
  name: string;
  sidebarOpen: boolean;
  children: React.ReactNode;
  selected: boolean;
  href: string;
}) => {
  return (
    <div
      className={cn('mt-3 hover:bg-primary rounded-lg transition-all duration-500', {
        'bg-primary': selected,
      })}>
      <Link href={href} className='flex items-center ml-3 gap-4 h-14'>
        {children}
        <span className={cn('text-lg font-semibold whitespace-nowrap', sidebarOpen ? 'opacity-100' : 'opacity-0 invisible')}>{name}</span>
      </Link>
    </div>
  );
};

export default Sidebar;
