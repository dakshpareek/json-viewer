import ace from 'ace-builds/src-noconflict/ace';
import React, { useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

import parserBabel from 'prettier/parser-babel'; // Correct parser import
import prettier from 'prettier/standalone';

import ReactJson from 'react-json-view'; // Import ReactJson for the viewer

import './JsonInput.css';

// Configure Ace Editor to load worker scripts from CDN
ace.config.set(
  'basePath',
  'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/'
);
ace.config.setModuleUrl(
  'ace/mode/json_worker',
  'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/worker-json.js'
);

const JsonInput: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [jsonData, setJsonData] = useState<any>(null); // State for parsed JSON data

  // Format JSON using Prettier
  const formatJson = (input: string) => {
    try {
      const formatted = prettier.format(input, {
        parser: 'json',
        plugins: [parserBabel],
      });
      const parsedData = JSON.parse(formatted); // Parse to ensure valid JSON
      setText(formatted);
      setError('');
      setJsonData(parsedData); // Set the parsed JSON data
    } catch (e) {
      setError((e as Error).message);
      setJsonData(null); // Clear jsonData if there's an error
    }
  };

  // Handle changes in the editor
  const handleChange = (value: string) => {
    setText(value);
    if (!value.trim()) {
      setJsonData(null); // Clear jsonData if the editor is empty
    }
  };

  // Handle paste event to autoformat
  const handlePaste = (pastedData: any) => {
    let pastedText = '';

    // Check if pastedData is a string
    if (typeof pastedData === 'string') {
      pastedText = pastedData;
    } else if (pastedData && pastedData.text) {
      if (Array.isArray(pastedData.text)) {
        pastedText = pastedData.text.join('\n');
      } else if (typeof pastedData.text === 'string') {
        pastedText = pastedData.text;
      }
    } else {
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
    <div className={`json-input ${jsonData ? 'two-column' : ''}`}>
      <div className="editor-container">
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

      {jsonData && (
        <div className="viewer-container">
          <h2>JSON Viewer</h2>
          <ReactJson
            src={jsonData}
            name={null}
            collapsed={true} // Collapse all levels by default
            enableClipboard={false}
            displayDataTypes={false}
            displayObjectSize={false}
            theme="rjv-default"
            style={{
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-muted)',
              maxHeight: '400px',
              overflow: 'auto',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default JsonInput;
