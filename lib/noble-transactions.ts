import { SigningStargateClient } from '@cosmjs/stargate'
import { Coin } from '@cosmjs/amino'

export interface SendTransactionParams {
  client: SigningStargateClient
  senderAddress: string
  recipientAddress: string
  amount: string
  memo?: string
}

export async function sendUSDC({
  client,
  senderAddress,
  recipientAddress,
  amount,
  memo = ''
}: SendTransactionParams) {
  try {
    // Convert amount to micro USDC (6 decimals)
    const microAmount = Math.floor(parseFloat(amount) * 1_000_000).toString()
    
    const sendAmount: Coin = {
      denom: 'uusdc', // Noble native USDC denom
      amount: microAmount
    }

    console.log('Sending transaction:', {
      from: senderAddress,
      to: recipientAddress,
      amount: sendAmount,
      memo
    })

    // Send the transaction
    const result = await client.sendTokens(
      senderAddress,
      recipientAddress,
      [sendAmount],
      {
        amount: [{ denom: 'uusdc', amount: '1000' }], // Fee: 0.001 USDC
        gas: '200000'
      },
      memo
    )

    console.log('Transaction result:', result)
    return result
  } catch (error) {
    console.error('Error sending USDC:', error)
    throw error
  }
}

export async function sendMultipleUSDC({
  client,
  senderAddress,
  recipients,
  memo = ''
}: {
  client: SigningStargateClient
  senderAddress: string
  recipients: Array<{ address: string; amount: string; name?: string }>
  memo?: string
}) {
  const results = []
  
  for (const recipient of recipients) {
    try {
      const result = await sendUSDC({
        client,
        senderAddress,
        recipientAddress: recipient.address,
        amount: recipient.amount,
        memo: memo || `Payment to ${recipient.name || recipient.address}`
      })
      
      results.push({
        recipient,
        success: true,
        txHash: result.transactionHash,
        result
      })
    } catch (error) {
      console.error(`Failed to send to ${recipient.address}:`, error)
      results.push({
        recipient,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return results
}