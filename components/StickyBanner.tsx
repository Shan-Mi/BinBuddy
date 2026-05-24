import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { Bell, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import type { ScheduleAssignment } from '../types/binbuddy'
import { weekDateLabel } from '../utils/weekDate'

interface Props {
  assignment: ScheduleAssignment | undefined
  visible: boolean
  onSendReminder: (assignment: ScheduleAssignment) => void
}

export default function StickyBanner({ assignment, visible, onSendReminder }: Props) {
  const { data: session } = useSession()
  const active = visible && !!assignment
  const canRemind =
    !!assignment &&
    (session?.user?.isAdmin || session?.user?.familyId === assignment.family.id)

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 64,
        zIndex: 1100,
        background: 'linear-gradient(90deg, #e8f5e9 0%, #c8e6c9 100%)',
        borderBottom: '1px solid #a5d6a7',
        px: { xs: 2, md: 4 },
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        maxHeight: active ? 48 : 0,
        py: active ? 0.75 : 0,
        opacity: active ? 1 : 0,
        transition: 'max-height 0.25s ease, opacity 0.2s ease, padding 0.25s ease',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <Trash2 size={15} color="#388e3c" />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body2" color="primary.dark" fontWeight={700} noWrap>
          {assignment?.family.name}
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{ ml: 1, fontWeight: 400 }}
          >
            {assignment
              ? `· kärlen vid vägen tis ${weekDateLabel(assignment.weekNumber, assignment.year)} kl. 06:00`
              : ''}
          </Typography>
        </Typography>
      </Box>
      {canRemind && (
        <Tooltip title="Påminn gruppen – kärlen ut måndag kväll, vid vägen tisdag 06:00">
          <span>
            <IconButton
              size="small"
              color="primary"
              disabled={!assignment?.family.email}
              onClick={() => assignment && onSendReminder(assignment)}
            >
              <Bell size={15} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  )
}
