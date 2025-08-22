import { Metadata } from 'next'
import EditRecipientListPage from './edit-list-page'

export const metadata: Metadata = {
  title: 'Edit Recipient List | Pay USDC',
  description: 'Edit your recipient list for USDC payments',
}

export default function EditListPage({ params }: { params: { id: string } }) {
  return <EditRecipientListPage listId={parseInt(params.id)} />
}