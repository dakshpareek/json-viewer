import React from 'react';
import './TopToolbar.css';

interface TopToolbarProps {
  onPaste: () => void;
  onFormat: () => void;
  onToggleViewer: () => void;
  onCopy: () => void;
  onClear: () => void;
  hasJsonData: boolean;
  showViewer: boolean;
  hasText: boolean;
}

/**
 * TopToolbar (compact floating, icon-only)
 *
 * Notes:
 * - This toolbar is intentionally compact and floating (positioned via inline style here
 *   to avoid requiring immediate CSS edits). It uses icon-only buttons with accessible
 *   `aria-label` and `title` attributes so the name appears on hover.
 * - The visual styling is still primarily driven by `TopToolbar.css`; this component
 *   reduces DOM content (removes text labels) and applies a small fixed/floating layout.
 */
const TopToolbar: React.FC<TopToolbarProps> = ({
  onPaste,
  onFormat,
  onToggleViewer,
  onCopy,
  onClear,
  hasJsonData,
  showViewer,
  hasText,
}) => {
  return (
    <div
      className="top-toolbar floating"
      role="toolbar"
      aria-label="JSON Studio toolbar"
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '6px',
        zIndex: 1000,
        minHeight: 40,
      }}
    >
      {/* Group 1: Import & Actions */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          <button
            className={`toolbar-btn paste-btn ${!hasText ? 'active' : ''}`}
            onClick={onPaste}
            aria-label="Paste JSON from clipboard"
            title={`Paste JSON from clipboard - Cmd/Ctrl+V`}
            tabIndex={0}
          >
            {/* Material-style content_paste icon */}
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7h-2.18A3 3 0 0013 4h-2a3 3 0 00-3 3H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2zM12 7a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Separator */}
      <div className="toolbar-separator" aria-hidden="true"></div>

      {/* Group 2: View Controls */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          <button
            className={`toolbar-btn view-btn ${showViewer ? 'active' : ''}`}
            onClick={onToggleViewer}
            disabled={!hasJsonData}
            aria-label={showViewer ? 'Switch to editor-only view' : 'Switch to split view'}
            title={`${showViewer ? 'Switch to editor-only view' : 'Switch to split view'} - Cmd/Ctrl+B`}
          >
            {showViewer ? (
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" fill="currentColor" />
              </svg>
            ) : (
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Separator */}
      <div className="toolbar-separator" aria-hidden="true"></div>

      {/* Group 3: Copy & Clear */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          <button
            className={`toolbar-btn copy-btn ${hasText ? '' : 'disabled'}`}
            onClick={onCopy}
            disabled={!hasText}
            aria-label="Copy formatted JSON to clipboard"
            title={`${hasText ? 'Copy formatted JSON to clipboard' : 'Add JSON first to copy'} - Cmd/Ctrl+C`}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 1H4a1 1 0 00-1 1v12h2V3h11V1zM20 5H8a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1zm-1 14H9V7h10v12z" fill="currentColor" />
            </svg>
          </button>

          <button
            className={`toolbar-btn clear-btn ${hasText ? '' : 'disabled'}`}
            onClick={onClear}
            disabled={!hasText}
            aria-label="Clear workspace"
            title={`${hasText ? 'Clear workspace and start fresh' : 'Nothing to clear'} - Esc`}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.24 3l4.95 4.95-9.19 9.19-4.95-4.95L16.24 3zM3 21h18v2H3v-2z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopToolbar;
