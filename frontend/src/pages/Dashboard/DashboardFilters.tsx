import React from "react";
import { useNavigate } from "react-router-dom";
import { MenuItem, InputLabel } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import type { Operator } from "../../services/types";
import {
  FilterSection,
  ReportButton,
  StyledFormControl,
  FilterSelect,
} from "./Dashboard.styles";

export interface DashboardFiltersProps {
  tenantId: string;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  operatorFilterValue: string;
  onOperatorFilterChange: (val: string) => void;
  urgencyFilterValue: string;
  onUrgencyFilterChange: (val: string) => void;
  urgencyColumnId: string;
  operators: Operator[];
  loading: boolean;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  tenantId,
  statusFilter,
  onStatusFilterChange,
  operatorFilterValue,
  onOperatorFilterChange,
  urgencyFilterValue,
  onUrgencyFilterChange,
  urgencyColumnId,
  operators,
  loading,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <FilterSection>
      <ReportButton
        variant="contained"
        onClick={() => navigate(`/${tenantId}/report`)}
        data-testid="create-issue-link"
      >
        <AddIcon />
        {t("app.tabReport")}
      </ReportButton>

      <StyledFormControl variant="outlined" size="small">
        <InputLabel id="filter-status-label">
          {t("dashboard.statusFilterLabel")}
        </InputLabel>
        <FilterSelect
          labelId="filter-status-label"
          value={statusFilter}
          label={t("dashboard.statusFilterLabel")}
          onChange={(e) => onStatusFilterChange(e.target.value as string)}
          disabled={loading}
          inputProps={{ "data-testid": "dashboard-status-filter" }}
        >
          <MenuItem value="">
            <em>{t("dashboard.filterAll")}</em>
          </MenuItem>
          <MenuItem value="pending">
            {t("dashboard.filterPending")}
          </MenuItem>
          <MenuItem value="in_progress">
            {t("dashboard.filterInProgress")}
          </MenuItem>
          <MenuItem value="resolved">
            {t("dashboard.filterResolved")}
          </MenuItem>
        </FilterSelect>
      </StyledFormControl>

      <StyledFormControl variant="outlined" size="small">
        <InputLabel id="filter-operator-label">
          {t("dashboard.operatorFilterLabel")}
        </InputLabel>
        <FilterSelect
          labelId="filter-operator-label"
          value={operatorFilterValue}
          label={t("dashboard.operatorFilterLabel")}
          onChange={(e) => onOperatorFilterChange(e.target.value as string)}
          inputProps={{ "data-testid": "dashboard-operator-filter" }}
        >
          <MenuItem value="">
            <em>{t("dashboard.filterAllOperators")}</em>
          </MenuItem>
          {operators.map((op) => (
            <MenuItem key={op.id} value={String(op.id)}>
              {op.username}
            </MenuItem>
          ))}
        </FilterSelect>
      </StyledFormControl>

      {urgencyColumnId && (
        <StyledFormControl variant="outlined" size="small">
          <InputLabel id="filter-urgency-label">
            {t("dashboard.urgencyFilterLabel")}
          </InputLabel>
          <FilterSelect
            labelId="filter-urgency-label"
            value={urgencyFilterValue}
            label={t("dashboard.urgencyFilterLabel")}
            onChange={(e) => onUrgencyFilterChange(e.target.value as string)}
            inputProps={{ "data-testid": "dashboard-urgency-filter" }}
          >
            <MenuItem value="">
              <em>{t("dashboard.filterAllUrgencies")}</em>
            </MenuItem>
            <MenuItem value="critical">{t("operatorHub.urgencyCritical")}</MenuItem>
            <MenuItem value="high">{t("operatorHub.urgencyHigh")}</MenuItem>
            <MenuItem value="medium">{t("operatorHub.urgencyMedium")}</MenuItem>
            <MenuItem value="low">{t("operatorHub.urgencyLow")}</MenuItem>
            <MenuItem value="normal">{t("operatorHub.urgencyNone")}</MenuItem>
          </FilterSelect>
        </StyledFormControl>
      )}
    </FilterSection>
  );
};
