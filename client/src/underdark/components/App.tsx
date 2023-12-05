import React from 'react'
import AppHeader from '@/underdark/components/AppHeader'

export default function App({
  title = null,
  children
}) {
  return (
    <div className='App'>
      <AppHeader title={title} />
      {children}
    </div>
  );
}

