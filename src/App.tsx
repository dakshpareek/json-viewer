import React, { useState } from 'react';
import './App.css';
// import './components/Breadcrumb.css'; // Commented out - breadcrumb removed for minimal design
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import JsonInput from './components/JsonInput.tsx';

function App() {
  const [selectedKeyPath, setSelectedKeyPath] = useState<string[]>([]);

  return (
    <NotificationProvider>
      <div className="App">
        <div className="workspace">
          <JsonInput selectedKeyPath={selectedKeyPath} setSelectedKeyPath={setSelectedKeyPath} />
        </div>

        {/* Commented out legacy UI elements for reference */}
        {/* <h1>JSON Viewer</h1> */}
        {/* {selectedKeyPath.length > 0 && (
          <nav aria-label="Breadcrumb" className="breadcrumb-container">
            <ol className="breadcrumb" itemScope itemType="http://schema.org/BreadcrumbList">
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
      )} */}
      </div>
    </NotificationProvider>
  );
}

export default App;
