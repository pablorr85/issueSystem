const fs = require('fs');

// 1. OperatorHubView.tsx
let pathOp = '\\\\wsl.localhost\\Ubuntu\\home\\pablo\\issueSystem\\frontend\\src\\views\\OperatorHubView.tsx';
let contentOp = fs.readFileSync(pathOp, 'utf8');
if (!contentOp.includes('ThemeToggle')) {
  contentOp = contentOp.replace(
    'import type { OperatorTask } from "../services/types";',
    'import type { OperatorTask } from "../services/types";\nimport { ThemeToggle } from "../components/ThemeToggle";'
  );
  contentOp = contentOp.replace('BrandHeader,', 'BrandHeader,\n  HeaderContent,');
  contentOp = contentOp.replace(
    '<BrandHeader>',
    '<BrandHeader>\n        <HeaderContent>'
  );
  contentOp = contentOp.replace(
    '</Subtitle>\n          </div>\n        </BrandHeader>',
    '</Subtitle>\n          </div>\n        </HeaderContent>\n        <ThemeToggle showLabel={false} />\n      </BrandHeader>'
  );
  fs.writeFileSync(pathOp, contentOp, 'utf8');
  console.log('Updated OperatorHubView.tsx');
}

// 2. BacklogView.tsx
let pathBacklog = '\\\\wsl.localhost\\Ubuntu\\home\\pablo\\issueSystem\\frontend\\src\\views\\BacklogView\\BacklogView.tsx';
let contentBacklog = fs.readFileSync(pathBacklog, 'utf8');
if (!contentBacklog.includes('ThemeToggle')) {
  contentBacklog = contentBacklog.replace(
    "import { NavContainer, NavLinkButton } from './BacklogView.styles';",
    "import { NavContainer, NavLinksGroup, NavLinkButton } from './BacklogView.styles';\nimport { ThemeToggle } from '../../components/ThemeToggle';"
  );
  contentBacklog = contentBacklog.replace(
    '<NavContainer>',
    '<NavContainer>\n        <NavLinksGroup>'
  );
  contentBacklog = contentBacklog.replace(
    '</NavLinkButton>\n        </NavContainer>',
    '</NavLinkButton>\n        </NavLinksGroup>\n        <ThemeToggle />\n      </NavContainer>'
  );
  fs.writeFileSync(pathBacklog, contentBacklog, 'utf8');
  console.log('Updated BacklogView.tsx');
}

// 3. BoardView.tsx
let pathBoard = '\\\\wsl.localhost\\Ubuntu\\home\\pablo\\issueSystem\\frontend\\src\\views\\BoardView\\BoardView.tsx';
let contentBoard = fs.readFileSync(pathBoard, 'utf8');
if (!contentBoard.includes('ThemeToggle')) {
  contentBoard = contentBoard.replace(
    '  NavContainer,',
    '  NavContainer,\n  NavLinksGroup,'
  );
  contentBoard = contentBoard.replace(
    "import type { TenantConfig, Issue, Operator } from '../../services/types';",
    "import type { TenantConfig, Issue, Operator } from '../../services/types';\nimport { ThemeToggle } from '../../components/ThemeToggle';"
  );
  contentBoard = contentBoard.replace(
    '<NavContainer>',
    '<NavContainer>\n        <NavLinksGroup>'
  );
  contentBoard = contentBoard.replace(
    '</NavLinkButton>\n        </NavContainer>',
    '</NavLinkButton>\n        </NavLinksGroup>\n        <ThemeToggle />\n      </NavContainer>'
  );
  fs.writeFileSync(pathBoard, contentBoard, 'utf8');
  console.log('Updated BoardView.tsx');
}

// 4. DashboardStatsView.tsx
let pathStats = '\\\\wsl.localhost\\Ubuntu\\home\\pablo\\issueSystem\\frontend\\src\\views\\DashboardStatsView.tsx';
let contentStats = fs.readFileSync(pathStats, 'utf8');
if (!contentStats.includes('ThemeToggle')) {
  contentStats = contentStats.replace(
    "import { ShareQRSection } from '../components/ShareQRSection/ShareQRSection';",
    "import { ShareQRSection } from '../components/ShareQRSection/ShareQRSection';\nimport { ThemeToggle } from '../components/ThemeToggle';"
  );
  contentStats = contentStats.replace(
    '<NavContainer>',
    '<NavContainer>\n        <NavLinksGroup>'
  );
  contentStats = contentStats.replace(
    '</NavLinkButton>\n        </NavContainer>',
    '</NavLinkButton>\n        </NavLinksGroup>\n        <ThemeToggle />\n      </NavContainer>'
  );
  fs.writeFileSync(pathStats, contentStats, 'utf8');
  console.log('Updated DashboardStatsView.tsx');
}
