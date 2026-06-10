import '@testing-library/jest-dom';
import { vi } from 'vitest';

console.log('=== Setup Tests Loaded ===');

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'tenantForm.title': 'Load Tenant Configuration',
        'tenantForm.label': 'Tenant UUID',
        'tenantForm.placeholder': 'Enter Tenant UUID (e.g. f47ac10b-y12a...)',
        'tenantForm.button': 'Load',
        'tenantForm.loading': 'Loading...',
        'login.title': 'Employee Sign In',
        'login.usernameLabel': 'Username',
        'login.passwordLabel': 'Password',
        'login.button': 'Sign In',
        'login.loading': 'Signing In...',
        'login.errorEmpty': 'Please fill in both username and password fields.',
        'login.errorDefault': 'Invalid credentials. Please verify your username and password.',
        'dynamicIssueForm.title': 'Report an Issue ({{name}})',
        'dynamicIssueForm.descriptionLabel': 'Problem Description',
        'dynamicIssueForm.descriptionRequired': 'Description is required.',
        'dynamicIssueForm.photoLabel': 'Photo URL (Optional)',
        'dynamicIssueForm.button': 'Submit Issue',
        'dynamicIssueForm.submitting': 'Submitting...',
        'dynamicIssueForm.none': 'None',
        'dynamicIssueForm.detailsHeader': 'Tenant Specific Details',
        'dynamicIssueForm.fieldRequired': '{{name}} is required.',
        'dashboard.title': 'Tenant Manager Dashboard',
        'dashboard.statusFilterLabel': 'Status Filter',
        'dashboard.filterAll': 'All Statuses',
        'dashboard.filterOpen': 'Open',
        'dashboard.filterInProgress': 'In Progress',
        'dashboard.filterResolved': 'Resolved',
        'dashboard.tableID': 'ID',
        'dashboard.tableStatus': 'Status',
        'dashboard.tableDescription': 'Description',
        'dashboard.tableCreatedAt': 'Created At',
        'dashboard.tableActions': 'Actions',
        'dashboard.loadingIssues': 'Loading dashboard issues...',
        'dashboard.noIssuesFiltered': 'No issues reported under these criteria.',
        'dashboard.yes': 'Yes',
        'dashboard.no': 'No',
        'dashboard.actionOpen': 'open',
        'dashboard.actionInProgress': 'in progress',
        'dashboard.actionResolved': 'resolved',
        'dashboard.qrTitle': 'Share Public Reporting Form',
        'dashboard.qrDescription': 'Place this QR code on physical stickers, posters, or equipment around your site. Users can scan the QR code to instantly submit issues to your system without signing in.',
        'dashboard.copyLink': 'Copy Link',
        'dashboard.copied': 'Copied!',
        'dashboard.downloadQR': 'Download QR (PNG)',
        'dashboard.qrDownloadTaintedWarning': 'The logo image is hosted on an external server that does not allow downloads. The QR code has been downloaded successfully, but without the logo. To include the logo, please upload it to your local server or use a CORS-enabled URL.',
      };
      
      let translation = translations[key] || key;
      if (options && typeof options === 'object') {
        Object.keys(options).forEach(optKey => {
          translation = translation.replace(`{{${optKey}}}`, String(options[optKey]));
        });
      }
      console.log(`t('${key}', ${JSON.stringify(options)}) -> '${translation}'`);
      return translation;
    },
    i18n: {
      changeLanguage: vi.fn().mockResolvedValue(undefined),
    },
  }),
}));
