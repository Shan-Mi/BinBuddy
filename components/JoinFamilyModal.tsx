import { useState } from 'react'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'

interface Props {
  open: boolean
  onClose: () => void
  onJoined: (familyName: string) => void
}

export default function JoinFamilyModal({ open, onClose, onJoined }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/join-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: code.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setCode('')
        onJoined(json.data.familyName)
      } else {
        setError(json.error ?? 'Kunde inte gå med i gruppen')
      }
    } catch {
      setError('Nätverksfel – försök igen')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCode('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Gå med i din grupp</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Ange koden du fått av din kontaktperson.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="Grupkod"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="t.ex. join-10a"
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} color="inherit">
          Avbryt
        </Button>
        <Button
          variant="contained"
          onClick={handleJoin}
          disabled={loading || !code.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Gå med
        </Button>
      </DialogActions>
    </Dialog>
  )
}
