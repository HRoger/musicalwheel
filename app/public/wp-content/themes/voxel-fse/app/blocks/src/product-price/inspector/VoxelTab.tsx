
import { VoxelTab } from '@shared/controls';
import type { ProductPriceAttributes } from '../types';

interface VoxelTabProps {
    attributes: ProductPriceAttributes;
    setAttributes: (attrs: Partial<ProductPriceAttributes>) => void;
}

export default function VoxelTabWrapper(props: VoxelTabProps) {
    return <VoxelTab {...props} />;
}
