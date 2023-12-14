import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCookies } from 'react-cookie'
import { Grid } from 'semantic-ui-react'
import { useDojo } from '@/dojo/DojoContext'
import { ActionButton } from '@/underdark/components/ui/UIButtons'
import { AccountShort } from '@/underdark/components/ui/Account'


const Row = Grid.Row
const Col = Grid.Column

export const accountNameCookieName = (address) => (`name_${address ?? '?'}`)

export default function AccountCurrent({
}) {
  const router = useRouter()
  const { account: { account, isMasterAccount } } = useDojo()

  const cookieName = useMemo(() => accountNameCookieName(account?.address), [account.address])

  const [cookies, setCookie] = useCookies([cookieName])

  useEffect(() => {
    if (isMasterAccount) {
      // router.push('/gate')
    }
  }, [isMasterAccount])

  return (
    <Grid>
      <Row textAlign='center'>
        <Col width={4}>
          <AccountShort address={account.address} />
        </Col>
        <Col width={8}>
          <h3>{isMasterAccount ? 'MASTER ACCOUNT' : cookies[cookieName]}</h3>
        </Col>
        <Col width={4}>
          <ActionButton label='Switch Account' onClick={() => router.push('/gate')} />
        </Col>
      </Row>
    </Grid>
  );
}

