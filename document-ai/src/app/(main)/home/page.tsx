'use client';

import { useState } from 'react';
import { remark } from 'remark';
import html from 'remark-html';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 0, text: 'Hello! How can I assist you today?', isBot: true }]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    const id = messages.length;
    setMessages((prev) => [...prev, { id, text: inputValue, isBot: false }]);
    setInputValue('');

    try {
      const response = await fetch('http://localhost:8080/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue }),
      });

      const reader = response.body?.getReader();
      let output = '';
      if (response.status !== 200 || !reader) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: prev.length, text: 'I do not understand that, please ask again.', isBot: true }]);
        }, 1000);
        return;
      }
      while (true) {
        const { done, value } = await reader.read();
        output += new TextDecoder().decode(value);
        const processedContent = await remark().use(html).process(output);
        const contentHtml = processedContent.toString();
        console.log(contentHtml);

        setMessages((prev) => {
          const arr = [...prev];
          if (arr.length - 1 < id + 1) {
            arr.push({ id: id + 1, text: contentHtml, isBot: true, isHtml: true });
          } else {
            arr[id + 1].text = contentHtml;
          }
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

  return (
    <div className='min-h-screen flex flex-col justify-between p-4'>
      <div className='flex-1 p-4 border rounded-lg overflow-y-auto h-[calc(100vh-90px)] max-h-[calc(100vh-90px)]'>
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`m-2 py-2 px-4 max-w-md ${msg.isBot ? 'bg-border' : 'bg-primary text-white'} rounded-lg`}>
              {!msg.isHtml ? msg.text : <div dangerouslySetInnerHTML={{ __html: msg.text }} />}
            </div>
          </div>
        ))}
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
