import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, Button, TextField } from '@mui/material'
import { Mail, Phone, GripVertical } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getSwedishWeekNumber } from '../utils/schedule'

interface Family {
  id: string
  name: string
  email: string
  phone: string
  order: number
}

interface Swap {
  id: string
  weekNumber: number
  fromFamilyId: string
  toFamilyId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

interface WeekAssignment {
  id: string
  week: number
  family: Family
}

export default function BinBuddy() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState<WeekAssignment[]>([])

  const [swaps, setSwaps] = useState<Swap[]>([])
  const [message, setMessage] = useState(
    'Reminder: 🗑️ Please pull out the garbage before Tuesday 6:00AM. Thanks! 💜'
  )
  const currentWeek = getSwedishWeekNumber(new Date())

  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await fetch('/api/week-assignment')
      const data = await res.json()
      const swapsRes = await fetch(`/api/swaps?week=${currentWeek}`)
      const swapsData = await swapsRes.json()
      setSwaps(swapsData)
      setAssignments(data)
    }
    fetchAssignments()
  }, [currentWeek])

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !session) return

    const sourceIndex = result.source.index
    const destIndex = result.destination.index
    const nextWeek = currentWeek + 1

    try {
      const response = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromFamilyId: assignments[sourceIndex].family.id,
          toFamilyId: assignments[destIndex].family.id,
          weekNumber: nextWeek,
        }),
      })

      if (response.ok) {
        const newSwap = await response.json()
        setSwaps([...swaps, newSwap])
        alert('Swap request sent! Approval required from both families.')
      }
    } catch (error) {
      console.error('Error proposing swap:', error)
    }
  }

  const handleSwapApproval = async (swapId: string, approved: boolean) => {
    try {
      const response = await fetch('/api/swaps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swapId,
          status: approved ? 'APPROVED' : 'REJECTED',
        }),
      })

      if (response.ok) {
        const updatedSwap = await response.json()
        setSwaps(swaps.map((swap) => (swap.id === swapId ? updatedSwap : swap)))
        if (approved) {
          const swapsRes = await fetch(`/api/swaps?week=${currentWeek}`)
          setSwaps(await swapsRes.json())
        }
      }
    } catch (error) {
      console.error('Error updating swap:', error)
    }
  }

  const sendReminder = async (family: Family) => {
    try {
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family, message }),
      })

      if (!response.ok) throw new Error('Failed to send reminder')
      alert('Reminder sent successfully!')
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Error sending reminder')
    }
  }

  // Apply approved swaps for current week
  // const displayedFamilies = [...families].sort((a, b) => a.order - b.order)
  // .filter((family, index) => index + 1 >= currentWeek)
  // Only show current and future assignments

  const displayedAssignments = assignments
    .filter((a) => a.week >= currentWeek)
    .sort((a, b) => a.week - b.week)

  // swaps
  //   .filter(
  //     (swap) => swap.status === 'APPROVED' && swap.weekNumber === currentWeek
  //   )
  //   .forEach((swap) => {
  //     const fromIndex = displayedFamilies.findIndex(
  //       (f) => f.id === swap.fromFamilyId
  //     )
  //     const toIndex = displayedFamilies.findIndex(
  //       (f) => f.id === swap.toFamilyId
  //     )
  //     if (fromIndex !== -1 && toIndex !== -1) {
  //       [displayedFamilies[fromIndex], displayedFamilies[toIndex]] = [
  //         displayedFamilies[toIndex],
  //         displayedFamilies[fromIndex],
  //       ]
  //     }
  //   })

  return (
    <div style={{ margin: '0 auto' }}>
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '24px',
          position: 'sticky',
          top: '0',
          backgroundColor: '#fff', // Make sure it has a background color to be visible
          zIndex: 1, // Ensure it's above other content
          padding: '8px 0', // Optional padding for better spacing
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Optional shadow for better visibility
        }}>
        🗑️ BinBuddy - Week {currentWeek}
      </h1>

      <Card style={{ marginBottom: '24px', padding: '16px' }}>
        <CardContent style={{ padding: '16px' }}>
          <div style={{ marginBottom: '24px' }}>
            <TextField
              fullWidth
              label="Reminder Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              multiline // Make it a multi-line text area
              sx={{
                '@media (max-width: 600px)': {
                  // Adjust styles for mobile (for example, larger font or padding)
                  fontSize: '16px', // Increase font size if needed
                },
              }}
            />
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="families">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {displayedAssignments.map((assignment, index) => {
                    const { family, week } = assignment
                    const pendingSwap = swaps.find(
                      (swap) =>
                        [swap.fromFamilyId, swap.toFamilyId].includes(
                          family.id
                        ) && swap.status === 'PENDING'
                    )

                    return (
                      <Draggable
                        key={family.id}
                        draggableId={family.id}
                        index={index}
                        isDragDisabled={!session}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: '16px',
                              padding: '16px',
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              backgroundColor:
                                week === currentWeek ? '#f0af4d' : '#f9f9f9',
                            }}>
                            <div
                              style={{ display: 'flex', alignItems: 'center' }}>
                              <div {...provided.dragHandleProps}>
                                <GripVertical style={{ marginRight: '16px' }} />
                              </div>
                              <div style={{ flexGrow: 1 }}>
                                <h2
                                  style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                  }}>
                                  {family.name} V{week}
                                  {pendingSwap && (
                                    <span
                                      style={{
                                        color: '#ffa726',
                                        fontSize: '14px',
                                        marginLeft: '8px',
                                      }}>
                                      (Swap Requested)
                                    </span>
                                  )}
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
                                  />
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
                                  />
                                  {family.phone}
                                </p>
                              </div>
                              <Button
                                onClick={() => sendReminder(family)}
                                style={{ padding: '8px 16px' }}>
                                Send Now
                              </Button>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {session && (
        <Card style={{ padding: '16px', marginBottom: '24px' }}>
          <CardContent>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
              Pending Swap Requests
            </h3>
            {swaps
              .filter(
                (swap) =>
                  swap.status === 'PENDING' &&
                  [swap.fromFamilyId, swap.toFamilyId].includes(
                    session.user.familyId
                  )
              )
              .map((swap) => (
                <div
                  key={swap.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    padding: '12px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                  }}>
                  {/* <div>
                    Swap week {swap.weekNumber}:{' '}
                    {families.find((f) => f.id === swap.fromFamilyId)?.name} ↔{' '}
                    {families.find((f) => f.id === swap.toFamilyId)?.name}
                  </div> */}
                  <div>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleSwapApproval(swap.id, true)}
                      style={{ marginRight: '8px' }}>
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleSwapApproval(swap.id, false)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
