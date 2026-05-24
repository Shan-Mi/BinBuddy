import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import { LogIn, LogOut, Settings, Trash2 } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  onJoinOpen: () => void
  onLeaveFamily: () => void
}

export default function NavBar({ onJoinOpen, onLeaveFamily }: Props) {
  const { data: session } = useSession()

  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Trash2 size={22} color="#4caf50" />
          <Typography variant="h6" color="primary" fontWeight={700}>
            BinBuddy
          </Typography>
        </Box>

        {session ? (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mr: 1.5, display: { xs: 'none', sm: 'block' } }}
            >
              {session.user.name ?? session.user.email}
            </Typography>

            {!session.user.familyId && !session.user.isAdmin && (
              <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={onJoinOpen}>
                Gå med i grupp
              </Button>
            )}

            {session.user.familyId && !session.user.isAdmin && (
              <Tooltip title="Lämna din grupp">
                <Button
                  variant="text"
                  size="small"
                  color="inherit"
                  sx={{ mr: 0.5, fontSize: 12, color: 'text.secondary' }}
                  onClick={onLeaveFamily}
                >
                  Lämna
                </Button>
              </Tooltip>
            )}

            {session.user.isAdmin && (
              <Link href="/admin" passHref legacyBehavior>
                <Tooltip title="Administration">
                  <IconButton size="small" sx={{ mr: 0.5 }} aria-label="Administration">
                    <Settings size={18} />
                  </IconButton>
                </Tooltip>
              </Link>
            )}

            <Tooltip title="Logga ut">
              <IconButton size="small" onClick={() => signOut()} aria-label="Logga ut">
                <LogOut size={18} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={<LogIn size={16} />}
            onClick={() => signIn()}
          >
            Logga in
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
