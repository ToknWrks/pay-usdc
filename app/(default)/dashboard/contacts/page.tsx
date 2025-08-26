import { Metadata } from 'next'
import ContactsPage from './contacts-page'

export const metadata: Metadata = {
  title: 'Contacts | Pay USDC',
  description: 'Manage your contacts for USDC payments',
}

export default function ContactsPageWrapper() {
  return <ContactsPage />
}