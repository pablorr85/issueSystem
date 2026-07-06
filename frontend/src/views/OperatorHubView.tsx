import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircularProgress, Alert, Button } from "@mui/material";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getOperatorHub } from "../services/api";
import { getUrgencyLevel, getUrgencyIcon } from "../utils/urgency";
import type { OperatorTask } from "../services/types";
import {
  Container,
  MobileCard,
  BrandHeader,
  LogoImage,
  LogoPlaceholder,
  TenantName,
  Subtitle,
  TaskList,
  TaskCard,
  TaskInfo,
  TaskTitleRow,
  TaskId,
  TaskDescription,
  UrgencyPill,
  StatusPill,
  EmptyContainer,
  HubSubtitle,
  EmptyText,
  LoadingContainer,
  CenterContainer,
} from "./OperatorHubView.styles";

const isUUID = (str: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const OperatorHubView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<OperatorTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasInvalidToken = !token || !isUUID(token);

  useEffect(() => {
    if (hasInvalidToken) {
      return;
    }

    let active = true;
    getOperatorHub(token)
      .then((res) => {
        if (!active) return;
        setTasks(res);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError(
          t(
            "operatorHub.errorLoad",
            "Failed to load task hub. Invalid or missing token.",
          ),
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, t, hasInvalidToken]);

  // Dynamic branding theme hook
  useEffect(() => {
    if (tasks.length > 0) {
      const firstTask = tasks[0];
      if (firstTask.tenant_visual_config?.primary_color) {
        const hex = firstTask.tenant_visual_config.primary_color;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
          const r = parseInt(result[1], 16) / 255;
          const g = parseInt(result[2], 16) / 255;
          const b = parseInt(result[3], 16) / 255;
          const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
          let h = 0,
            s = 0,
            l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
          }
          h = Math.round(h * 360);
          s = Math.round(s * 100);
          l = Math.round(l * 100);

          document.documentElement.style.setProperty("--primary-hue", `${h}`);
          document.documentElement.style.setProperty(
            "--primary",
            `hsl(${h}, ${s}%, ${l}%)`,
          );
          document.documentElement.style.setProperty(
            "--primary-hover",
            `hsl(${h}, ${s}%, ${l - 10}%)`,
          );
        }
      }
    }
  }, [tasks]);

  if (loading && !hasInvalidToken) {
    return (
      <LoadingContainer>
        <CircularProgress
          sx={{ color: "var(--primary, HSL(260, 85%, 60%))" }}
        />
      </LoadingContainer>
    );
  }

  if (error || hasInvalidToken) {
    return (
      <CenterContainer>
        <MobileCard>
          <Alert severity="error">
            {error ||
              t(
                "operatorHub.errorLoad",
                "Failed to load task hub. Invalid or missing token.",
              )}
          </Alert>
        </MobileCard>
      </CenterContainer>
    );
  }

  // Sort tasks by urgency level, then by creation date (newest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    const urgencyA = getUrgencyLevel(a, t);
    const urgencyB = getUrgencyLevel(b, t);
    if (urgencyA.order !== urgencyB.order) {
      return urgencyA.order - urgencyB.order;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const tenantName =
    tasks[0]?.tenant_name || t("app.appTitle", "Issue Tracker");
  const tenantLogo = tasks[0]?.tenant_logo_url;

  return (
    <Container>
      <MobileCard>
        <BrandHeader>
          {tenantLogo ? (
            <LogoImage src={tenantLogo} alt="Tenant Logo" />
          ) : (
            <LogoPlaceholder>{tenantName.charAt(0)}</LogoPlaceholder>
          )}
          <div>
            <TenantName>{tenantName}</TenantName>
            <Subtitle>{t("operatorHub.title")}</Subtitle>
          </div>
        </BrandHeader>

        <div>
          <HubSubtitle variant="h6">{t("operatorHub.subtitle")}</HubSubtitle>
        </div>

        {sortedTasks.length === 0 ? (
          <EmptyContainer>
            <BuildCircleIcon
              sx={{ fontSize: "3rem", color: "rgba(255,255,255,0.2)" }}
            />
            <EmptyText>{t("operatorHub.noTasks")}</EmptyText>
          </EmptyContainer>
        ) : (
          <TaskList>
            {sortedTasks.map((task) => {
              const urgency = getUrgencyLevel(task, t);
              return (
                <TaskCard
                  key={task.id}
                  onClick={() =>
                    navigate(`/work/task/${task.id}?token=${task.secure_token}`)
                  }
                  data-testid={`task-card-${task.id}`}
                >
                  <TaskInfo>
                    <TaskTitleRow>
                      <TaskId>Task #{task.id}</TaskId>
                      <StatusPill $status={task.status}>
                        {task.status === "in_progress"
                          ? t("dashboard.actionInProgress")
                          : task.status === "blocked"
                            ? t("dashboard.statusBlocked")
                            : task.status === "resolved"
                              ? t("dashboard.actionResolved")
                              : task.status === "wont_fix"
                                ? t("dashboard.actionWontFix")
                                : t("dashboard.actionPending")}
                      </StatusPill>
                      <UrgencyPill $level={urgency.key}>
                        {getUrgencyIcon(urgency.key)}
                        {urgency.label}
                      </UrgencyPill>
                    </TaskTitleRow>
                    <TaskDescription variant="body2">
                      {task.description}
                    </TaskDescription>
                  </TaskInfo>
                  <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.3)" }} />
                </TaskCard>
              );
            })}
          </TaskList>
        )}
      </MobileCard>
    </Container>
  );
};
