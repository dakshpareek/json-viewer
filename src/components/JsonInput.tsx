import React, { useCallback, useEffect, useState } from 'react';
import AceEditor from 'react-ace';

import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

import parserBabel from 'prettier/parser-babel';
import prettier from 'prettier/standalone';

import { DataItemProps, JsonViewer } from '@textea/json-viewer';

import { useNotification } from '../contexts/NotificationContext.tsx';
import './JsonInput.css';
import './TopToolbar.css';
import TopToolbar from './TopToolbar.tsx';

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
  const { showNotification } = useNotification();
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [jsonData, setJsonData] = useState<any>(null);
  // Default to editor-focused mode (not split). User can toggle viewer when needed.
  const [showViewer, setShowViewer] = useState<boolean>(false);

  // Format JSON using Prettier
  const formatJson = useCallback((input: string) => {
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
  }, [jsonData, setSelectedKeyPath]);

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
    // The editor emits a ClipboardEvent-like object; be explicit about the runtime shapes to satisfy TypeScript.
    const maybeEvent = pastedData as ClipboardEvent | null;
    const clipboardData = (maybeEvent && maybeEvent.clipboardData) || (window as any).clipboardData;
    if (clipboardData && typeof clipboardData.getData === 'function') {
      const pastedText = clipboardData.getData('Text');
      formatJson(pastedText);
    } else {
      console.error('Unable to extract pasted text');
    }
    // Prevent the default paste behavior
    return false;
  };

  // Handle paste from clipboard button click
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        formatJson(clipboardText);
      } else {
        showNotification('Clipboard is empty or does not contain text.', 'error');
      }
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error);
      showNotification(
        'Failed to read clipboard contents. Please allow clipboard permissions.',
        'error'
      );
    }
  }, [formatJson, showNotification]);

  // Auto-paste from clipboard on mount (run only once). Inline formatting here to avoid
  // depending on `formatJson` so this effect won't re-run when `formatJson` or `jsonData` changes.
  useEffect(() => {
    let cancelled = false;

    const AUTO_PASTE_ON_LOAD = JSON.parse(localStorage.getItem('autoPasteOnLoad') ?? 'true');

    if (!AUTO_PASTE_ON_LOAD) return;

    (async function tryAutoPaste() {
      if (!navigator.clipboard?.readText) return;
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (cancelled) return;
        const trimmed = clipboardText?.trim();
        if (!trimmed) return;
        // Quick heuristic: starts with { or [
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            // Inline formatting & parsing to avoid external deps and repeated effect triggers
            let formatted = trimmed;
            try {
              formatted = prettier.format(trimmed, {
                parser: 'json',
                plugins: [parserBabel],
              });
            } catch {
              // If prettier fails, keep original trimmed text and try JSON.parse on it
              formatted = trimmed;
            }

            const parsedData = JSON.parse(formatted);
            // Only update state if component is still mounted
            if (cancelled) return;

            setText(formatted);
            setError('');
            // update jsonData and reset breadcrumb
            setJsonData(parsedData);
            setSelectedKeyPath([]);
            showNotification('Loaded JSON from clipboard', 'success');
            // keep editor-first default; user can toggle viewer
            setShowViewer(false);
          } catch {
            // If parse fails, do not set anything and silently skip
          }
        }
      } catch (err) {
        // Clipboard access may be denied or unavailable — do nothing silently.
        console.info('Auto-paste skipped:', err && (err as Error).message ? (err as Error).message : err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Note: intentionally omit `showNotification` from the dependency list because the
    // notification context can provide a new function identity across renders which would
    // retrigger this effect. We only want this auto-paste effect to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSelectedKeyPath]);

  // Handle copy formatted JSON button click
  const handleCopyFormattedJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Formatted JSON copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy text: ', error);
      showNotification('Failed to copy formatted JSON. Please try again.', 'error');
    }
  }, [text, showNotification]);

  // Handle format button click
  const handleFormatClick = useCallback(() => {
    formatJson(text);
  }, [text, formatJson]);

  // Handle clear button click
  const handleClearClick = useCallback(() => {
    setText('');
    setError('');
    setJsonData(null);
    // keep editor-first default after clear
    setShowViewer(false);
    setSelectedKeyPath([]);
  }, [setSelectedKeyPath]);

  // Handle viewer toggle button click
  const handleToggleViewer = useCallback(() => {
    setShowViewer(!showViewer);
  }, [showViewer]);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl+V - Paste
      if (cmdOrCtrl && event.key === 'v' && !event.shiftKey) {
        event.preventDefault();
        handlePasteFromClipboard();
        return;
      }

      // Shift+Cmd/Ctrl+F - Format
      if (cmdOrCtrl && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        if (text.trim()) {
          handleFormatClick();
        }
        return;
      }

      // Cmd/Ctrl+B - Toggle Viewer
      if (cmdOrCtrl && event.key === 'b') {
        event.preventDefault();
        if (jsonData) {
          handleToggleViewer();
        }
        return;
      }


      // Cmd/Ctrl+C - Copy (only when not in editor)
      if (cmdOrCtrl && event.key === 'c' && !event.shiftKey) {
        const activeElement = document.activeElement;
        const isInEditor = activeElement && (
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.classList.contains('ace_text-input') ||
          activeElement.closest('.ace_editor')
        );

        if (!isInEditor && text.trim()) {
          event.preventDefault();
          handleCopyFormattedJson();
        }
        return;
      }

      // Esc - Clear
      if (event.key === 'Escape') {
        event.preventDefault();
        if (text.trim()) {
          handleClearClick();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [text, jsonData, showViewer, handlePasteFromClipboard, handleFormatClick, handleToggleViewer, handleCopyFormattedJson, handleClearClick]);

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
    <>
      <TopToolbar
        onPaste={handlePasteFromClipboard}
        onToggleViewer={handleToggleViewer}
        onCopy={handleCopyFormattedJson}
        onClear={handleClearClick}
        hasJsonData={jsonData !== null}
        showViewer={showViewer}
        hasText={text.trim().length > 0}
      />
      <div className={`json-input ${jsonData && showViewer ? 'two-column' : 'single-column'}`}>
        <div className="editor-container">
          {error && <div className="error" aria-live="polite" role="alert">{error}</div>}
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
            aria-label="JSON editor"
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
        </div>

        {jsonData && showViewer && (
          <div className="viewer-container" aria-label="JSON viewer">
            <div className="json-viewer-wrapper">
              <JsonViewer
                value={jsonData}
                rootName={false}
                defaultInspectDepth={0}
                theme={({
                  author: 'json-viewer',
                  base00: '#ffffff', // background
                  base01: '#f8f9fa',
                  base02: '#e9ecef',
                  base03: '#dee2e6',
                  base04: '#ced4da',
                  base05: '#111827', // main text color - darker for better contrast
                  base06: '#495057',
                  base07: '#343a40',
                  base08: '#dc2626', // red
                  base09: '#f59e0b', // orange
                  base0A: '#7c3aed', // purple
                  base0B: '#059669', // green
                  base0C: '#0891b2', // cyan
                  base0D: '#4f46e5', // blue
                  base0E: '#be185d', // magenta
                  base0F: '#92400e', // brown
                } as any)}
                displayDataTypes={false} // Hide data types
                keyRenderer={CustomKeyRenderer}
                onSelect={(path) => {
                  const pathStrings = path.map((p) => String(p));
                  setSelectedKeyPath(pathStrings);
                }}
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff', // Pure white background for maximum contrast
                  border: '1px solid var(--color-muted)',
                  width: '100%',
                  height: 'auto',
                  minHeight: '100%',
                  color: '#0f172a', // Stronger dark text color for readability
                }}
              />
            </div>
          </div>
        )}

        {/* Empty state hint when no text is present - Excalidraw-inspired */}
        {!text && (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-state-icon">📄</div>
              <h3>Ready to explore your data?</h3>
              <p>Paste your JSON below and watch it come alive with interactive visualizations</p>
              <div className="empty-state-tips">
                <span className="tip-item">
                  <kbd>⌘V</kbd> or <kbd>Ctrl+V</kbd> to paste
                </span>
                <span className="tip-item">
                  <kbd>⇧⌘F</kbd> or <kbd>Shift+Ctrl+F</kbd> to format
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default JsonInput;
