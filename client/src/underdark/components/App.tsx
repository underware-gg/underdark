import React from 'react'
import AppHeader from '@/underdark/components/AppHeader'

export default function App({
  title = null,
  children
}) {
  return (
    <>
      <AppHeader title={title} />
      <div className='App'>
        {children}
      </div>
    </>
  );
}

