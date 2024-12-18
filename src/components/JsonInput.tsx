import ace from 'ace-builds/src-noconflict/ace';
import React, { useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';

import ReactJson from 'react-json-view';

import './JsonInput.css';

interface JsonInputProps {
  selectedKeyPath: string[];
  setSelectedKeyPath: React.Dispatch<React.SetStateAction<string[]>>;
}

// Configure Ace Editor to load worker scripts from CDN
ace.config.set(
  'basePath',
  'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/'
);
ace.config.setModuleUrl(
  'ace/mode/json_worker',
  'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/worker-json.js'
);

const JsonInput: React.FC<JsonInputProps> = ({ selectedKeyPath, setSelectedKeyPath }) => {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [jsonData, setJsonData] = useState<any>(null);
  const [showViewer, setShowViewer] = useState<boolean>(true);

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

      // Check if the JSON data has changed
      const isDifferent = JSON.stringify(jsonData) !== JSON.stringify(parsedData);
      if (isDifferent) {
        setJsonData(parsedData);
        setSelectedKeyPath([]); // Reset breadcrumb when JSON changes
      }
    } catch (e) {
      setError((e as Error).message);
      setJsonData(null);
      setSelectedKeyPath([]); // Reset breadcrumb on error
    }
  };

  // Handle changes in the editor
  const handleChange = (value: string) => {
    setText(value);
    if (!value.trim()) {
      setJsonData(null);
      setError('');
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

  // Handle paste from clipboard button click
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        formatJson(clipboardText); // Format and set the JSON
      } else {
        alert('Clipboard is empty or does not contain text.');
      }
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error);
      alert('Failed to read clipboard contents. Please allow clipboard permissions.');
    }
  };

  // Handle copy formatted JSON button click
  const handleCopyFormattedJson = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Formatted JSON copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text: ', error);
      alert('Failed to copy formatted JSON. Please try again.');
    }
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
            className="icon-button paste-button"
            onClick={handlePasteFromClipboard}
            aria-label="Paste JSON from Clipboard"
          >
            <i className="fas fa-paste"></i>
            <span className="tooltip">Paste JSON from Clipboard</span>
          </button>
          <button
            className="icon-button clear-button"
            onClick={handleClearClick}
            aria-label="Clear JSON"
          >
            <i className="fas fa-trash-alt"></i>
            <span className="tooltip">Clear JSON</span>
          </button>
          {jsonData && (
            <>
              <button
                className="icon-button toggle-button"
                onClick={handleToggleViewer}
                aria-label={showViewer ? 'Hide Viewer' : 'Show Viewer'}
              >
                <i className={`fas fa-eye${showViewer ? '-slash' : ''}`}></i>
                <span className="tooltip">{showViewer ? 'Hide Viewer' : 'Show Viewer'}</span>
              </button>
              <button
                className="icon-button copy-button"
                onClick={handleCopyFormattedJson}
                aria-label="Copy Formatted JSON"
              >
                <i className="fas fa-copy"></i>
                <span className="tooltip">Copy Formatted JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {jsonData && showViewer && (
        <div className="viewer-container">
          <h2>JSON Viewer</h2>
          <ReactJson
            src={jsonData}
            name={null}
            collapsed={true} // Collapsed by default
            enableClipboard={false}
            displayDataTypes={false}
            displayObjectSize={false}
            theme="rjv-default"
            style={{
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-muted)',
              maxHeight: '75vh',
              overflow: 'auto',
            }}
            onSelect={(selection) => {
              if (selection.name !== null) {
                // Update selectedKeyPath when a value is clicked
                setSelectedKeyPath([...selection.namespace, String(selection.name)]);
              } else if (selection.namespace.length > 0) {
                // If root object is selected
                setSelectedKeyPath(selection.namespace);
              }
            }}
            onLabelClick={(label, data, event) => {
              event.stopPropagation();
              // Update selectedKeyPath when a key (label) is clicked
              const path = data.namespace ? [...data.namespace, String(label)] : [String(label)];
              setSelectedKeyPath(path);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default JsonInput;
