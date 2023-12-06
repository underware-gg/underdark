import { getEvents, setComponentsFromEvents, decodeComponent } from "@dojoengine/utils";
import { Account } from 'starknet';
import { SetupNetworkResult } from './setupNetwork';
import { bigintToHex } from '@/underdark/utils/utils';
import { shortString } from "starknet";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { execute, call, provider, contractComponents }: SetupNetworkResult,
  // { Chamber, Map }: ClientComponents,
) {

  const generate_level = async (signer: Account, realmId: number, roomId: number, levelNumber: number, coord: bigint, generator_name: string, generator_value: number): Promise<boolean> => {
    let success = false
    try {
      const args = [realmId, roomId, levelNumber, coord, shortString.encodeShortString(generator_name), generator_value]

      const tx = await execute(signer, 'actions', 'generate_level', args)
      console.log(`generate_level tx:`, tx)

      const receipt = await signer.waitForTransaction(tx.transaction_hash, { retryInterval: 200 })
      console.log(`generate_level receipt:`, success, receipt)
      success = getReceiptStatus(receipt)

      setComponentsFromEvents(contractComponents, getEvents(receipt));
    } catch (e) {
      console.warn(`generate_level(${bigintToHex(coord)}) exception:`, e)
    } finally {
    }
    return success
  }

  const generate_map_data = async (locationId: bigint): Promise<any> => {
    let result = {}
    try {
      const args = [locationId]
      const eventData = await call('actions', 'generate_map_data', args)

      result = decodeComponent(contractComponents['MapData'], eventData.result)

      //@ts-ignore
      console.log(`generate_map_data(${bigintToHex(locationId)}) >>>`, eventData, result, bigintToHex(result?.location_id ?? 0n), bigintToHex(result?.monsters ?? 0n))
    } catch (e) {
      console.warn(`generate_map_data(${bigintToHex(locationId)}) exception:`, e)
    } finally {
    }
    return result
  }

  const finish_level = async (signer: Account, locationId: bigint, proof: bigint, movesCount: number): Promise<boolean> => {
    let success = false
    try {
      const proof_low = proof & BigInt('0xffffffffffffffffffffffffffffffff')
      const proof_high = proof >> 128n
      const args = [locationId, proof_low, proof_high, movesCount]
      // console.log(args)

      const tx = await execute(signer, 'actions', 'finish_level', args)
      console.log(`finish_level tx:`, tx)

      const receipt = await signer.waitForTransaction(tx.transaction_hash, { retryInterval: 200 })
      console.log(`finish_level receipt:`, success, receipt)
      success = getReceiptStatus(receipt)

      setComponentsFromEvents(contractComponents, getEvents(receipt));
    } catch (e) {
      console.warn(`finish_level exception:`, e)
    } finally {
    }
    return success
  }

  return {
    generate_level,
    generate_map_data,
    finish_level,
  }
}

export function getReceiptStatus(receipt: any): boolean {
  if (receipt.execution_status == 'REVERTED') {
    console.error(`Transaction reverted:`, receipt.revert_reason)
    return false
  } else if (receipt.execution_status != 'SUCCEEDED') {
    console.error(`Transaction error [${receipt.execution_status}]:`, receipt)
    return false
  }
  return true
}
