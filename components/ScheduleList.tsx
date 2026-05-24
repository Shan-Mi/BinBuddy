import { useEffect, useRef } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { Bell, GripVertical } from 'lucide-react'
import { useSession } from 'next-auth/react'
import type { ScheduleAssignment, SwapRequest } from '../types/binbuddy'
import DateBadge from './DateBadge'

interface Props {
  assignments: ScheduleAssignment[]
  swaps: SwapRequest[]
  loading: boolean
  currentYear: number
  onProposeSwap: (src: ScheduleAssignment, dst: ScheduleAssignment) => void
  onError: (msg: string) => void
  onSendReminder: (assignment: ScheduleAssignment) => void
}

export default function ScheduleList({
  assignments,
  swaps,
  loading,
  currentYear,
  onProposeSwap,
  onError,
  onSendReminder,
}: Props) {
  const { data: session } = useSession()
  const currentRowRef = useRef<HTMLDivElement | null>(null)

  const draggableAssignments = assignments.filter((a) => !a.isPast && !a.isCurrent)

  useEffect(() => {
    if (!loading && currentRowRef.current) {
      currentRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [loading])

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !session?.user?.familyId) return
    const src = draggableAssignments[result.source.index]
    const dst = draggableAssignments[result.destination.index]
    if (!src || !dst || src.id === dst.id) return

    if (session.user.familyId !== src.family.id) {
      onError('Du kan bara dra din egen vecka för att föreslå ett byte')
      return
    }

    onProposeSwap(src, dst)
  }

  const renderStaticRow = (a: ScheduleAssignment) => {
    const isMyWeek = session?.user?.familyId === a.family.id
    const pendingSwap = swaps.find(
      (s) =>
        s.status === 'PENDING' &&
        s.weekNumber === a.weekNumber &&
        [s.fromFamilyId, s.toFamilyId].includes(a.family.id),
    )
    const approvedSwap = swaps.find(
      (s) => s.status === 'APPROVED' && s.weekNumber === a.weekNumber,
    )
    const canRemind =
      a.isCurrent &&
      (session?.user?.isAdmin || session?.user?.familyId === a.family.id)

    return (
      <Box
        key={a.id}
        ref={a.isCurrent ? currentRowRef : undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: a.isCurrent ? 'primary.light' : 'transparent',
          opacity: a.isPast ? 0.4 : 1,
          '&:last-child': { borderBottom: 'none' },
        }}
      >
        <Box sx={{ width: 16, flexShrink: 0 }} />
        <DateBadge week={a.weekNumber} year={a.year} dimmed={a.isPast} highlight={a.isCurrent} />

        <Typography
          variant="body2"
          fontWeight={a.isCurrent || isMyWeek ? 700 : 400}
          color={a.isPast ? 'text.disabled' : 'text.primary'}
          sx={{ flexGrow: 1 }}
        >
          {a.family.name}
        </Typography>

        {a.isCurrent && <Chip label="Nu" size="small" color="primary" sx={{ fontWeight: 700 }} />}
        {isMyWeek && !a.isPast && !a.isCurrent && (
          <Chip label="Min" size="small" color="primary" variant="outlined" />
        )}
        {pendingSwap && (
          <Chip label="Väntar" size="small" color="warning" variant="outlined" />
        )}
        {(approvedSwap || a.status === 'SWAPPED') && (
          <Chip label="Bytt" size="small" color="success" variant="outlined" />
        )}

        {canRemind && (
          <Tooltip title="Påminn gruppen – kärlen ut måndag kväll, vid vägen tisdag 06:00">
            <span>
              <IconButton
                size="small"
                color="primary"
                disabled={!a.family.email}
                onClick={() => onSendReminder(a)}
              >
                <Bell size={16} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    )
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {currentYear} Schema
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {session?.user?.familyId
          ? 'Dra din kommande vecka till en annan för att föreslå ett byte.'
          : 'Logga in för att föreslå byten.'}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Card sx={{ overflow: 'hidden' }}>
          {assignments.filter((a) => a.isCurrent).map(renderStaticRow)}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="schedule">
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {draggableAssignments.map((a, i) => {
                    const isMyWeek = session?.user?.familyId === a.family.id
                    const pendingSwap = swaps.find(
                      (s) =>
                        s.status === 'PENDING' &&
                        s.weekNumber === a.weekNumber &&
                        [s.fromFamilyId, s.toFamilyId].includes(a.family.id),
                    )
                    const approvedSwap = swaps.find(
                      (s) => s.status === 'APPROVED' && s.weekNumber === a.weekNumber,
                    )

                    return (
                      <Draggable
                        key={a.id}
                        draggableId={a.id}
                        index={i}
                        isDragDisabled={!isMyWeek}
                      >
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              px: 2,
                              py: 1,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              bgcolor: snapshot.isDragging ? 'primary.light' : 'transparent',
                              boxShadow: snapshot.isDragging
                                ? '0 4px 16px rgba(76,175,80,0.18)'
                                : 'none',
                              '&:last-child': { borderBottom: 'none' },
                            }}
                          >
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                color: isMyWeek ? 'primary.main' : 'action.disabled',
                                cursor: isMyWeek ? 'grab' : 'default',
                                display: 'flex',
                                flexShrink: 0,
                              }}
                            >
                              <GripVertical size={16} />
                            </Box>

                            <DateBadge week={a.weekNumber} year={a.year} />

                            <Typography
                              variant="body2"
                              fontWeight={isMyWeek ? 700 : 400}
                              sx={{ flexGrow: 1 }}
                              noWrap
                            >
                              {a.family.name}
                            </Typography>

                            {isMyWeek && (
                              <Chip
                                label="Min"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ flexShrink: 0 }}
                              />
                            )}
                            {pendingSwap && (
                              <Chip
                                label="Väntar"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ flexShrink: 0 }}
                              />
                            )}
                            {(approvedSwap || a.status === 'SWAPPED') && (
                              <Chip
                                label="Bytt"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ flexShrink: 0 }}
                              />
                            )}
                          </Box>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      )}
    </>
  )
}
