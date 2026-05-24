import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
} from '@mui/material'
import { LogIn } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import type { SwapRequest } from '../types/binbuddy'
import { weekDateLabel } from '../utils/weekDate'

interface Props {
  swaps: SwapRequest[]
  onSwapAction: (swapId: string, approve: boolean) => void
  onJoinOpen: () => void
}

export default function SwapPanel({ swaps, onSwapAction, onJoinOpen }: Props) {
  const { data: session } = useSession()

  const pendingSwaps = swaps.filter(
    (s) =>
      s.status === 'PENDING' &&
      session?.user?.familyId &&
      [s.fromFamilyId, s.toFamilyId].includes(session.user.familyId),
  )

  if (!session) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Logga in för att se och hantera bytesförfrågningar.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogIn size={14} />}
            onClick={() => signIn()}
          >
            Logga in
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!session.user.familyId && !session.user.isAdmin) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Gå med i en grupp för att se bytesförfrågningar.
          </Typography>
          <Button variant="outlined" size="small" onClick={onJoinOpen}>
            Gå med i grupp
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (pendingSwaps.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body2" color="text.secondary">
            Inga väntande bytesförfrågningar.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {pendingSwaps.map((swap) => {
        const isRecipient = session?.user?.familyId === swap.toFamilyId
        return (
          <Card key={swap.id} sx={{ mb: 1.5 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" gutterBottom>
                {weekDateLabel(swap.weekNumber, swap.year)} ↔{' '}
                {weekDateLabel(swap.toWeekNumber, swap.year)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                {swap.fromFamily.name} → {swap.toFamily.name}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {isRecipient ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    fullWidth
                    onClick={() => onSwapAction(swap.id, true)}
                  >
                    Godkänn
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    fullWidth
                    onClick={() => onSwapAction(swap.id, false)}
                  >
                    Avböj
                  </Button>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Väntar på svar från {swap.toFamily.name}…
                </Typography>
              )}
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
