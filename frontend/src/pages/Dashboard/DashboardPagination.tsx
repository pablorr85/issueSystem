import React from "react";
import { useTranslation } from "react-i18next";
import {
  PaginationFooter,
  PaginationInfo,
  PaginationButtons,
  PaginationButton,
} from "./Dashboard.styles";

export interface DashboardPaginationProps {
  totalCount: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  loading: boolean;
}

export const DashboardPagination: React.FC<DashboardPaginationProps> = ({
  totalCount,
  currentPage,
  setCurrentPage,
  totalPages,
  loading,
}) => {
  const { t } = useTranslation();

  if (totalCount <= 0) return null;

  return (
    <PaginationFooter>
      <PaginationInfo>
        {t("dashboard.paginationInfo", {
          page: currentPage,
          totalPages,
          totalCount,
        })}
      </PaginationInfo>
      <PaginationButtons>
        <PaginationButton
          variant="outlined"
          size="small"
          disabled={currentPage <= 1 || loading}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          data-testid="pagination-prev"
        >
          {t("dashboard.paginationPrev")}
        </PaginationButton>
        <PaginationButton
          variant="outlined"
          size="small"
          disabled={currentPage >= totalPages || loading}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          data-testid="pagination-next"
        >
          {t("dashboard.paginationNext")}
        </PaginationButton>
      </PaginationButtons>
    </PaginationFooter>
  );
};
