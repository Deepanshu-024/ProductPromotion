import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

//   // Do something with payload
//   // For this guide, log payload to console
//   const { id } = evt.data
//   const eventType = evt.type
//   console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
//   console.log('Webhook payload:', body)
if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, created_at } = evt.data

    // Convert timestamp to ISO date string if it's a number (milliseconds)
    const formattedDate = typeof created_at === 'number' 
      ? new Date(created_at).toISOString()
      : created_at;

    const { data, error } = await supabase
      .from('Profiles')
      .insert({ 
        id: id,
        full_name: `${first_name} ${last_name}`, 
        email: email_addresses[0].email_address, 
        created_at: formattedDate,
      });   
      if (error) {
        console.error('Error creating user:', error)
      } else {
        console.log('User created:', data)
      }
}

  return new Response('Webhook received', { status: 200 })
}