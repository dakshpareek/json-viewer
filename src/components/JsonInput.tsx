import React, { useState } from 'react';
import AceEditor from 'react-ace';

import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';

import { DataItemProps, JsonViewer } from '@textea/json-viewer';

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

const JsonInput: React.FC<JsonInputProps> = ({
  selectedKeyPath,
  setSelectedKeyPath,
}) => {
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
      const isDifferent =
        JSON.stringify(jsonData) !== JSON.stringify(parsedData);
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
    const clipboardData = pastedData.clipboardData || window.clipboardData;
    if (clipboardData) {
      const pastedText = clipboardData.getData('Text');
      formatJson(pastedText);
    } else {
      console.error('Unable to extract pasted text');
    }
    // Prevent the default paste behavior
    return false;
  };

  // Handle paste from clipboard button click
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        formatJson(clipboardText);
      } else {
        alert('Clipboard is empty or does not contain text.');
      }
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error);
      alert(
        'Failed to read clipboard contents. Please allow clipboard permissions.'
      );
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
    setShowViewer(true);
    setSelectedKeyPath([]);
  };

  // Handle viewer toggle button click
  const handleToggleViewer = () => {
    setShowViewer(!showViewer);
  };

  // Define custom key renderer
  const CustomKeyRenderer: React.FC<DataItemProps> & {
    when: (props: DataItemProps) => boolean;
  } = (props) => {
    const { path, nestedIndex } = props;

    const key =
      nestedIndex !== undefined
        ? String(nestedIndex)
        : String(path[path.length - 1]);

    const fullPath = path.map((p) => String(p));

    const handleClick = () => {
      setSelectedKeyPath(fullPath);
    };

    return (
      <span
        className="json-key"
        onClick={handleClick}
        style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
      >
        {key}
      </span>
    );
  };

  // Implement the required 'when' method
  CustomKeyRenderer.when = (props: DataItemProps) => {
    // Return true to apply this renderer to all keys
    return true;
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
                <span className="tooltip">
                  {showViewer ? 'Hide Viewer' : 'Show Viewer'}
                </span>
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
          <JsonViewer
            value={jsonData}
            rootName={false}
            defaultInspectDepth={0} // Collapsed by default
            theme="light"
            displayDataTypes={false} // Hide data types
            keyRenderer={CustomKeyRenderer}
            onSelect={(path) => {
              const pathStrings = path.map((p) => String(p));
              setSelectedKeyPath(pathStrings);
            }}
            style={{
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-muted)',
              maxHeight: '75vh',
              overflow: 'auto',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default JsonInput;
