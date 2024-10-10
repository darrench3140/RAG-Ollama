import { cn } from '@/lib/utils';
import React from 'react';

type Props = {
  loading: boolean;
  transparent?: boolean;
};

const Loader = ({ loading, transparent = false }: Props) => {
  if (!loading) return null;
  return (
    <div
      className={cn(
        'absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50',
        transparent && 'bg-transparent'
      )}>
      <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900'></div>
    </div>
  );
};

export default Loader;
