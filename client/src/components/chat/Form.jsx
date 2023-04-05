import { formatRelative } from 'date-fns';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../userContext';

const SendIcon = (props) => (
  <svg viewBox='0 0 24 24' {...props}>
    <path d='M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z' />
  </svg>
);

export default function Form() {
  const [message, setMessage] = useState('');
  const [incomingMsg, setIncomingMsg] = useState('');
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setMessages } = useContext(UserContext);

  useEffect(() => {
    if (!loading && incomingMsg !== '') {
      setMessages((prev) => {
        let type = prev[prev.length - 1].type;
        if (type === 'bot') {
          prev[prev.length - 1].msg += incomingMsg;
          return [...prev];
        } else {
          return [
            ...prev,
            {
              msg: incomingMsg,
              type: 'bot',
              time: formatRelative(new Date(), new Date()),
            },
          ];
        }
      });
    }
  }, [incomingMsg]);

  useEffect(() => {
    if (!loading) {
      const newWs = new WebSocket('ws://localhost:5000/call-info');
      newWs.addEventListener('message', (event) => {
        setIncomingMsg(event.data);
      });

      setWs(newWs);
    }
  }, [loading]);

  useEffect(() => {
    if (loading) {
      setLoading(false);
    }
  }, []);

  const messageResponse = async () => {
    ws.send(message);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message) return;

    setMessages((prev) => [
      ...prev,
      {
        msg: message,
        type: 'user',
        time: formatRelative(new Date(), new Date()),
      },
    ]);
    setMessage('');

    await messageResponse();
  };

  return (
    <>
      <form className='relative flex items-center'>
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='bg-[#3A3F47] text-white placeholder:text-[#949494] text-sm rounded-2xl p-4 w-full outline-none'
          placeholder='Escreva aqui...'
        />
        <button
          type='submit'
          onClick={sendMessage}
          className='absolute right-0 mr-2 bg-white hover:opacity-50 active:opacity-100 transition-colors py-2 px-3 rounded-xl'
        >
          <SendIcon className='w-5 h-5 fill-[#3A3F47]' />
        </button>
      </form>
      <button
        onClick={() => {
          axios.get('http://localhost:5000/kill');
        }}
        className='absolute right-0 mr-2 bg-white hover:opacity-50 active:opacity-100 transition-colors py-2 px-3 rounded-xl'
      >
        stop
      </button>
    </>
  );
}
