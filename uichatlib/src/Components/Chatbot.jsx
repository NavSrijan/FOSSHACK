import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';
import axios from 'axios';

function Chatbot() {
  const cohereApiKey = `JFQUx8Fu5wKwYZKG1TulQ6v7VVtbnq2s4hcAZfCE`;
  const geminiApiKey = `AIzaSyDt7_j1TQkzVex9NH9QftIiiMbHcqOADlk`;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCohereSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.cohere.ai/v1/generate',
        {
          model: "command",
          prompt: input,
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cohereApiKey}`,
          },
        }
      );

      const reply = response.data.generations?.[0]?.text || "No response from AI.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error("Cohere API Error:", error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Error fetching AI response." }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleGeminiSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setLoading(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ parts: [{ text: input }] }]
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Error fetching AI response." }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-5 right-5">
      {/* Floating Button to Toggle Chatbot */}
      <button
        className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg hover:bg-blue-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-[40vw] bg-gray-800 shadow-lg rounded-lg">
          <div className="flex justify-between items-center bg-gray-900 text-white p-3 rounded-t-lg">
            <h3 className="text-lg font-bold">Chatbot</h3>
            <button className="text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="h-[60vh] overflow-y-auto p-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <h1 className="text-white font-bold text-lg">Sarang</h1>
                <p className="text-gray-400">How can I help you today?</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))}
                {loading && <Message message={{ role: 'assistant', content: 'Typing...' }} />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="p-3 border-t border-gray-700">
            <ChatInput input={input} setInput={setInput} onSubmit={handleGeminiSubmit} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
