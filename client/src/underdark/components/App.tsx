import React from 'react'
import AppHeader from '@/underdark/components/AppHeader'

export default function App({ children }) {
  return (
    <>
      <AppHeader />
      <div className='App'>
        {children}
      </div>
    </>
  );
}

