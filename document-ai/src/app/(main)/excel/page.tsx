'use client';

import Document from '@/components/Document';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ExcelAgent() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 0, text: `Hello! What do you want to know about this file?`, isBot: true }]);
  const [inputValue, setInputValue] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  const handleScroll = () => {
    if (scrollRef?.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight - scrollTop === clientHeight) {
        setAutoScroll(true);
      } else {
        setAutoScroll(false);
      }
    }
  };

  const getCurrentFiles = async () => {
    try {
      const response = await axios.get(`${NEXT_PUBLIC_BACKEND_URL}/document`);
      const csvFiles = response.data.filter((file: string) => file.endsWith('.csv'));
      setExistingFiles(csvFiles);
    } catch (error: any) {
      console.log(`Failed to get files from backend. Error: ${error.message}`);
    }
  };

  const handleDocumentClick = (filename: string) => {
    setSelectedFile(filename);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    const id = messages.length;
    scrollToBottom();
    setMessages((prev) => [...prev, { id, text: inputValue, isBot: false }, { id: id + 1, text: '...', isBot: true }]);
    setInputValue('');
    setAutoScroll(true);
    try {
      if (!selectedFile) {
        setTimeout(() => {
          setMessages((prev) => {
            const arr = [...prev];
            arr[id + 1].text = 'Please select a csv document to query first.';
            return arr;
          });
        }, 1000);
      }
      const response = await axios.post(`${NEXT_PUBLIC_BACKEND_URL}/query-csv`, {
        filename: selectedFile,
        query: inputValue,
      });
      setMessages((prev) => {
        const arr = [...prev];
        arr[id + 1].text = response.data?.result ?? 'I do not understand that, please ask again.';
        arr[id + 1].isHtml = true;
        return arr;
      });
    } catch (error: any) {
      console.log('Error', error.message);
    }
  };

  useEffect(() => {
    if (autoScroll) scrollToBottom();
    scrollRef?.current?.addEventListener('scroll', handleScroll);
    return () => {
      scrollRef?.current?.removeEventListener('scroll', handleScroll);
    };
  }, [messages]);

  useEffect(() => {
    setMessages([{ id: 0, text: `Hello! What do you want to know about this file?`, isBot: true }]);
  }, [selectedFile]);

  useEffect(() => {
    getCurrentFiles();
  }, []);

  return (
    <div
      className='max-h-screen min-h-screen flex flex-col justify-between p-4'
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSendMessage();
        }
      }}>
      <h1 className='text-foreground font-semibold text-2xl mb-2'>Select a CSV document</h1>
      <div className='min-h-40 flex gap-2 flex-wrap'>
        {existingFiles.map((filename, index) => {
          return (
            <Document
              key={`doc-excel-${index}`}
              filename={filename}
              active={selectedFile === filename}
              handleClick={() => handleDocumentClick(filename)}
              canEdit={false}
            />
          );
        })}
      </div>
      <div className='flex items-center gap-2'>
        <h2 className='text-foreground font-medium text-xl mb-4'>Ask AI about</h2>
        <h2 className='text-foreground font-semibold text-xl mb-4'>{!selectedFile ? 'your CSV' : selectedFile}</h2>
      </div>
      <div ref={scrollRef} className='flex-1 p-4 border rounded-lg overflow-y-auto h-[calc(100vh-90px)] max-h-[calc(100vh-90px)]'>
        {messages.map((msg, index) => (
          <div key={`chat-${index}`}>
            {msg.text && (
              <div>
                <div className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`m-2 py-2 px-4 max-w-md ${msg.isBot ? 'bg-border' : 'bg-primary text-white'} rounded-lg`}>
                    {!msg.isHtml ? msg.text : <div dangerouslySetInnerHTML={{ __html: msg.text }} />}
                  </div>
                </div>
                {msg.sources && (
                  <div className='m-2 py-2 px-4 bg-border max-w-md rounded-lg'>
                    <p className='text-foreground'>Reference:</p>
                    <ol>
                      {msg.sources.map((source, index) => (
                        <div key={`source-${source.filename}-${index}`} className='flex gap-2 items-center'>
                          <li className='text-primary font-light text-base'>
                            <a href={`${NEXT_PUBLIC_BACKEND_URL}/document/${source.filename}`} download={true}>
                              {source.reference}
                            </a>
                          </li>
                          <p className='text-foreground font-light text-sm'>Score: {source.confidence.slice(0, 6)}</p>
                        </div>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className='flex justify-between items-center mt-4 gap-1 h-11'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className='flex-1 p-2 border rounded-lg'
          placeholder='Type a message...'
        />
        <button onClick={handleSendMessage} className='p-2 bg-blue-500 text-white rounded-lg hover:bg-primary'>
          Send
        </button>
      </div>
    </div>
  );
}
