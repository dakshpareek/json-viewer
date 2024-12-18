import React, { useState } from 'react';
import './App.css';
import './components/Breadcrumb.css'; // Import the breadcrumb styles
import JsonInput from './components/JsonInput.tsx';

function App() {
  const [selectedKeyPath, setSelectedKeyPath] = useState<string[]>([]);

  return (
    <div className="App">
      <h1>JSON Viewer</h1>
      {/* Centered Breadcrumb */}
      {selectedKeyPath.length > 0 && (
        <nav aria-label="Breadcrumb" className="breadcrumb-container">
          <ol className="breadcrumb" itemScope itemType="http://schema.org/BreadcrumbList">
            {selectedKeyPath.map((key, index) => (
              <li
                key={index}
                itemProp="itemListElement"
                itemScope
                itemType="http://schema.org/ListItem"
              >
                <span itemProp="name">{key}</span>
                <meta itemProp="position" content={index + 1} />
              </li>
            ))}
          </ol>
        </nav>
      )}
      <JsonInput selectedKeyPath={selectedKeyPath} setSelectedKeyPath={setSelectedKeyPath} />
    </div>
  );
}

export default App;
