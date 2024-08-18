'use client';

import { useEffect, useRef, useState } from 'react';
import { remark } from 'remark';
import html from 'remark-html';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ChatbotScreen() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 0, text: 'Hello! How can I assist you today?', isBot: true }]);
  const [inputValue, setInputValue] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    const id = messages.length;
    setMessages((prev) => [...prev, { id, text: inputValue, isBot: false }, { id: id + 1, text: '...', isBot: true }]);
    setInputValue('');

    try {
      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue }),
      });

      const reader = response.body?.getReader();
      let output = '';
      if (response.status !== 200 || !reader) {
        setTimeout(() => {
          setMessages((prev) => {
            const arr = [...prev];
            arr[id + 1].text = 'I do not understand that, please ask again.';
            return arr;
          });
        }, 1000);
        return;
      }
      while (true) {
        const { done, value } = await reader.read();
        const textChunk = new TextDecoder().decode(value);
        let source: Sources | undefined = undefined;
        console.log('hi', textChunk);

        if (textChunk.startsWith('\n\nSources: [')) {
          const sources = JSON.parse(textChunk.trim().slice(9).replaceAll("'", '"')) as SourcesOriginal;
          if (sources.length !== 0) {
            source = sources.map((item) => {
              const key = Object.keys(item)[0];
              const [filename, page, _] = key.split('/')[1].split(':');
              return {
                filename,
                reference: `${filename} (p.${parseInt(page, 10) + 1})`,
                confidence: item[key].toString(),
              };
            });
            source = Array.from(source.reduce((map, obj) => map.set(obj.reference, obj), new Map()).values());
          }
        } else {
          output += textChunk;
        }
        const processedContent = await remark().use(html).process(output);
        const contentHtml = processedContent.toString();

        setMessages((prev) => {
          const arr = [...prev];
          arr[id + 1].text = contentHtml;
          arr[id + 1].isHtml = true;
          arr[id + 1].sources = source ?? arr[id + 1].sources;
          return arr;
        });
        if (done) {
          return;
        }
      }
    } catch (error: any) {
      console.log('Error', error.message);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className='min-h-screen flex flex-col justify-between p-4'
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSendMessage();
        }
      }}>
      <div className='flex-1 p-4 border rounded-lg overflow-y-auto h-[calc(100vh-90px)] max-h-[calc(100vh-90px)]'>
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
