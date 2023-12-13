import { useMemo } from 'react'

const shortAddress = (address) => (!address ? '?' : `${address.slice(0, 6)}...${address.slice(-4)}`)

function AccountShort({
  address
}) {
  const display = useMemo(() => shortAddress(address), [address])
  return (
    <div className='Code'>
      {display}
    </div>
  )
}

export {
  shortAddress,
  AccountShort,
}
