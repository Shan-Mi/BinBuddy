import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Container, Grid, Snackbar, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { getISOWeekYear } from '../utils/isoWeek'
import { weekDateLabel } from '../utils/weekDate'
import type { ConfirmState, ScheduleAssignment, Snack, SwapRequest } from '../types/binbuddy'

import NavBar from '../components/NavBar'
import HeroCard from '../components/HeroCard'
import StickyBanner from '../components/StickyBanner'
import ScheduleList from '../components/ScheduleList'
import SwapPanel from '../components/SwapPanel'
import ConfirmDialog from '../components/ConfirmDialog'
import JoinFamilyModal from '../components/JoinFamilyModal'

export default function Dashboard() {
  const { update: updateSession } = useSession()
  const heroCardRef = useRef<HTMLDivElement | null>(null)

  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([])
  const [swaps, setSwaps] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [joinOpen, setJoinOpen] = useState(false)
  const [snack, setSnack] = useState<Snack | null>(null)
  const [heroSticky, setHeroSticky] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  const now = new Date()
  const currentYear = getISOWeekYear(now)

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true)
    try {
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

  // Show slim sticky banner when the hero card scrolls out of view
  useEffect(() => {
    const el = heroCardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setHeroSticky(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading])

  // ── Derived state ────────────────────────────────────────────────────────────

  const heroAssignment = assignments.find((a) => a.isCurrent)

  // ── Action handlers (the real API calls) ─────────────────────────────────────

  const doLeaveFamily = async () => {
    const res = await fetch('/api/leave-family', { method: 'POST' })
    const json = await res.json()
    if (json.success) {
      await updateSession()
      setSnack({ msg: 'Du har lämnat din grupp.', severity: 'success' })
      await fetchData()
    } else {
      setSnack({ msg: json.error ?? 'Kunde inte lämna gruppen', severity: 'error' })
    }
  }

  const doProposeSwap = async (src: ScheduleAssignment, dst: ScheduleAssignment) => {
    try {
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromFamilyId: src.family.id,
          toFamilyId: dst.family.id,
          weekNumber: src.weekNumber,
          toWeekNumber: dst.weekNumber,
          year: src.year,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSnack({ msg: 'Bytesförfrågan skickad – väntar på godkännande', severity: 'success' })
        await fetchData()
      } else {
        setSnack({ msg: json.error ?? 'Kunde inte skapa bytet', severity: 'error' })
      }
    } catch {
      setSnack({ msg: 'Nätverksfel', severity: 'error' })
    }
  }

  const doSwapAction = async (swapId: string, approve: boolean) => {
    try {
      const res = await fetch('/api/swaps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swapId, status: approve ? 'APPROVED' : 'REJECTED' }),
      })
      const json = await res.json()
      if (json.success) {
        setSnack({ msg: approve ? 'Byte godkänt!' : 'Byte avböjt', severity: 'success' })
        await fetchData()
      } else {
        setSnack({ msg: json.error ?? 'Uppdatering misslyckades', severity: 'error' })
      }
    } catch {
      setSnack({ msg: 'Nätverksfel', severity: 'error' })
    }
  }

  const doSendReminder = async (assignment: ScheduleAssignment) => {
    await fetch('/api/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyId: assignment.family.id,
        weekNumber: assignment.weekNumber,
      }),
    })
  }

  // ── Confirmation-wrapped handlers (shown to UI) ───────────────────────────────

  const handleLeaveFamily = () => {
    setConfirm({
      title: 'Lämna gruppen?',
      body: 'Du kan gå med igen med din grupkod.',
      confirmLabel: 'Lämna',
      confirmColor: 'error',
      onConfirm: doLeaveFamily,
    })
  }

  const handleProposeSwap = (src: ScheduleAssignment, dst: ScheduleAssignment) => {
    setConfirm({
      title: 'Föreslå byte?',
      body: `Byta vecka ${src.weekNumber} (${src.family.name}, ${weekDateLabel(src.weekNumber, src.year)}) mot vecka ${dst.weekNumber} (${dst.family.name}, ${weekDateLabel(dst.weekNumber, dst.year)})?`,
      confirmLabel: 'Föreslå',
      confirmColor: 'primary',
      onConfirm: () => doProposeSwap(src, dst),
    })
  }

  const handleSwapAction = (swapId: string, approve: boolean) => {
    setConfirm({
      title: approve ? 'Godkänn byte?' : 'Avböj byte?',
      body: approve
        ? 'Veckornas ansvariga byter plats i schemat.'
        : 'Bytesförfrågan avvisas och tas bort.',
      confirmLabel: approve ? 'Godkänn' : 'Avböj',
      confirmColor: approve ? 'success' : 'error',
      onConfirm: () => doSwapAction(swapId, approve),
    })
  }

  const handleSendReminder = (assignment: ScheduleAssignment) => {
    setConfirm({
      title: 'Skicka påminnelse?',
      body: `Påminn ${assignment.family.name} om att kärlen ska ut måndag kväll och stå vid vägen tisdag kl. 06:00.`,
      confirmLabel: 'Skicka',
      confirmColor: 'primary',
      onConfirm: () => doSendReminder(assignment),
    })
  }

  const handleJoined = async (familyName: string) => {
    setJoinOpen(false)
    await updateSession()
    setSnack({ msg: `Välkommen, ${familyName}! Du har gått med i gruppen.`, severity: 'success' })
    await fetchData()
  }

  const closeConfirm = () => setConfirm(null)

  const runConfirm = () => {
    confirm?.onConfirm()
    setConfirm(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavBar onJoinOpen={() => setJoinOpen(true)} onLeaveFamily={handleLeaveFamily} />

      <StickyBanner
        assignment={heroAssignment}
        visible={heroSticky}
        onSendReminder={handleSendReminder}
      />

      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        {heroAssignment && (
          <HeroCard
            assignment={heroAssignment}
            cardRef={heroCardRef}
            onSendReminder={handleSendReminder}
          />
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <ScheduleList
              assignments={assignments}
              swaps={swaps}
              loading={loading}
              currentYear={currentYear}
              onProposeSwap={handleProposeSwap}
              onError={(msg) => setSnack({ msg, severity: 'error' })}
              onSendReminder={handleSendReminder}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h6" gutterBottom>
              Bytesförfrågningar
            </Typography>
            <SwapPanel
              swaps={swaps}
              onSwapAction={handleSwapAction}
              onJoinOpen={() => setJoinOpen(true)}
            />
          </Grid>
        </Grid>
      </Container>

      <JoinFamilyModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoined={handleJoined}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ''}
        body={confirm?.body ?? ''}
        confirmLabel={confirm?.confirmLabel ?? 'OK'}
        confirmColor={confirm?.confirmColor}
        onConfirm={runConfirm}
        onCancel={closeConfirm}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity} onClose={() => setSnack(null)} sx={{ width: '100%' }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
