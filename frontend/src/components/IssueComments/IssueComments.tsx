import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { getIssueComments, addIssueComment } from "../../services/api";
import type { IssueComment } from "../../services/types";
import {
  CommentsSection,
  CommentsHeaderRow,
  CommentsTitle,
  CommentsList,
  CommentBubble,
  CommentHeader,
  CommentAuthor,
  CommentTime,
  CommentText,
  CommentInputContainer,
  QuickActionButtonContainer,
  QuickBlockButton,
  CommentInputRow,
  StyledTextArea,
  CommentSubmitButton,
  EmptyCommentsState,
  ErrorMessage,
} from "./IssueComments.styles";

export interface IssueCommentsProps {
  issueId: number;
  token?: string;
  showQuickBlock?: boolean;
  onStatusChange?: (newStatus: "pending" | "in_progress" | "resolved" | "blocked") => Promise<void> | void;
  disabled?: boolean;
}

const formatCommentDate = (dateString: string) => {
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

export const IssueComments: React.FC<IssueCommentsProps> = ({
  issueId,
  token,
  showQuickBlock = false,
  onStatusChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>("");

  const [prevIssueId, setPrevIssueId] = useState<number | string>(issueId);
  const [prevToken, setPrevToken] = useState<string>(token);

  if (issueId !== prevIssueId || token !== prevToken) {
    setPrevIssueId(issueId);
    setPrevToken(token);
    setLoading(true);
  }

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    getIssueComments(issueId, token)
      .then((res) => {
        if (!active) return;
        setComments(res);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError(t("comments.errorLoad"));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [issueId, token, t]);

  // Auto-scroll to bottom on comments change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments, loading]);

  const handleSend = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const newComment = await addIssueComment(issueId, text, token);
      setComments((prev) => [...prev, newComment]);
      setText("");
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      alert(t("comments.errorAdd"));
      setSubmitting(false);
    }
  };

  const handleQuickBlock = async () => {
    if (submitting || disabled) return;
    setSubmitting(true);
    setError(null);

    const blockMsg = t("comments.blockCommentText");

    try {
      // 1. Post comment
      const newComment = await addIssueComment(issueId, blockMsg, token);
      setComments((prev) => [...prev, newComment]);

      // 2. Change status
      if (onStatusChange) {
        await onStatusChange("blocked");
      }
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      alert(t("comments.errorAdd"));
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderCommentText = (comment: IssueComment) => {
    if (!comment.is_system_log) {
      return comment.comment_text;
    }

    // Check if it's a reassignment message
    // "Task reassigned from {old_name} to {new_name}"
    const reassignMatch = comment.comment_text.match(/Task reassigned from (.+?) to (.+)/i);
    if (reassignMatch) {
      const oldName = reassignMatch[1];
      const newName = reassignMatch[2];
      return t("comments.systemLog.reassigned", {
        old: oldName === 'Unassigned' ? t('comments.unassigned', 'Sin asignar') : oldName,
        new: newName === 'Unassigned' ? t('comments.unassigned', 'Sin asignar') : newName,
        defaultValue: `Tarea reasignada de ${oldName} a ${newName}`
      });
    }

    // Check if it's a status change message
    // "Status changed from {old_status_disp} to {new_status_disp}"
    const statusMatch = comment.comment_text.match(/Status changed from (.+?) to (.+)/i);
    if (statusMatch) {
      const oldStatus = statusMatch[1];
      const newStatus = statusMatch[2];

      const translateStatus = (statusStr: string) => {
        const s = statusStr.toLowerCase().trim();
        if (s === 'pending') return t('dashboard.actionPending', 'Pendiente');
        if (s === 'in progress') return t('dashboard.actionInProgress', 'En progreso');
        if (s === 'blocked') return t('dashboard.statusBlocked', 'Bloqueado');
        if (s === 'resolved') return t('dashboard.actionResolved', 'Resuelto');
        if (s === 'wont fix') return t('dashboard.actionWontFix', 'Desestimado');
        return statusStr;
      };

      return t("comments.systemLog.statusChanged", {
        old: translateStatus(oldStatus),
        new: translateStatus(newStatus),
        defaultValue: `Estado cambiado de ${oldStatus} a ${newStatus}`
      });
    }

    return comment.comment_text;
  };

  return (
    <CommentsSection>
      <CommentsHeaderRow>
        <CommentsTitle>{t("comments.title")}</CommentsTitle>
        {loading && <CircularProgress size={16} sx={{ color: "var(--primary)" }} />}
      </CommentsHeaderRow>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && comments.length === 0 ? (
        <EmptyCommentsState>{t("comments.noComments")}</EmptyCommentsState>
      ) : (
        <CommentsList ref={listRef}>
          {comments.map((comment) => (
            <CommentBubble key={comment.id} $isSystem={comment.is_system_log}>
              <CommentHeader>
                <CommentAuthor $role={comment.role}>
                  {comment.is_system_log
                    ? t("comments.systemRole")
                    : comment.role === "manager"
                      ? t("comments.managerRole")
                      : t("comments.operatorRole")}{" "}
                  ({comment.author_name})
                </CommentAuthor>
                <CommentTime>{formatCommentDate(comment.created_at)}</CommentTime>
              </CommentHeader>
              <CommentText>{renderCommentText(comment)}</CommentText>
            </CommentBubble>
          ))}
        </CommentsList>
      )}

      {!disabled && (
        <CommentInputContainer>
          {showQuickBlock && onStatusChange && (
            <QuickActionButtonContainer>
              <QuickBlockButton
                variant="outlined"
                onClick={handleQuickBlock}
                disabled={submitting}
                data-testid="quick-block-btn"
              >
                {t("comments.quickBlock")}
              </QuickBlockButton>
            </QuickActionButtonContainer>
          )}

          <CommentInputRow>
            <StyledTextArea
              placeholder={t("comments.placeholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              rows={1}
            />
            <CommentSubmitButton
              onClick={handleSend}
              disabled={!text.trim() || submitting}
              data-testid="submit-comment-btn"
            >
              <SendIcon sx={{ fontSize: "1.1rem" }} />
            </CommentSubmitButton>
          </CommentInputRow>
        </CommentInputContainer>
      )}
    </CommentsSection>
  );
};
