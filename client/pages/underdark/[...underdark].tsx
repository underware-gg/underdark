import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useGameplayContext } from '@/underdark/hooks/GameplayContext'
import { makeRoomName } from '@/underdark/utils/underdark'
import AppDojo from '@/underdark/components/AppDojo'
import Manor from '@/underdark/components/Manor'
import Underdark from '@/underdark/components/Underdark'
import Gate from '@/underdark/components/Gate'

export default function UnderdarkPage() {
  const router = useRouter()
  // console.log(`/[...underdark]`, router.query.underdark)

  const { page, title, isPlaying, roomId, levelNumber, backgroundImage } = useMemo(() => {
    let page = null
    let title = null
    let isPlaying = false
    let roomId = null
    let levelNumber = null
    let backgroundImage = null

    // parse page
    if (router.isReady && router.query.underdark) {
      const _page = router.query.underdark[0]
      const _slugs = router.query.underdark.slice(1)
      if (_page == 'gate') {
        page = _page
        title = 'Underdark - The Gate'
        backgroundImage = '/images/gate_bg.png'
      } else if (_page == 'manor') {
        page = _page
        title = 'Underdark - The Manor'
        backgroundImage = '/images/manor_bg.png'
      } else if (_page == 'room') {
        // '/room/[roomId]'
        // '/room/[roomId]/[levelNumber]'
        if (_slugs.length > 0) {
          page = _page
          roomId = parseInt(_slugs[0])
          levelNumber = parseInt(_slugs[1] ?? '1')
          title = 'Underdark ' + makeRoomName(roomId, levelNumber)
          isPlaying = true
        } else {
          page = 'gate'
          router.push('/gate')
        }
      }
    }
    return {
      page,
      title,
      isPlaying,
      roomId,
      levelNumber,
      backgroundImage,
    }
  }, [router.isReady, router.query])

  if (!page) {
    if (router.isReady) {
      // invalid route
      router.push('/')
    }
    // return <></> // causes hydration error
  }

  const _atGate = (page == 'gate')
  const _atManor = (page == 'manor')

  return (
    <AppDojo title={title} backgroundImage={backgroundImage}>
      <Lobby value={_atManor} />
      {_atManor && <Manor />}
      {_atGate && <Gate />}
      <Underdark
        isPlaying={isPlaying}
        roomId={roomId}
        levelNumber={levelNumber}
      />
    </AppDojo>
  );
}

function Lobby({
  value
}) {
  const { dispatchLobby } = useGameplayContext()
  useEffect(() => {
    dispatchLobby(value)
  }, [value])
  return <></>
}
