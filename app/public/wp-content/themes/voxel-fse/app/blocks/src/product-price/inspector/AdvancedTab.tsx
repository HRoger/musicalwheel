
import { AdvancedTab } from '@shared/controls';
import type { ProductPriceAttributes } from '../types';

interface AdvancedTabProps {
    attributes: ProductPriceAttributes;
    setAttributes: (attrs: Partial<ProductPriceAttributes>) => void;
}

export default function AdvancedTabWrapper(props: AdvancedTabProps) {
    return <AdvancedTab {...props} />;
}
