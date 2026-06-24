import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { TFunction } from 'i18next';
import type { OperatorTask } from '../services/types';

export const getUrgencyLevelKey = (valStr: string): string => {
  const val = valStr.toLowerCase().trim();
  if (val === 'critical' || val === 'high' || val === 'medium' || val === 'low' || val === 'normal') {
    return val;
  }
  return "normal";
};

export const getUrgencyIcon = (levelKey: string) => {
  switch (levelKey) {
    case "critical":
      return <ErrorIcon sx={{ fontSize: "0.9rem" }} />;
    case "high":
      return <WarningIcon sx={{ fontSize: "0.9rem" }} />;
    case "medium":
      return <InfoIcon sx={{ fontSize: "0.9rem" }} />;
    case "low":
      return <ArrowDownwardIcon sx={{ fontSize: "0.9rem" }} />;
    default:
      return null;
  }
};

export const getUrgencyLevel = (
  task: OperatorTask,
  t: TFunction
): { key: string; label: string; order: number } => {
  const extra = task.extra_data || {};
  const key = Object.keys(extra).find(k => k.toLowerCase() === 'urgency' || k.toLowerCase() === 'urgencia');
  const val = key ? String(extra[key]).toLowerCase().trim() : 'normal';

  if (val === 'critical') {
    return { key: 'critical', label: t('operatorHub.urgencyCritical', 'Critical'), order: 0 };
  }
  if (val === 'high') {
    return { key: 'high', label: t('operatorHub.urgencyHigh', 'High'), order: 1 };
  }
  if (val === 'medium') {
    return { key: 'medium', label: t('operatorHub.urgencyMedium', 'Medium'), order: 2 };
  }
  if (val === 'low') {
    return { key: 'low', label: t('operatorHub.urgencyLow', 'Low'), order: 3 };
  }
  return { key: 'normal', label: t('operatorHub.urgencyNone', 'Normal'), order: 4 };
};
