import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { NavContainer, NavLinkButton } from './NavigationTabs.styles';

export interface NavigationTabsProps {
  activeTab: 'dashboard' | 'backlog' | 'board';
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab }) => {
  const { t } = useTranslation();

  return (
    <NavContainer data-testid="navigation-tabs">
      <NavLinkButton to="/" $active={activeTab === 'dashboard'} data-testid="nav-tab-dashboard">
        <DashboardIcon fontSize="small" />
        {t('dashboard.dashboardTab')}
      </NavLinkButton>
      <NavLinkButton to="/backlog" $active={activeTab === 'backlog'} data-testid="nav-tab-backlog">
        <ListAltIcon fontSize="small" />
        {t('dashboard.backlogTab')}
      </NavLinkButton>
      <NavLinkButton to="/board" $active={activeTab === 'board'} data-testid="nav-tab-board">
        <ViewKanbanIcon fontSize="small" />
        {t('dashboard.boardTab')}
      </NavLinkButton>
    </NavContainer>
  );
};
