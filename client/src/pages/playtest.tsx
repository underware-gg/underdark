import 'semantic-ui-css/semantic.min.css'
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import PlaytestPage from '../underdark/components/PlaytestPage';
import { UnderdarkProvider } from '../underdark/hooks/UnderdarkContext'
import { GameplayProvider } from '../underdark/hooks/GameplayContext'

async function init() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('React root not found');
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <UnderdarkProvider>
        <GameplayProvider>
      <PlaytestPage />
        </GameplayProvider>
      </UnderdarkProvider>
    </React.StrictMode>
  );
}

init();