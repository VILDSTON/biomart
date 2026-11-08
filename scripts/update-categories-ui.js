const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add BioMartLogo import
if (!content.includes('BioMartLogo')) {
  content = content.replace(
    "import { StorefrontDesignEditor } from '@/components/StorefrontDesignEditor';",
    "import { StorefrontDesignEditor } from '@/components/StorefrontDesignEditor';\nimport { BioMartLogo } from '@/components/BioMartLogo';"
  );
}

// 2. Destructure category methods
if (!content.includes('addShopCategory,')) {
  content = content.replace(
    'updateShopOrderStatus,',
    'updateShopOrderStatus,\n    addShopCategory,\n    deleteShopCategory,'
  );
}

// 3. Add category states if not present
if (!content.includes('newCategoryInput')) {
  const target = 'const [editingProduct, setEditingProduct] = useState<Product | null>(null);';
  const addition = `const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    const cat = addShopCategory(activeSlug, newCategoryInput.trim());
    setNewCategoryInput('');
    showToast(\`Категория «\${cat.name}» создана\`);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (catId === 'cat-all') return;
    deleteShopCategory(activeSlug, catId);
    showToast(\`Категория «\${catName}» удалена\`);
  };
`;
  content = content.replace(target, addition + '\n  ' + target);
}

// 4. Update Header with BioMartLogo and Verified badge
const oldHeaderTitle = `<h1 className="text-sm font-semibold tracking-tight leading-none text-content-primary">
                  {settings.store_name}
                </h1>`;

const newHeaderTitle = `<BioMartLogo className="w-4 h-4 shrink-0" color="#1F7A5A" />
                <h1 className="text-sm font-semibold tracking-tight leading-none text-content-primary">
                  {settings.store_name}
                </h1>
                <span
                  title="Официально подтвержденный продавец платформы BioMart.uz"
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-brand-soft text-brand text-[9px] font-semibold border border-brand-border shrink-0 select-none shadow-2xs"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>подтверждено BioMart</span>
                </span>`;

content = content.replace(oldHeaderTitle, newHeaderTitle);

// 5. Add Category Management UI into Products Tab
const catUiBlock = `
              {/* Category Management Block */}
              <div className="bg-surface rounded-[12px] border border-border p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#1F7A5A]" />
                    <h3 className="text-xs font-semibold text-content-primary">Категории витрины ({categories.filter(c => c.slug !== 'all').length})</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManagingCategories(!isManagingCategories)}
                    className="text-[11px] font-medium text-[#1F7A5A] hover:underline"
                  >
                    {isManagingCategories ? 'Свернуть' : '+ Добавить категорию'}
                  </button>
                </div>

                {/* Categories Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {categories.map((c) => {
                    const count = c.slug === 'all' ? products.length : products.filter(p => p.category_id === c.id).length;
                    return (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-page border border-border text-xs text-content-primary"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-[10px] text-content-secondary font-mono">({count})</span>
                        {c.slug !== 'all' && categories.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id, c.name)}
                            className="text-content-secondary hover:text-red-600 transition-colors ml-0.5"
                            title="Удалить категорию"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                {/* Add Category Form */}
                {isManagingCategories && (
                  <form onSubmit={handleAddCategory} className="flex gap-2 pt-2 border-t border-border">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="Название новой категории (например: Очки, Ремни...)"
                      className="flex-1 px-3 py-1.5 bg-page border border-border rounded-[8px] text-xs text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-[#1F7A5A]"
                    />
                    <button
                      type="submit"
                      disabled={!newCategoryInput.trim()}
                      className="px-3.5 py-1.5 bg-[#1F7A5A] hover:bg-[#17634A] text-white text-xs font-semibold rounded-[8px] transition-colors disabled:opacity-40"
                    >
                      Создать
                    </button>
                  </form>
                )}
              </div>
`;

if (!content.includes('Категории витрины')) {
  content = content.replace(
    '{/* Product Limit Indicator */}',
    catUiBlock + '\n              {/* Product Limit Indicator */}'
  );
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Categories UI and BioMartLogo integrated into dashboard successfully!');
