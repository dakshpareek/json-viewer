import ace from 'ace-builds/src-noconflict/ace';
import React, { useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';

import ReactJson from 'react-json-view';

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
  const [jsonData, setJsonData] = useState<any>(null);
  const [showViewer, setShowViewer] = useState<boolean>(true);
  const [selectedKeyPath, setSelectedKeyPath] = useState<string[]>([]);
  const [copyMessage, setCopyMessage] = useState<string>('');

  // Format JSON using Prettier
  const formatJson = (input: string) => {
    try {
      const formatted = prettier.format(input, {
        parser: 'json',
        plugins: [parserBabel],
      });
      const parsedData = JSON.parse(formatted);
      setText(formatted);
      setError('');
      setJsonData(parsedData);
      // Do not modify showViewer; keep the user's preference
    } catch (e) {
      setError((e as Error).message);
      setJsonData(null);
    }
  };

  // Handle changes in the editor
  const handleChange = (value: string) => {
    setText(value);
    if (!value.trim()) {
      setJsonData(null);
      setSelectedKeyPath([]);
    }
  };

  // Handle paste event to autoformat
  const handlePaste = (pastedData: any) => {
    let pastedText = '';

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

  // Handle clear button click
  const handleClearClick = () => {
    setText('');
    setError('');
    setJsonData(null);
    setShowViewer(true); // Reset viewer visibility to default
    setSelectedKeyPath([]);
  };

  // Handle viewer toggle button click
  const handleToggleViewer = () => {
    setShowViewer(!showViewer);
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
          onBlur={handleFormatClick}
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="400px"
          setOptions={{
            showLineNumbers: true,
            tabSize: 2,
            useWorker: true,
          }}
          onLoad={(editor) => {
            // Attach the paste event handler
            editor.on('paste', handlePaste);
          }}
        />
        <div className="button-group">
          <button
            className="button format-button"
            onClick={handleFormatClick}
          >
            Format JSON
          </button>
          <button
            className="icon-button clear-button"
            onClick={handleClearClick}
            title="Clear JSON"
          >
            <i className="fas fa-times"></i>
          </button>
          {jsonData && (
            <button
              className="icon-button toggle-button"
              onClick={handleToggleViewer}
              title={showViewer ? 'Hide Viewer' : 'Show Viewer'}
            >
              <i className={`fas fa-eye${showViewer ? '-slash' : ''}`}></i>
            </button>
          )}
        </div>
      </div>

      {jsonData && showViewer && (
        <div className="viewer-container">
          <h2>JSON Viewer</h2>
          {selectedKeyPath.length > 0 && (
            <div className="breadcrumb">
              {selectedKeyPath.map((key, index) => (
                <span key={index}>
                  {key}
                  {index < selectedKeyPath.length - 1 && ' > '}
                </span>
              ))}
            </div>
          )}
          {copyMessage && <div className="copy-message">{copyMessage}</div>}
          <ReactJson
            src={jsonData}
            name={null}
            collapsed={true}
            enableClipboard={false}
            displayDataTypes={false}
            displayObjectSize={false}
            theme="rjv-default"
            style={{
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-muted)',
              maxHeight: '70vh',
              overflow: 'auto',
            }}
            onSelect={(selection) => {
              setSelectedKeyPath(selection.namespace);

              // Check if a value is clicked
              if (typeof selection.value !== 'object') {
                // Copy the value to clipboard
                navigator.clipboard
                  .writeText(String(selection.value))
                  .then(() => {
                    setCopyMessage('Value copied to clipboard!');
                    // Hide the message after 2 seconds
                    setTimeout(() => {
                      setCopyMessage('');
                    }, 2000);
                  })
                  .catch((err) => {
                    console.error('Failed to copy!', err);
                  });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default JsonInput;
