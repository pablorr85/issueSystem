import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { TFunction } from 'i18next';
import type { OperatorTask } from '../services/types';

export const getUrgencyLevelKey = (valStr: string): string => {
  const val = valStr.toLowerCase().trim();
  if (
    val.includes("critical") ||
    val.includes("crítica") ||
    val.includes("critica")
  ) {
    return "critical";
  }
  if (val.includes("high") || val.includes("alta")) {
    return "high";
  }
  if (val.includes("medium") || val.includes("media")) {
    return "medium";
  }
  if (val.includes("low") || val.includes("baja")) {
    return "low";
  }
  return "normal";
};

export const getUrgencyIcon = (levelKey: string) => {
  switch (levelKey) {
    case "critical":
      return <ErrorIcon style={{ fontSize: "0.9rem" }} />;
    case "high":
      return <WarningIcon style={{ fontSize: "0.9rem" }} />;
    case "medium":
      return <InfoIcon style={{ fontSize: "0.9rem" }} />;
    case "low":
      return <ArrowDownwardIcon style={{ fontSize: "0.9rem" }} />;
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
  const val = key ? String(extra[key]).toLowerCase() : 'normal';

  if (val.includes('critical') || val.includes('crítica') || val.includes('critica')) {
    return { key: 'critical', label: t('operatorHub.urgencyCritical', 'Critical'), order: 0 };
  }
  if (val.includes('high') || val.includes('alta')) {
    return { key: 'high', label: t('operatorHub.urgencyHigh', 'High'), order: 1 };
  }
  if (val.includes('medium') || val.includes('media')) {
    return { key: 'medium', label: t('operatorHub.urgencyMedium', 'Medium'), order: 2 };
  }
  if (val.includes('low') || val.includes('baja')) {
    return { key: 'low', label: t('operatorHub.urgencyLow', 'Low'), order: 3 };
  }
  return { key: 'normal', label: t('operatorHub.urgencyNone', 'Normal'), order: 4 };
};
