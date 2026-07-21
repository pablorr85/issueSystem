import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Alert, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getIssue, getOperatorTask } from '../services/api';
import type { Issue, OperatorTask } from '../services/types';
import { WorkOrderPrintView } from '../components/WorkOrderPrintView';

export const WorkOrderPrintPageView: React.FC = () => {
  const { id: paramId, secure_token: pathToken } = useParams<{ id?: string; secure_token?: string }>();
  const [searchParams] = useSearchParams();
  const token = pathToken || searchParams.get('token') || '';
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [issueData, setIssueData] = useState<Issue | OperatorTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (token) {
          const res = await getOperatorTask(token);
          if (isMounted) setIssueData(res);
        } else if (paramId && !isNaN(Number(paramId))) {
          const res = await getIssue(Number(paramId));
          if (isMounted) setIssueData(res);
        } else {
          if (isMounted) setError(t('workOrder.notFound', 'Work Order not found or invalid ID.'));
        }
      } catch (err) {
        console.error('Error fetching work order:', err);
        if (isMounted) setError(t('workOrder.fetchError', 'Failed to load Work Order data.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [paramId, token, t]);

  if (loading) {
    return (
      <Container style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: 'var(--primary)' }} />
      </Container>
    );
  }

  if (error || !issueData) {
    return (
      <Container style={{ padding: '40px', maxWidth: '600px' }}>
        <Alert severity="error">{error || t('workOrder.notFound', 'Work Order not found.')}</Alert>
      </Container>
    );
  }

  return (
    <WorkOrderPrintView
      issue={issueData}
      tenantName={'tenant_name' in issueData ? issueData.tenant_name : undefined}
      onClose={() => navigate(-1)}
    />
  );
};

export default WorkOrderPrintPageView;
