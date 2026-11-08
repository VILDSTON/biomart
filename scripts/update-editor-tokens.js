const fs = require('fs');
const path = require('path');

const editorPath = path.join(__dirname, '..', 'components', 'StorefrontDesignEditor.tsx');
let code = fs.readFileSync(editorPath, 'utf8');

// Replace card backgrounds and borders with theme variables
code = code.split('className="bg-white rounded-[14px] border border-[#E7E4DC]').join('className="bg-surface rounded-[14px] border border-border');
code = code.split('text-[#1A1A1A]').join('text-content-primary');
code = code.split('text-[#6B6B66]').join('text-content-secondary');
code = code.split('border-[#E7E4DC]').join('border-border');
code = code.split('bg-[#F7F6F2]').join('bg-page');
code = code.split('hover:bg-[#F7F6F2]').join('hover:bg-surface-soft');
code = code.split('bg-white hover:border-brand').join('bg-surface hover:border-brand');
code = code.split('bg-white text-content-primary').join('bg-surface text-content-primary');

// Replace remaining hardcoded bg-white on controls/cards
code = code.split('border-border bg-white').join('border-border bg-surface');
code = code.split('bg-white border-border').join('bg-surface border-border');
code = code.split('bg-white rounded-').join('bg-surface rounded-');

fs.writeFileSync(editorPath, code, 'utf8');
console.log('StorefrontDesignEditor.tsx tokens updated successfully!');

// Also update app/dashboard/page.tsx for container width and tokens
const dashboardPath = path.join(__dirname, '..', 'app', 'dashboard', 'page.tsx');
let dashCode = fs.readFileSync(dashboardPath, 'utf8');

dashCode = dashCode.split('<div className="min-h-screen bg-[#F7F6F2] text-[#1A1A1A]">').join('<div className="min-h-screen bg-page text-content-primary">');
dashCode = dashCode.split('<main className="max-w-3xl mx-auto min-h-screen bg-[#F7F6F2] flex flex-col border-x border-[#E7E4DC]">').join(
  '<main className={`mx-auto min-h-screen bg-page flex flex-col border-x border-border ${activeTab === \'branding\' || activeTab === \'design\' ? \'max-w-6xl\' : \'max-w-3xl\'}`}>\n'
);
dashCode = dashCode.split('header className="bg-[#FFFFFF] text-[#1A1A1A] border-b border-[#E7E4DC]').join(
  'header className="bg-surface text-content-primary border-b border-border'
);

fs.writeFileSync(dashboardPath, dashCode, 'utf8');
console.log('app/dashboard/page.tsx tokens updated successfully!');
