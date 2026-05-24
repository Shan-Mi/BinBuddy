import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  ArrowLeft,
  Edit2,
  KeyRound,
  PlusCircle,
  RefreshCw,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FamilyRow {
  id: string
  name: string
  joinCode: string
  order: number
  user: { id: string; email: string; name: string | null } | null
  _count: { assignments: number }
}

type Snack = { msg: string; severity: 'success' | 'error' }

// ─── Page ────────────────────────────────────────────────────────────────────

interface Props {
  initialFamilies: FamilyRow[]
}

export default function AdminFamiliesPage({ initialFamilies }: Props) {
  const [families, setFamilies] = useState<FamilyRow[]>(initialFamilies)
  const [snack, setSnack] = useState<Snack | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  // ── Add / Edit dialog ──────────────────────────────────────────────────────
  const [dialog, setDialog] = useState<{ open: boolean; family: FamilyRow | null }>({
    open: false,
    family: null,
  })
  const [formName, setFormName] = useState('')
  const [formOrder, setFormOrder] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  // ── Delete confirmation ────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<FamilyRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toast = (msg: string, severity: Snack['severity'] = 'success') =>
    setSnack({ msg, severity })

  const refreshFamilies = async () => {
    const res = await fetch('/api/admin/families')
    const json = await res.json()
    if (json.success) setFamilies(json.data)
  }

  // ── Open dialog ────────────────────────────────────────────────────────────

  const openAdd = () => {
    setFormName('')
    setFormOrder('')
    setDialog({ open: true, family: null })
  }

  const openEdit = (f: FamilyRow) => {
    setFormName(f.name)
    setFormOrder(f.order)
    setDialog({ open: true, family: f })
  }

  // ── Save (add or edit) ─────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formName.trim()) return
    setSaving(true)

    try {
      const isEdit = !!dialog.family
      const res = await fetch('/api/admin/families', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit
            ? { id: dialog.family!.id, name: formName, order: formOrder || undefined }
            : { name: formName }
        ),
      })
      const json = await res.json()
      if (json.success) {
        toast(isEdit ? 'Family updated' : 'Family added')
        setDialog({ open: false, family: null })
        await refreshFamilies()
      } else {
        toast(json.error ?? 'Failed to save', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/admin/families?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        toast(`${deleteTarget.name} removed`)
        setDeleteTarget(null)
        await refreshFamilies()
      } else {
        toast(json.error ?? 'Failed to delete', 'error')
      }
    } finally {
      setDeleting(false)
    }
  }

  // ── Regenerate schedule ────────────────────────────────────────────────────

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const res = await fetch('/api/admin/regenerate-schedule', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        toast(`Schedule regenerated — ${json.weeks} weeks for ${json.year}`)
      } else {
        toast(json.error ?? 'Regeneration failed', 'error')
      }
    } finally {
      setRegenerating(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar>
          <Link href="/" passHref legacyBehavior>
            <IconButton size="small" sx={{ mr: 1 }}>
              <ArrowLeft size={18} />
            </IconButton>
          </Link>
          <Trash2 size={20} color="#4caf50" />
          <Typography variant="h6" color="primary" fontWeight={700} sx={{ ml: 1, flexGrow: 1 }}>
            BinBuddy · Admin
          </Typography>
          <Chip label="Admin" color="primary" size="small" sx={{ mr: 2 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5">Family Rotation</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage who's in the bin-duty rotation. Order determines the weekly sequence.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={regenerating ? <CircularProgress size={14} /> : <RefreshCw size={14} />}
            disabled={regenerating}
            onClick={handleRegenerate}
          >
            Regenerate Schedule
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlusCircle size={14} />}
            onClick={openAdd}
          >
            Add Family
          </Button>
        </Box>

        {/* Families table */}
        <Card>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                <TableCell sx={{ width: 56 }}>#</TableCell>
                <TableCell>Family</TableCell>
                <TableCell>Join Code</TableCell>
                <TableCell>Member</TableCell>
                <TableCell sx={{ width: 80 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {families.map((f) => (
                <TableRow key={f.id} hover>
                  {/* Rotation position */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {f.order}
                    </Typography>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: 12, fontWeight: 700 }}
                      >
                        {f.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {f.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Join code */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <KeyRound size={13} color="#888" />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {f.joinCode}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Member status */}
                  <TableCell>
                    {f.user ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <UserCheck size={14} color="#4caf50" />
                        <Typography variant="caption" color="text.secondary">
                          {f.user.name ?? f.user.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <UserX size={14} color="#bbb" />
                        <Typography variant="caption" color="text.disabled">
                          No member
                        </Typography>
                      </Box>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(f)}>
                        <Edit2 size={15} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(f)}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {families.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">
                No families yet. Add one to get started.
              </Typography>
            </Box>
          )}
        </Card>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
          After adding, removing, or reordering families click "Regenerate Schedule" to rebuild the weekly rotation for the current year.
        </Typography>
      </Container>

      {/* ── Add / Edit dialog ── */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, family: null })} maxWidth="xs" fullWidth>
        <DialogTitle>{dialog.family ? 'Edit Family' : 'Add Family'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField
            autoFocus
            label="House / Family name"
            placeholder="e.g. 12E"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            fullWidth
          />
          {dialog.family && (
            <TextField
              label="Rotation order"
              type="number"
              value={formOrder}
              onChange={(e) => setFormOrder(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
              helperText="Lower number = earlier in rotation"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setDialog({ open: false, family: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !formName.trim()}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {dialog.family ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will remove <strong>{deleteTarget?.name}</strong> from the rotation, delete their{' '}
            {deleteTarget?._count.assignments} week assignment(s), and unlink their member account.
            This cannot be undone.
          </Typography>
          {deleteTarget?.user && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Alert severity="warning" sx={{ fontSize: 12 }}>
                Member <strong>{deleteTarget.user.email}</strong> will be unlinked but their login
                account is kept.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
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

// ── Server-side auth guard ────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)

  if (!session?.user?.isAdmin) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const families = await (await import('../../prisma/client')).prisma.family.findMany({
    orderBy: { order: 'asc' },
    include: {
      user: { select: { id: true, email: true, name: true } },
      _count: { select: { assignments: true } },
    },
  })

  return { props: { initialFamilies: JSON.parse(JSON.stringify(families)) } }
}
