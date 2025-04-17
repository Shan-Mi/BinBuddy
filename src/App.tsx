import { useState } from 'react'
import { Card, CardContent, Button, TextField } from '@mui/material'
import { Mail, Phone } from 'lucide-react'

export default function BinBuddy() {
  const [families, setFamilies] = useState([
    { name: 'Smith', email: 'smith@example.com', phone: '+1234567890' },
    { name: 'Johnson', email: 'johnson@example.com', phone: '+1234567891' },
  ])
  const [message, setMessage] = useState(
    'Reminder: Please take out the garbage today. Thanks!'
  )

  const sendReminder = (family: {
    name: string
    email: string
    phone: string
  }) => {
    console.log(
      `Sending to ${family.name}:\nEmail: ${family.email}\nPhone: ${family.phone}\nMessage: ${message}`
    )
    // Hook to backend service for real email/SMS delivery
  }

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
        🗑️ BinBuddy
      </h1>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '24px' }}>
        BinBuddy helps neighbors stay on top of trash day with quick email and
        SMS reminders—because no one likes a full bin!
      </p>
      <Card style={{ marginBottom: '24px', padding: '16px' }}>
        <CardContent style={{ padding: '16px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
            }}>
            Reminder Message:
          </label>
          <TextField
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            style={{ marginBottom: '16px' }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '16px',
            }}>
            {families.map((family, index) => (
              <Card
                key={index}
                style={{
                  padding: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}>
                  {family.name} Family
                </h2>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                  <Mail
                    style={{
                      width: '16px',
                      height: '16px',
                      marginRight: '8px',
                    }}
                  />{' '}
                  {family.email}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}>
                  <Phone
                    style={{
                      width: '16px',
                      height: '16px',
                      marginRight: '8px',
                    }}
                  />{' '}
                  {family.phone}
                </p>
                <Button
                  onClick={() => sendReminder(family)}
                  style={{ padding: '8px 16px', cursor: 'pointer' }}>
                  Send Reminder
                </Button>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
