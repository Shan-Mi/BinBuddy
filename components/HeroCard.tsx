import { RefObject } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import type { ScheduleAssignment } from "../types/binbuddy";
import { weekFullDate, weekDateLabel } from "../utils/weekDate";

interface Props {
  assignment: ScheduleAssignment;
  cardRef: RefObject<HTMLDivElement | null>;
  onSendReminder: (assignment: ScheduleAssignment) => void;
}

export default function HeroCard({
  assignment,
  cardRef,
  onSendReminder,
}: Props) {
  const { data: session } = useSession();
  const canRemind =
    session?.user?.isAdmin || session?.user?.familyId === assignment.family.id;

  return (
    <Card
      ref={cardRef}
      sx={{
        mb: 3,
        background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
        border: "1px solid #a5d6a7",
      }}
    >
      <CardContent sx={{ px: 3, py: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="overline" color="primary" sx={{ flexGrow: 1 }}>
            🗑️ Denna vecka · V{assignment.weekNumber}
          </Typography>
          {canRemind && (
            <Tooltip title="Påminn gruppen – kärlen ut måndag kväll, vid vägen tisdag 06:00">
              <span>
                <IconButton
                  color="primary"
                  size="small"
                  disabled={!assignment.family.email}
                  onClick={() => onSendReminder(assignment)}
                  sx={{
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                >
                  <Bell size={18} />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>

        <Typography
          variant="h5"
          color="primary.dark"
          fontWeight={700}
          noWrap
          sx={{ mb: 0.5 }}
        >
          {assignment.family.name}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {weekFullDate(assignment.weekNumber, assignment.year)}
          {" · "}
          <Typography
            component="span"
            variant="body2"
            color="warning.dark"
            fontWeight={600}
          >
            kärlen vid vägen kl. 06:00
          </Typography>
        </Typography>

        <Box
          mt={2}
          sx={{
            borderTop: "1px solid",
            borderColor: "rgba(0,0,0,0.08)",
            pt: 2,
          }}
        >
          {/* Standard block typography lets text wrap naturally like a paragraph */}
          <Typography
            variant="body2"
            color="text.primary"
            fontWeight={500}
            sx={{ lineHeight: 1.5 }}
          >
            Ställ ut kärlen på Västervägen <strong>måndag kväll</strong> och dra
            tillbaka dem efter tömning.{" "}
          </Typography>

          {/* The strict deadline detail with a tiny left padding adjustment */}
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={0.5}
          >
            ⚠️ Senast tisdag{" "}
            <strong>
              {weekDateLabel(assignment.weekNumber, assignment.year)} kl. 06.00
            </strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
