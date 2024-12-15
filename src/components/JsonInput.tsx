import ace from 'ace-builds/src-noconflict/ace';
import React, { useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

import parserBabel from 'prettier/parser-babel'; // Correct parser import
import prettier from 'prettier/standalone';

import './JsonInput.css';

// Configure Ace Editor to load worker scripts from CDN
ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/');
ace.config.setModuleUrl('ace/mode/json_worker', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/worker-json.js');

const JsonInput: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Format JSON using Prettier
  const formatJson = (input: string) => {
    try {
      const formatted = prettier.format(input, {
        parser: 'json',
        plugins: [parserBabel],
      });
      setText(formatted);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Handle changes in the editor
  const handleChange = (value: string) => {
    setText(value);
  };

  // Handle paste event to autoformat
  const handlePaste = (pastedData: any) => {
    let pastedText = '';

    // Check if pastedData is a string
    if (typeof pastedData === 'string') {
      // It's the pasted text
      pastedText = pastedData;
    } else if (pastedData && pastedData.text) {
      // If pastedData has a 'text' property, which is an array of strings
      if (Array.isArray(pastedData.text)) {
        pastedText = pastedData.text.join('\n');
      } else if (typeof pastedData.text === 'string') {
        pastedText = pastedData.text;
      }
    } else {
      // As a fallback, try to get text from clipboardData
      const clipboardData = pastedData.clipboardData || window.clipboardData;
      if (clipboardData) {
        pastedText = clipboardData.getData('Text');
      } else {
        console.error('Unable to extract pasted text');
        return false;
      }
    }

    // Format the pasted JSON
    formatJson(pastedText);

    // Prevent the default paste behavior
    return false;
  };

  // Handle format button click
  const handleFormatClick = () => {
    formatJson(text);
  };

  // Handle focus loss to autoformat
  const handleBlur = () => {
    formatJson(text);
  };

  return (
    <div className="json-input">
      <h2>JSON Input</h2>
      {error && <div className="error">{error}</div>}
      <AceEditor
        mode="json"
        theme="github"
        name="json-editor"
        onChange={handleChange}
        value={text || ''}
        onBlur={handleBlur}
        editorProps={{ $blockScrolling: true }}
        width="100%"
        height="400px"
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
          useWorker: true, // Enable syntax checking worker
        }}
        onLoad={(editor) => {
          // Attach the paste event handler
          editor.on('paste', handlePaste);
        }}
      />
      <button className="format-button" onClick={handleFormatClick}>
        Format JSON
      </button>
    </div>
  );
};

export default JsonInput;
