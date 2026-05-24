import { signIn } from 'next-auth/react'
import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import { Trash2 } from 'lucide-react'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    await signIn('google', { callbackUrl: '/' })
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('admin-credentials', {
      email: adminEmail,
      password: adminPassword,
      redirect: false,
    })
    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Trash2 size={28} color="#fff" />
              </Box>
              <Typography variant="h5" color="primary" fontWeight={700}>
                BinBuddy
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Neighborhood trash-duty scheduler
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={handleGoogle}
              startIcon={
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              }
              sx={{ textTransform: 'none', fontSize: 15 }}
            >
              Continue with Google
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Admin
              </Typography>
            </Divider>

            <form onSubmit={handleAdminLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                size="small"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                sx={{ mb: 1.5 }}
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                size="small"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                sx={{ mb: 1.5 }}
                autoComplete="current-password"
              />
              {error && (
                <Alert severity="error" sx={{ mb: 1.5, fontSize: 13 }}>
                  {error}
                </Alert>
              )}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || !adminEmail || !adminPassword}
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
              >
                Sign in as Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
