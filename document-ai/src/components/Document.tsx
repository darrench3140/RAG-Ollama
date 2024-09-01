import { cn } from '@/lib/utils';
import React from 'react';
import { FaDownload } from 'react-icons/fa6';
import { MdDelete } from 'react-icons/md';

type Props = {
  filename: string;
  active?: boolean;
  canEdit?: boolean;
  handleClick?: () => void;
  removeFile?: (filename: string) => Promise<void>;
};

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Document = ({ active, filename, canEdit = true, handleClick = () => {}, removeFile = async () => {} }: Props) => {
  return (
    <div className={cn('border-2 border-border rounded-lg mb-2 h-10 px-4', active && 'bg-primary')}>
      <button className='w-full h-full' onClick={() => handleClick()}>
        <div className='flex justify-between h-full items-center'>
          <p className={cn('text-foreground', active && 'text-white')}>{filename}</p>
          {canEdit && (
            <div className='flex gap-4'>
              <a href={`${NEXT_PUBLIC_BACKEND_URL}/document/${filename}`} download={true}>
                <FaDownload className='text-primary w-5 h-5 cursor-pointer' />
              </a>
              <MdDelete className='text-destructive w-5 h-5 cursor-pointer' onClick={() => removeFile(filename)} />
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

export default Document;
