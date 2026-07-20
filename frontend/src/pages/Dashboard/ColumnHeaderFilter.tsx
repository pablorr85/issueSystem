import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Tooltip, Box } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { useTranslation } from "react-i18next";

export interface FilterOption {
  label: string;
  value: string;
}

export interface ColumnHeaderFilterProps {
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (val: string) => void;
  testId?: string;
}

export const ColumnHeaderFilter: React.FC<ColumnHeaderFilterProps> = ({
  title,
  options,
  selectedValue,
  onSelect,
  testId = "column-header-filter",
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChoose = (val: string) => {
    onSelect(val);
    handleClose();
  };

  const isFiltered = Boolean(selectedValue);

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={(e) => {
        // Open menu when clicking header label
        e.stopPropagation();
        setAnchorEl(e.currentTarget as HTMLElement);
      }}
    >
      <span>{title}</span>
      <Tooltip title={t("dashboard.filterColumnTooltip", "Filtrar por esta columna")}>
        <IconButton
          size="small"
          onClick={handleOpen}
          data-testid={testId}
          sx={{
            padding: "2px",
            color: isFiltered ? "var(--primary, #7c4dff)" : "#a09cb4",
            backgroundColor: isFiltered ? "rgba(124, 77, 255, 0.12)" : "transparent",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "white",
            },
          }}
        >
          {isFiltered ? <FilterListIcon fontSize="small" /> : <FilterListIcon fontSize="small" style={{ opacity: 0.6 }} />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              background: "#1e1b30",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "white",
              borderRadius: "10px",
              minWidth: "160px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={selectedValue === opt.value}
            onClick={() => handleChoose(opt.value)}
            sx={{
              fontSize: "0.85rem",
              fontWeight: selectedValue === opt.value ? 600 : 400,
              color: selectedValue === opt.value ? "var(--primary, #7c4dff)" : "white",
              "&.Mui-selected": {
                backgroundColor: "rgba(124, 77, 255, 0.15)",
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            {opt.value === "" ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.8 }}>
                <FilterListOffIcon fontSize="small" />
                <em>{opt.label}</em>
              </Box>
            ) : (
              opt.label
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
