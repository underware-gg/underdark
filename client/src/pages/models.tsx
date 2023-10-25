import 'semantic-ui-css/semantic.min.css'
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ModelsPage from '../underdark/components/editor/ModelsPage';

async function init() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('React root not found');
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <ModelsPage />
    </React.StrictMode>
  );
}

init();