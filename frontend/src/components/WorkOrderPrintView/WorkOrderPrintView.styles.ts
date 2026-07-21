import styled from 'styled-components';

export const PrintOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;

  @media print {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    background-color: #ffffff !important;
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    inset: auto !important;
    display: block !important;
    overflow: visible !important;
    z-index: 999999 !important;
  }
`;

export const PrintContainer = styled.div`
  background: #ffffff;
  color: #000000;
  width: 100%;
  max-width: 800px;
  min-height: 1000px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media print {
    position: relative !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
    background: #ffffff !important;
    color: #000000 !important;
  }
`;

export const PrintHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #000000;
  padding-bottom: 16px;
  margin-bottom: 24px;

  @media print {
    padding-bottom: 8px;
    margin-bottom: 14px;
  }
`;

export const HeaderTitle = styled.div`
  h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #111827;
  }
  span {
    font-size: 0.9rem;
    color: #4b5563;
    font-weight: 600;
  }
`;

export const HeaderMeta = styled.div`
  text-align: right;
  div {
    font-size: 0.9rem;
    color: #374151;
    margin-bottom: 4px;
  }
  strong {
    color: #111827;
  }
`;

export const SectionBox = styled.section`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;

  @media print {
    padding: 10px 14px;
    margin-bottom: 12px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #1f2937;
  margin: 0 0 12px 0;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 6px;
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
`;

export const DetailItem = styled.div`
  font-size: 0.9rem;
  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 4px;
  }
  span {
    font-weight: 600;
    color: #111827;
  }
`;

export const TaskDescriptionText = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  color: #1f2937;
  white-space: pre-wrap;
  margin: 0;
`;

export const ChecklistContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #1f2937;
`;

export const CheckboxSquare = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #374151;
  border-radius: 4px;
  flex-shrink: 0;
`;

export const SignatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 40px;
  padding-top: 20px;

  @media print {
    margin-top: 20px;
    padding-top: 10px;
    gap: 30px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;

export const SignatureBox = styled.div`
  border-top: 1px solid #374151;
  padding-top: 8px;
  text-align: center;
  span {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #4b5563;
  }
`;

export const PrintActionHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 16px;

  @media print {
    display: none !important;
  }
`;

export const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid ${({ $primary }) => ($primary ? 'var(--primary, #2563eb)' : '#d1d5db')};
  background: ${({ $primary }) => ($primary ? 'var(--primary, #2563eb)' : '#ffffff')};
  color: ${({ $primary }) => ($primary ? '#ffffff' : '#374151')};
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
  }
`;
