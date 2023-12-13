import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Grid, Radio } from 'semantic-ui-react'
import { useDojo } from '@/dojo/DojoContext'
import { AccountShort, shortAddress } from '@/underdark/components/ui/Account'
import { ActionButton } from '@/underdark/components/ui/UIButtons'

const Row = Grid.Row
const Col = Grid.Column

export default function Gate() {
  return (
    <>
      <div className='AlignCenter'>
        <h1>Identify yourself!</h1>
      </div>
      <br />
      <Container text>
        <br />
        <AccountsList />
        <br />
      </Container>
      <br />
      {/* <EnterManorButton /> */}
    </>
  )
}

// function EnterManorButton() {
//   const router = useRouter()
//   const { account: { account, masterAccount, isDeploying } } = useDojo()
//   const canEnter = useMemo(() => (account.address != masterAccount.address && !isDeploying), [account, masterAccount, isDeploying])
//   console.log(`ENTER`, account.address, masterAccount.address)
//   return <ActionButton large disabled={!canEnter} onClick={() => router.push('/manor')} label='ENTER KURNKUNOR MANOR' />
// }


function AccountsList() {
  const router = useRouter()
  const {
    account: { create, list, get, select, clear, account, masterAccount, isDeploying }
  } = useDojo()
  console.log(`LIST`, account.address)

  const rows = useMemo(() => {
    let result = []
    const burners = list()
    burners.forEach((burner) => {
      const isSelected = (burner.address == account.address)
      const key = `${burner.address}_${isSelected?1:0}`
      result.push(<AccountItem key={key} burner={burner} isSelected={isSelected} select={select}/>)
    })
    if (result.length == 0) {
      result.push(
        <Row key='empty' textAlign='center' columns={'equal'}>
          <Col>
            no accounts created
          </Col>
        </Row>
      )
    }
    return result
  }, [account?.address, isDeploying])

  const canEnter = useMemo(() => (account.address != masterAccount.address && !isDeploying), [account, masterAccount, isDeploying])

  return (
    <>
    <Grid className='Faded'>
      {rows}
      <Row textAlign='center' columns={'equal'}>
        <Col>
          <ActionButton disabled={isDeploying} onClick={() => create()} label='CREATE ACCOUNT' />
        </Col>
        <Col>
          <ActionButton disabled={isDeploying} onClick={() => clear()} label='CLEAR ALL ACCOUNTS' />
        </Col>
      </Row>
    </Grid>
    <br />
      <ActionButton large disabled={!canEnter} onClick={() => router.push('/manor')} label='ENTER KURNKUNOR MANOR' />
    </>
  )
}


function AccountItem({
  burner,
  isSelected,
  select,
}) {
  return (
    <Row>
      <Col width={1} textAlign='center'>
        <Radio checked={isSelected} onClick={() => select(burner.address)} />
      </Col>
      <Col width={3} textAlign='center'>
        <AccountShort address={burner.address} />
      </Col>
      <Col width={9}>
        NAME
      </Col>
      <Col width={3}>
        <ActionButton disabled={true} onClick={() => {}} label='DELETE' />
      </Col>
    </Row>
  )
}
