import { useState } from 'react';
import UserContext from './userContext';

import Form from './chat/Form';
import Head from './chat/Head';
import Messages from './chat/Messages';

export default function Chat() {
  const [messages, setMessages] = useState([]);

  return (
    <div className='bg-[#2F343C] rounded-3xl p-12'>
      <UserContext.Provider value={{ messages, setMessages }}>
        <Head />
        <div className='w-full h-[1px] my-8 bg-[#4F5361]' />
        <Messages />
        <div className='w-full h-[1px] my-8 bg-[#4F5361]' />
        <Form />
      </UserContext.Provider>
    </div>
  );
}
