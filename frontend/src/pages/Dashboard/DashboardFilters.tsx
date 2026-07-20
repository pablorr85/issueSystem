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
      <FilterRowSecondary style={{ borderTop: "none", paddingTop: 0 }}>
        <ReportButton
          variant="contained"
          onClick={() => navigate(`/${tenantId}/report`)}
          data-testid="create-issue-link"
        >
          <AddIcon />
          {t("app.tabReport")}
        </ReportButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginLeft: "auto" }}>
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
        </Box>
      </FilterRowSecondary>
    </FilterSection>
  );
};
