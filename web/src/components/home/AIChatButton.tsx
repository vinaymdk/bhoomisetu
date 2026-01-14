import { useNavigate } from 'react-router-dom';
import './AIChatButton.css';

export const AIChatButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/ai-chat');
  };

  return (
    <button className="ai-chat-button" onClick={handleClick} aria-label="Open AI Chat">
      <span className="ai-chat-button-icon">💬</span>
      <span className="ai-chat-button-text">AI Assistant</span>
    </button>
  );
};
