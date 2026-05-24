import { useEffect, useRef, useState } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Bell,
  GripVertical,
  LogIn,
  LogOut,
  Settings,
  Trash2,
} from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import JoinFamilyModal from '../components/JoinFamilyModal'
import { getISOWeek, getISOWeekYear } from '../utils/isoWeek'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Family {
  id: string
  name: string
  rotationOrder: number
}

interface ScheduleAssignment {
  id: string
  weekNumber: number
  year: number
  status: 'ACTIVE' | 'SWAPPED'
  family: Family
  isCurrent: boolean
  isPast: boolean
}

interface SwapRequest {
  id: string
  weekNumber: number
  year: number
  fromFamilyId: string
  toFamilyId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  fromFamily: Family
  toFamily: Family
}

type Snack = { msg: string; severity: 'success' | 'error' | 'info' }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function familyInitial(name: string) {
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase()
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: session, update: updateSession } = useSession()
  const currentRowRef = useRef<HTMLDivElement | null>(null)

  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([])
  const [swaps, setSwaps] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [joinOpen, setJoinOpen] = useState(false)
  const [snack, setSnack] = useState<Snack | null>(null)
  const [heroSticky, setHeroSticky] = useState(false)
  const heroCardRef = useRef<HTMLDivElement | null>(null)

  const now = new Date()
  const currentWeek = getISOWeek(now)
  const currentYear = getISOWeekYear(now)

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true)
    try {
      // Full-year schedule + all swaps for the year (for badge display)
      const [schedRes, swapsRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch(`/api/swaps?year=${currentYear}`),
      ])
      const { data: sched } = await schedRes.json()
      const { data: swapsData } = await swapsRes.json()
      setAssignments(sched ?? [])
      setSwaps(swapsData ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear])

  // Scroll current week into view after data loads
  useEffect(() => {
    if (!loading && currentRowRef.current) {
      currentRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [loading])

  // Show slim sticky banner when the hero card scrolls out of view
  useEffect(() => {
    const el = heroCardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setHeroSticky(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading])

  // ── Derived state ──────────────────────────────────────────────────────────

  const heroAssignment = assignments.find((a) => a.isCurrent)

  // Only upcoming (non-past, non-current) rows are draggable
  const draggableAssignments = assignments.filter(
    (a) => !a.isPast && !a.isCurrent
  )

  const pendingSwaps = swaps.filter(
    (s) =>
      s.status === 'PENDING' &&
      session?.user?.familyId &&
      [s.fromFamilyId, s.toFamilyId].includes(session.user.familyId)
  )

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !session?.user?.familyId) return

    const src = draggableAssignments[result.source.index]
    const dst = draggableAssignments[result.destination.index]
    if (!src || !dst || src.id === dst.id) return

    if (session.user.familyId !== src.family.id) {
      setSnack({
        msg: 'You can only drag your own week to propose a swap',
        severity: 'error',
      })
      return
    }

    try {
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromFamilyId: src.family.id,
          toFamilyId: dst.family.id,
          weekNumber: src.weekNumber,
          year: src.year,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSnack({
          msg: 'Swap request sent — waiting for approval',
          severity: 'success',
        })
        await fetchData()
      } else {
        setSnack({
          msg: json.error ?? 'Failed to create swap',
          severity: 'error',
        })
      }
    } catch {
      setSnack({ msg: 'Network error', severity: 'error' })
    }
  }

  const handleSwapAction = async (swapId: string, approve: boolean) => {
    try {
      const res = await fetch('/api/swaps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swapId,
          status: approve ? 'APPROVED' : 'REJECTED',
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSnack({
          msg: approve ? 'Swap approved!' : 'Swap rejected',
          severity: 'success',
        })
        await fetchData()
      } else {
        setSnack({ msg: json.error ?? 'Update failed', severity: 'error' })
      }
    } catch {
      setSnack({ msg: 'Network error', severity: 'error' })
    }
  }

  const handleSendReminder = async (assignment: ScheduleAssignment) => {
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: assignment.family.id,
          weekNumber: assignment.weekNumber,
        }),
      })
      const json = await res.json()
      setSnack(
        json.success
          ? { msg: 'Reminder sent!', severity: 'success' }
          : { msg: json.error ?? 'Failed to send', severity: 'error' }
      )
    } catch {
      setSnack({ msg: 'Network error', severity: 'error' })
    }
  }

  const handleLeaveFamily = async () => {
    const res = await fetch('/api/leave-family', { method: 'POST' })
    const json = await res.json()
    if (json.success) {
      await updateSession()
      setSnack({ msg: 'You have left your family group.', severity: 'success' })
      await fetchData()
    } else {
      setSnack({
        msg: json.error ?? 'Failed to leave family',
        severity: 'error',
      })
    }
  }

  const handleJoined = async (familyName: string) => {
    setJoinOpen(false)
    await updateSession()
    setSnack({
      msg: `Welcome, ${familyName}! You've joined your family group.`,
      severity: 'success',
    })
    await fetchData()
  }

  // ── Schedule row renderer (also used for static past rows) ─────────────────

  const renderStaticRow = (a: ScheduleAssignment) => {
    const isMyWeek = session?.user?.familyId === a.family.id
    const pendingSwap = swaps.find(
      (s) =>
        s.status === 'PENDING' &&
        s.weekNumber === a.weekNumber &&
        [s.fromFamilyId, s.toFamilyId].includes(a.family.id)
    )
    const approvedSwap = swaps.find(
      (s) => s.status === 'APPROVED' && s.weekNumber === a.weekNumber
    )

    return (
      <Box
        key={a.id}
        ref={a.isCurrent ? currentRowRef : undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: a.isCurrent
            ? 'primary.light'
            : a.isPast
            ? 'transparent'
            : 'transparent',
          opacity: a.isPast ? 0.45 : 1,
          '&:last-child': { borderBottom: 'none' },
        }}>
        {/* Week badge */}
        <Box
          sx={{
            minWidth: 42,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 13,
            color: a.isCurrent
              ? 'primary.dark'
              : a.isPast
              ? 'text.disabled'
              : 'text.secondary',
          }}>
          W{a.weekNumber}
        </Box>

        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: a.isCurrent
              ? 'primary.main'
              : a.isPast
              ? 'grey.300'
              : 'grey.200',
            color: a.isCurrent ? '#fff' : 'text.secondary',
            width: 32,
            height: 32,
            fontSize: 11,
            fontWeight: 700,
          }}>
          {familyInitial(a.family.name)}
        </Avatar>

        {/* Family name */}
        <Typography
          variant="body2"
          fontWeight={a.isCurrent || isMyWeek ? 700 : 400}
          color={a.isPast ? 'text.disabled' : 'text.primary'}
          sx={{ flexGrow: 1 }}>
          {a.family.name}
        </Typography>

        {/* Status chips */}
        {a.isCurrent && (
          <Chip
            label="Now"
            size="small"
            color="primary"
            sx={{ fontWeight: 700 }}
          />
        )}
        {isMyWeek && !a.isPast && !a.isCurrent && (
          <Chip
            label="Your Week"
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        {pendingSwap && (
          <Chip
            label="Swap Pending"
            size="small"
            color="warning"
            variant="outlined"
          />
        )}
        {approvedSwap && (
          <Chip
            label="Swapped"
            size="small"
            color="success"
            variant="outlined"
          />
        )}
        {a.status === 'SWAPPED' && !approvedSwap && (
          <Chip
            label="Swapped"
            size="small"
            color="default"
            variant="outlined"
          />
        )}

        {/* Reminder button — current week only */}
        {a.isCurrent && session && (
          <Tooltip title="Send reminder email">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleSendReminder(a)}>
              <Bell size={16} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── AppBar ── */}
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Trash2 size={22} color="#4caf50" />
            <Typography variant="h6" color="primary" fontWeight={700}>
              BinBuddy
            </Typography>
          </Box>

          <Chip
            label={`Week ${currentWeek} · ${currentYear}`}
            color="primary"
            size="small"
            sx={{ mr: 2 }}
          />

          {session ? (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mr: 1.5, display: { xs: 'none', sm: 'block' } }}>
                {session.user.name ?? session.user.email}
              </Typography>

              {!session.user.familyId && !session.user.isAdmin && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                  onClick={() => setJoinOpen(true)}>
                  Join Family
                </Button>
              )}

              {session.user.familyId && !session.user.isAdmin && (
                <Tooltip title="Leave your family">
                  <Button
                    variant="text"
                    size="small"
                    color="inherit"
                    sx={{ mr: 0.5, fontSize: 12, color: 'text.secondary' }}
                    onClick={handleLeaveFamily}>
                    Leave Family
                  </Button>
                </Tooltip>
              )}

              {session.user.isAdmin && (
                <Link href="/admin" passHref legacyBehavior>
                  <Tooltip title="Admin">
                    <IconButton
                      size="small"
                      sx={{ mr: 0.5 }}
                      aria-label="Admin">
                      <Settings size={18} />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}

              <Tooltip title="Sign out">
                <IconButton
                  size="small"
                  onClick={() => signOut()}
                  aria-label="Sign out">
                  <LogOut size={18} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<LogIn size={16} />}
              onClick={() => signIn()}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Slim sticky banner — visible only after hero card scrolls away ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 64,
          zIndex: 1100,
          background: 'linear-gradient(90deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderBottom: '1px solid #a5d6a7',
          px: { xs: 2, md: 4 },
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          overflow: 'hidden',
          maxHeight: heroSticky && heroAssignment ? 48 : 0,
          opacity: heroSticky && heroAssignment ? 1 : 0,
          transition: 'max-height 0.25s ease, opacity 0.2s ease',
          pointerEvents: heroSticky && heroAssignment ? 'auto' : 'none',
        }}>
        <Trash2 size={16} color="#388e3c" />
        <Typography
          variant="caption"
          color="primary.dark"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Week {heroAssignment?.weekNumber} · On duty
        </Typography>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 24,
            height: 24,
            fontSize: 10,
            fontWeight: 700,
          }}>
          {heroAssignment ? familyInitial(heroAssignment.family.name) : ''}
        </Avatar>
        <Typography
          variant="body2"
          color="primary.dark"
          fontWeight={700}
          sx={{ flexGrow: 1 }}>
          {heroAssignment?.family.name}
        </Typography>
        {session && heroAssignment && (
          <Tooltip title="Send reminder email">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleSendReminder(heroAssignment)}>
              <Bell size={15} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* ── Hero card ── */}
        {heroAssignment && (
          <Card
            ref={heroCardRef}
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              border: '1px solid #a5d6a7',
            }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="overline"
                color="primary"
                display="block"
                mb={1}>
                🗑️ This Week · Bin Duty
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 60,
                    height: 60,
                    fontSize: 20,
                    fontWeight: 700,
                  }}>
                  {familyInitial(heroAssignment.family.name)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" color="primary.dark">
                    {heroAssignment.family.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Week {heroAssignment.weekNumber}, {heroAssignment.year}
                  </Typography>
                </Box>
                {session && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<Bell size={14} />}
                    onClick={() => handleSendReminder(heroAssignment)}>
                    Send Reminder
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          {/* ── Full-year schedule ── */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" gutterBottom>
              {currentYear} Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {session?.user?.familyId
                ? 'Drag your upcoming week onto another to propose a swap.'
                : 'Sign in to propose swaps.'}
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <Card sx={{ overflow: 'hidden' }}>
                {/* Current week (static) */}
                {assignments.filter((a) => a.isCurrent).map(renderStaticRow)}

                {/* Upcoming rows (drag-and-drop) */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="schedule">
                    {(provided) => (
                      <Box ref={provided.innerRef} {...provided.droppableProps}>
                        {draggableAssignments.map((a, i) => {
                          const isMyWeek =
                            session?.user?.familyId === a.family.id
                          const pendingSwap = swaps.find(
                            (s) =>
                              s.status === 'PENDING' &&
                              s.weekNumber === a.weekNumber &&
                              [s.fromFamilyId, s.toFamilyId].includes(
                                a.family.id
                              )
                          )
                          const approvedSwap = swaps.find(
                            (s) =>
                              s.status === 'APPROVED' &&
                              s.weekNumber === a.weekNumber
                          )

                          return (
                            <Draggable
                              key={a.id}
                              draggableId={a.id}
                              index={i}
                              isDragDisabled={!isMyWeek}>
                              {(provided, snapshot) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2,
                                    py: 1.2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: snapshot.isDragging
                                      ? 'primary.light'
                                      : 'transparent',
                                    boxShadow: snapshot.isDragging
                                      ? '0 4px 16px rgba(76,175,80,0.18)'
                                      : 'none',
                                    '&:last-child': { borderBottom: 'none' },
                                  }}>
                                  {/* Drag handle */}
                                  <Box
                                    {...provided.dragHandleProps}
                                    sx={{
                                      color: isMyWeek
                                        ? 'primary.main'
                                        : 'action.disabled',
                                      cursor: isMyWeek ? 'grab' : 'default',
                                      display: 'flex',
                                      mr: -0.5,
                                    }}>
                                    <GripVertical size={16} />
                                  </Box>

                                  {/* Week badge */}
                                  <Box
                                    sx={{
                                      minWidth: 34,
                                      textAlign: 'center',
                                      fontWeight: 700,
                                      fontSize: 13,
                                      color: 'text.secondary',
                                    }}>
                                    W{a.weekNumber}
                                  </Box>

                                  {/* Avatar */}
                                  <Avatar
                                    sx={{
                                      bgcolor: isMyWeek
                                        ? 'primary.main'
                                        : 'grey.200',
                                      color: isMyWeek
                                        ? '#fff'
                                        : 'text.secondary',
                                      width: 32,
                                      height: 32,
                                      fontSize: 11,
                                      fontWeight: 700,
                                    }}>
                                    {familyInitial(a.family.name)}
                                  </Avatar>

                                  {/* Family name */}
                                  <Typography
                                    variant="body2"
                                    fontWeight={isMyWeek ? 700 : 400}
                                    sx={{ flexGrow: 1 }}>
                                    {a.family.name}
                                  </Typography>

                                  {/* Status chips */}
                                  {isMyWeek && (
                                    <Chip
                                      label="Your Week"
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  )}
                                  {pendingSwap && (
                                    <Chip
                                      label="Swap Pending"
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                    />
                                  )}
                                  {approvedSwap && (
                                    <Chip
                                      label="Swapped"
                                      size="small"
                                      color="success"
                                      variant="outlined"
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
          </Grid>

          {/* ── Swap requests panel ── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h6" gutterBottom>
              Swap Requests
            </Typography>

            {!session ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Sign in to view and manage swap requests.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LogIn size={14} />}
                    onClick={() => signIn()}>
                    Sign in
                  </Button>
                </CardContent>
              </Card>
            ) : !session.user.familyId && !session.user.isAdmin ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Join a family to see swap requests.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setJoinOpen(true)}>
                    Join Family
                  </Button>
                </CardContent>
              </Card>
            ) : pendingSwaps.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No pending swap requests.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              pendingSwaps.map((swap) => (
                <Card key={swap.id} sx={{ mb: 1.5 }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Week {swap.weekNumber} swap
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1.5}>
                      {swap.fromFamily.name} ↔ {swap.toFamily.name}
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        fullWidth
                        onClick={() => handleSwapAction(swap.id, true)}>
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        onClick={() => handleSwapAction(swap.id, false)}>
                        Reject
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Grid>
        </Grid>
      </Container>

      {/* ── Modals & Toasts ── */}
      <JoinFamilyModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoined={handleJoined}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          severity={snack?.severity}
          onClose={() => setSnack(null)}
          sx={{ width: '100%' }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
