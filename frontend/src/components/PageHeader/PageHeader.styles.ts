import styled from 'styled-components';

export const HeaderContainer = styled.header`
  text-align: center;
  margin-bottom: 40px;
  position: relative;
`;

export const HeaderTopRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
`;

export const HeaderTitle = styled.h1`
  margin: 0 0 10px 0;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, var(--text-primary) 30%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const HeaderSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
`;
