import React from "react";
import { useNavigate } from "react-router-dom";
import { MenuItem, InputLabel, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "react-i18next";
import type { Operator } from "../../services/types";
import { CustomDatePicker } from "../../components/CustomDatePicker/CustomDatePicker";
import {
  FilterSection,
  FilterRowPrimary,
  FilterRowSecondary,
  ExportExcelButton,
  ClearDatesButton,
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
  assignedFilter: string;
  onAssignedFilterChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  onExportExcel: () => void;
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
  assignedFilter,
  onAssignedFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onExportExcel,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClearDates = () => {
    onStartDateChange("");
    onEndDateChange("");
  };

  return (
    <FilterSection>
      {/* Row 1: Status, Operator, Urgency, Assignment & Report Button */}
      <FilterRowPrimary>
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
            <MenuItem value="pending">{t("dashboard.filterPending")}</MenuItem>
            <MenuItem value="in_progress">{t("dashboard.filterInProgress")}</MenuItem>
            <MenuItem value="resolved">{t("dashboard.filterResolved")}</MenuItem>
            <MenuItem value="blocked">{t("dashboard.filterBlocked")}</MenuItem>
            <MenuItem value="wont_fix">{t("dashboard.filterWontFix")}</MenuItem>
          </FilterSelect>
        </StyledFormControl>

        <StyledFormControl variant="outlined" size="small">
          <InputLabel id="filter-assignment-label">
            {t("dashboard.assignmentFilterLabel", "Asignación")}
          </InputLabel>
          <FilterSelect
            labelId="filter-assignment-label"
            value={assignedFilter || ""}
            label={t("dashboard.assignmentFilterLabel", "Asignación")}
            onChange={(e) => onAssignedFilterChange?.(e.target.value as string)}
            disabled={loading}
            inputProps={{ "data-testid": "dashboard-assignment-filter" }}
          >
            <MenuItem value="">
              <em>{t("dashboard.filterAll")}</em>
            </MenuItem>
            <MenuItem value="false">{t("dashboard.unassigned")}</MenuItem>
            <MenuItem value="true">{t("dashboard.filterAssigned", "Asignado")}</MenuItem>
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
      </FilterRowPrimary>

      {/* Row 2: Custom Date Range Picker & Excel Export Button */}
      <FilterRowSecondary>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <CustomDatePicker
            label={t("dashboard.startDateLabel", "Fecha Desde")}
            value={startDate}
            onChange={onStartDateChange}
            testId="dashboard-start-date"
          />

          <CustomDatePicker
            label={t("dashboard.endDateLabel", "Fecha Hasta")}
            value={endDate}
            onChange={onEndDateChange}
            testId="dashboard-end-date"
          />

          {(startDate || endDate) && (
            <ClearDatesButton
              size="small"
              onClick={handleClearDates}
              startIcon={<ClearIcon fontSize="small" />}
              data-testid="clear-dates-btn"
            >
              {t("dashboard.clearDateFilters", "Limpiar Fechas")}
            </ClearDatesButton>
          )}
        </Box>

        <ExportExcelButton
          variant="contained"
          color="success"
          size="medium"
          onClick={onExportExcel}
          startIcon={<FileDownloadIcon />}
          data-testid="export-excel-btn"
        >
          {t("dashboard.exportExcelButton", "Exportar Excel")}
        </ExportExcelButton>
      </FilterRowSecondary>
    </FilterSection>
  );
};
