import { Box, Typography } from '@mui/material'
import { weekDayLabel, weekDateLabel } from '../utils/weekDate'

interface Props {
  week: number
  year: number
  dimmed?: boolean
  highlight?: boolean
}

export default function DateBadge({ week, year, dimmed, highlight }: Props) {
  const secondary = dimmed ? 'text.disabled' : highlight ? 'primary.main' : 'text.secondary'
  const primary = dimmed ? 'text.disabled' : highlight ? 'primary.dark' : 'text.primary'
  return (
    <Box sx={{ minWidth: 64, textAlign: 'center', flexShrink: 0 }}>
      <Typography sx={{ fontSize: 11, lineHeight: 1.5, color: secondary, fontWeight: 500 }}>
        V{week} · {weekDayLabel(week, year)}
      </Typography>
      <Typography sx={{ fontSize: 13, lineHeight: 1.4, fontWeight: 700, color: primary }}>
        {weekDateLabel(week, year)}
      </Typography>
    </Box>
  )
}
