# Conversion Scripts

## WordPress to Next.js Block Converter

Automatically converts WordPress FSE blocks (Option C+) to Next.js block renderers.

### Prerequisites

- All 34 WordPress FSE blocks completed
- Voxel REST API endpoints functional
- Next.js project structure exists at `apps/musicalwheel-frontend`

### Installation

```bash
# Install required dependency
npm install glob
```

### Usage

**Convert all blocks:**
```bash
npx tsx scripts/convert-blocks-to-nextjs.ts
```

**Convert specific blocks:**
```bash
npx tsx scripts/convert-blocks-to-nextjs.ts --blocks search-form,create-post,popup-kit
```

**Dry run (preview without writing files):**
```bash
npx tsx scripts/convert-blocks-to-nextjs.ts --dry-run
```

### What It Does

1. **Discovers** all WordPress blocks in `themes/voxel-fse/app/blocks/src/`
2. **Analyzes** each block:
   - Reads `block.json` for attributes
   - Parses `edit.tsx` for components used
   - Extracts data attributes from `save.tsx`
   - Detects custom hooks
3. **Generates** Next.js files:
   - `[BlockName]Block.tsx` - Main component
   - `useVoxelXxx.ts` - Translated hooks (if needed)
   - TypeScript interfaces
   - Hydration parse functions
4. **Creates** block registry at `components/blocks/index.ts`

### Output Structure

```
apps/musicalwheel-frontend/
├── components/blocks/
│   ├── SearchFormBlock.tsx         ✅ Generated
│   ├── CreatePostBlock.tsx         ✅ Generated
│   ├── PopupKitBlock.tsx          ✅ Generated
│   ├── ... (31 more)
│   └── index.ts                    ✅ Block registry
│
└── lib/hooks/
    ├── useVoxelFilters.ts         ✅ Generated
    ├── useVoxelFields.ts          ✅ Generated
    └── ...
```

### Generated Component Example

```tsx
// apps/musicalwheel-frontend/components/blocks/SearchFormBlock.tsx

'use client';
import { useState, useEffect } from 'react';
import { useVoxelFilters } from '@/lib/hooks/useVoxelFilters';

export interface SearchFormBlockProps {
  postType: string;
  enabledFilters: string[];
  placeholder?: string;
}

export default function SearchFormBlock(props: SearchFormBlockProps) {
  const { data, isLoading, error } = useVoxelFilters(props.postType);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <form className="search-form-block">
      {/* Component implementation */}
    </form>
  );
}

export function parseSearchFormProps(element: HTMLElement): SearchFormBlockProps {
  return {
    postType: element.dataset.postType || '',
    enabledFilters: JSON.parse(element.dataset.enabledFilters || '[]'),
    placeholder: element.dataset.placeholder,
  };
}
```

### After Conversion

**Manual review required:**

1. **Test compilation:**
   ```bash
   cd apps/musicalwheel-frontend
   npm run build
   ```

2. **Review each component:**
   - Check TypeScript errors
   - Verify data fetching works
   - Adjust styling (Tailwind classes)
   - Add error handling
   - Test loading states

3. **Test with dev server:**
   ```bash
   npm run dev
   open http://localhost:3000/test/blocks
   ```

4. **Fix common issues:**
   - Missing imports
   - Incorrect API endpoints
   - Missing error handling
   - Styling adjustments

### Expected Results

| Tier | Blocks | Accuracy | Review Time |
|------|--------|----------|-------------|
| 1 (Simple) | 10 | 90-95% | 15 min each |
| 2 (Medium) | 15 | 80-85% | 30-60 min each |
| 3 (Complex) | 6 | 70-75% | 1-2 hours each |

**Total time savings: ~1 week (25% faster than manual)**

### Configuration

Edit script configuration at the top of `convert-blocks-to-nextjs.ts`:

```typescript
const CONFIG = {
  wordpressBlocksPath: 'themes/voxel-fse/app/blocks/src',
  nextjsOutputPath: 'apps/musicalwheel-frontend/components/blocks',
  nextjsHooksPath: 'apps/musicalwheel-frontend/lib/hooks',
  wpApiUrl: 'https://wp.musicalwheel.com/wp-json',
};
```

### Troubleshooting

**Error: "Cannot find module 'glob'"**
```bash
npm install glob
```

**Error: "block.json not found"**
- Ensure WordPress blocks are in correct path
- Check `wordpressBlocksPath` in CONFIG

**TypeScript errors in generated files:**
- Review component manually
- Add missing imports
- Fix type mismatches

**Components not rendering:**
- Check API endpoint URLs
- Verify Voxel REST API is accessible
- Check CORS settings

### More Information

See full documentation: `docs/conversions/ai-assisted-batch-conversion.md`
