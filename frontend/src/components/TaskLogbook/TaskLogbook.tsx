import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getTaskLogs, addTaskLog } from "../../services/api";
import type { TaskLog } from "../../services/types";
import {
  LogbookSection,
  LogbookHeaderRow,
  LogbookTitle,
  LogbookList,
  LogBubble,
  LogHeader,
  LogAuthor,
  LogTime,
  LogBody,
  LogText,
  LogAttachment,
  LogMetricsContainer,
  MetricPill,
  LogInputContainer,
  LogInputRow,
  MetricsInputRow,
  MetricFieldWrapper,
  StyledMetricInput,
  StyledTextArea,
  LogSubmitButton,
  EmptyLogbookState,
  ErrorMessage,
  LightboxOverlay,
  LightboxImage,
  LightboxCloseButton,
} from "./TaskLogbook.styles";

export interface TaskLogbookProps {
  issueId: number;
  token?: string;
  onLogAdded?: () => void;
  disabled?: boolean;
}

const formatLogDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export const TaskLogbook: React.FC<TaskLogbookProps> = ({
  issueId,
  token,
  onLogAdded,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [timeSpent, setTimeSpent] = useState<string>("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [prevIssueId, setPrevIssueId] = useState<number | string>(issueId);
  const [prevToken, setPrevToken] = useState<string | undefined>(token);

  if (issueId !== prevIssueId || token !== prevToken) {
    setPrevIssueId(issueId);
    setPrevToken(token);
    setLoading(true);
  }

  const listRef = useRef<HTMLDivElement>(null);

  const fetchLogs = () => {
    getTaskLogs(issueId, token)
      .then((res) => {
        setLogs(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(t("comments.errorLoad", "Failed to load logbook."));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [issueId, token]);

  // Auto-scroll to bottom on logs change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, loading]);

  const handleSend = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    const costVal = cost.trim() !== "" ? parseFloat(cost) : undefined;
    const timeVal = timeSpent.trim() !== "" ? parseFloat(timeSpent) : undefined;

    try {
      await addTaskLog(
        issueId,
        {
          text: text.trim(),
          cost: costVal,
          time_spent_hours: timeVal,
        },
        token,
      );
      setText("");
      setCost("");
      setTimeSpent("");
      setSubmitting(false);
      fetchLogs();
      if (onLogAdded) {
        onLogAdded();
      }
    } catch (err) {
      console.error(err);
      alert(t("comments.errorAdd", "Failed to add log entry."));
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
    const origin = apiBase.replace(/\/api$/, "");
    return `${origin}${url}`;
  };

  return (
    <LogbookSection>
      <LogbookHeaderRow>
        <LogbookTitle>{t("logbook.title", "LOGBOOK & TIMELINE")}</LogbookTitle>
        {loading && <CircularProgress size={16} sx={{ color: "var(--primary)" }} />}
      </LogbookHeaderRow>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && logs.length === 0 ? (
        <EmptyLogbookState>{t("logbook.noLogs", "No activity or logs recorded yet.")}</EmptyLogbookState>
      ) : (
        <LogbookList ref={listRef}>
          {logs.map((log) => {
            const hasCost = log.cost !== null && log.cost !== undefined && parseFloat(String(log.cost)) > 0;
            const hasTime = log.time_spent_hours !== null && log.time_spent_hours !== undefined && parseFloat(String(log.time_spent_hours)) > 0;
            const hasMetrics = hasCost || hasTime;

            return (
              <LogBubble key={log.id} $hasMetrics={hasMetrics}>
                <LogHeader>
                  <LogAuthor $role={log.role}>
                    {log.role === "manager"
                      ? t("comments.managerRole", "Manager")
                      : t("comments.operatorRole", "Operator")}{" "}
                    ({log.author_name})
                  </LogAuthor>
                  <LogTime>{formatLogDate(log.created_at)}</LogTime>
                </LogHeader>
                <LogBody>
                  <LogText>{log.text}</LogText>
                  
                  {log.image && (
                    <LogAttachment
                      src={getImageUrl(log.image)}
                      alt="Log evidence"
                      data-testid={`log-attachment-${log.id}`}
                      onClick={() => setLightboxImage(getImageUrl(log.image))}
                    />
                  )}

                  {hasMetrics && (
                    <LogMetricsContainer>
                      {hasCost && (
                        <MetricPill $type="cost" data-testid={`log-cost-${log.id}`}>
                          <AttachMoneyIcon sx={{ fontSize: "0.85rem" }} />
                          {parseFloat(String(log.cost)).toFixed(2)} €
                        </MetricPill>
                      )}
                      {hasTime && (
                        <MetricPill $type="time" data-testid={`log-time-${log.id}`}>
                          <AccessTimeIcon sx={{ fontSize: "0.85rem" }} />
                          {parseFloat(String(log.time_spent_hours)).toFixed(1)} h
                        </MetricPill>
                      )}
                    </LogMetricsContainer>
                  )}
                </LogBody>
              </LogBubble>
            );
          })}
        </LogbookList>
      )}

      {!disabled && (
        <LogInputContainer>
          <MetricsInputRow>
            <MetricFieldWrapper>
              <AttachMoneyIcon sx={{ fontSize: "1rem" }} />
              <span>{t("logbook.costLabel", "Cost (€)")}:</span>
              <StyledMetricInput
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                disabled={submitting}
                data-testid="log-cost-input"
              />
            </MetricFieldWrapper>
            <MetricFieldWrapper style={{ marginLeft: "12px" }}>
              <AccessTimeIcon sx={{ fontSize: "1rem" }} />
              <span>{t("logbook.timeLabel", "Time (Hours)")}:</span>
              <StyledMetricInput
                type="number"
                placeholder="0.0"
                step="0.1"
                min="0"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                disabled={submitting}
                data-testid="log-time-input"
              />
            </MetricFieldWrapper>
          </MetricsInputRow>

          <LogInputRow>
            <StyledTextArea
              placeholder={t("logbook.placeholder", "Add an update comment...")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              rows={1}
              data-testid="log-text-input"
            />
            <LogSubmitButton
              onClick={handleSend}
              disabled={submitting || !text.trim()}
              data-testid="log-submit-btn"
            >
              {submitting ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                <SendIcon sx={{ fontSize: "1.1rem" }} />
              )}
            </LogSubmitButton>
          </LogInputRow>
        </LogInputContainer>
      )}

      {lightboxImage && (
        <LightboxOverlay
          onClick={() => setLightboxImage(null)}
          data-testid="lightbox-overlay"
        >
          <LightboxImage src={lightboxImage} alt="Fullscreen Preview" />
          <LightboxCloseButton onClick={() => setLightboxImage(null)}>
            &times;
          </LightboxCloseButton>
        </LightboxOverlay>
      )}
    </LogbookSection>
  );
};
