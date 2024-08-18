'use client';

import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaImages } from 'react-icons/fa';
import { FaDownload } from 'react-icons/fa6';
import { MdDelete } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Documents = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    console.log(acceptedFiles);
    setFiles((prev) => {
      const arr = [...prev];
      arr.push(...acceptedFiles);
      return arr;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true, accept: { 'application/pdf': ['.pdf'] } });

  const getCurrentFiles = async () => {
    const response = await axios.get(`${NEXT_PUBLIC_BACKEND_URL}/document`);
    setExistingFiles(response.data);
  };

  const removeFile = async (filename: string) => {
    try {
      await axios.post(`${NEXT_PUBLIC_BACKEND_URL}/document/remove`, { filename });
      setExistingFiles(existingFiles.filter((file) => file !== filename));
      getCurrentFiles()
    } catch (error) {
      // error handling
    }
  };

  const uploadFile = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });

    await axios.post(`${NEXT_PUBLIC_BACKEND_URL}/document/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: () => {
        return formData;
      },
    });

    setExistingFiles((prev) => {
      const arr = [...prev];
      files.forEach((file) => {
        arr.push(file.name);
      });
      return arr;
    });
    getCurrentFiles()
    setFiles([])
  };

  const cancelUploadFile = async (filename: string) => {
    setFiles(files.filter((file) => file.name !== filename));
  };

  useEffect(() => {
    getCurrentFiles();
  }, []);

  return (
    <div className='p-4'>
      <h1 className='text-foreground font-semibold text-2xl mb-2'>Documents</h1>
      <div className='min-h-40'>
        {existingFiles.map((filename, index) => {
          return (
            <div key={`existing-file-${index}`} className='border-2 border-border rounded-lg mb-2 h-10 px-4'>
              <div className='flex justify-between h-full items-center'>
                <p className='text-foreground'>{filename}</p>
                <div className='flex gap-4'>
                  <a href={`${NEXT_PUBLIC_BACKEND_URL}/document/${filename}`} download={true}>
                    <FaDownload className='text-primary w-5 h-5 cursor-pointer' />
                  </a>
                  <MdDelete className='text-destructive w-5 h-5 cursor-pointer' onClick={() => removeFile(filename)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <h2 className='text-foreground font-semibold text-xl mb-4'>Insert new Documents</h2>
      <div
        {...getRootProps()}
        className='h-52 border-2 border-dashed border-gray-300 rounded-md p-4 justify-center items-center text-center cursor-pointer'>
        <div className='h-full flex flex-col justify-center items-center'>
          <input {...getInputProps()} />
          <FaImages className='mb-2 text-primary w-full h-10' />
          {isDragActive ? (
            <p className='text-foreground text-base font-light mt-4 mb-4'>Drop the files here...</p>
          ) : (
            <div>
              <p className='text-foreground text-base font-light'>Drag & Drop</p>
              <div className='flex gap-1.5 justify-center mb-2'>
                <p className='text-foreground text-base font-light'>or</p>
                <p className='text-primary text-base font-medium'>browse</p>
              </div>
            </div>
          )}
          <p className='text-foreground/80 text-sm font-extralight'>Supports PDF only</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className='mt-4'>
          <p className='font-semibold text-foreground'>Files to upload:</p>
          <div>
            {files.map((file, index) => (
              <div key={index} className='flex gap-2 items-center'>
                <p className='text-lg text-foreground'>{file.name}</p>
                <RxCross2 className='text-destructive text-lg cursor-pointer' onClick={() => cancelUploadFile(file.name)} />
              </div>
            ))}
          </div>
          <button onClick={uploadFile} className='bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl mt-4'>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default Documents;
