import { useEffect } from 'react'

//
// from:
// https://medium.com/@paulohfev/problem-solving-custom-react-hook-for-keydown-events-e68c8b0a371
//
// usage:
// useKeyDown(() => {
//   someCallback()
// }, ['Escape'])
//

export const useKeyDown = (callback, keys) => {
  const onKeyDown = (event) => {
    const wasAnyKeyPressed = keys.some((key) => event.key === key)
    if (wasAnyKeyPressed) {
      event.preventDefault()
      callback()
    }
  }
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])
}