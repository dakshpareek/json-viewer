import React, { useState } from 'react';
import './JsonInput.css';

const JsonInput: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [formattedText, setFormattedText] = useState<string>('');
  const [error, setError] = useState<string>('');

  const formatJson = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedText(formatted);
      setError('');
    } catch (e) {
      setFormattedText(text);
      setError((e as Error).message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    formatJson(text);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    setInputText(text);
    formatJson(text);
  };

  return (
    <div className="json-input">
      {error && <div className="error">{error}</div>}
      <textarea
        value={formattedText}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="Paste your JSON here..."
      />
    </div>
  );
};

export default JsonInput;
