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
        <div className="top-toolbar" role="toolbar" aria-label="JSON Studio toolbar">
            {/* Group 1: Import & Actions */}
            <div className="toolbar-section">
                <div className="toolbar-group">
                    <button
                        className={`toolbar-btn paste-btn ${!hasText ? 'active' : ''}`}
                        onClick={onPaste}
                        aria-label="Paste JSON from clipboard"
                        title={`Paste JSON from clipboard - Cmd/Ctrl+V`}
                    >
                        <i className="fas fa-paste" aria-hidden="true"></i>
                        <span className="btn-label">Paste</span>
                    </button>

                    <button
                        className={`toolbar-btn format-btn ${hasText ? '' : 'disabled'}`}
                        onClick={onFormat}
                        disabled={!hasText}
                        aria-label="Format and beautify JSON"
                        title={`${hasText ? 'Format and beautify JSON' : 'Add JSON first to format'} - Shift+Cmd/Ctrl+F`}
                    >
                        <i className="fas fa-sparkles" aria-hidden="true"></i>
                        <span className="btn-label">Format</span>
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
                        <i className={`fas ${showViewer ? 'fa-columns' : 'fa-edit'}`} aria-hidden="true"></i>
                        <span className="btn-label">{showViewer ? 'Split' : 'Editor'}</span>
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
                        <i className="fas fa-copy" aria-hidden="true"></i>
                        <span className="btn-label">Copy</span>
                    </button>

                    <button
                        className={`toolbar-btn clear-btn ${hasText ? '' : 'disabled'}`}
                        onClick={onClear}
                        disabled={!hasText}
                        aria-label="Clear workspace"
                        title={`${hasText ? 'Clear workspace and start fresh' : 'Nothing to clear'} - Esc`}
                    >
                        <i className="fas fa-eraser" aria-hidden="true"></i>
                        <span className="btn-label">Clear</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopToolbar;
