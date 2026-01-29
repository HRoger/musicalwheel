import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';
import { WorkHoursAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';

registerBlockType<WorkHoursAttributes>('voxel-fse/work-hours', {
  title: __('Work Hours (VX)', 'voxel-fse'),
  description: __('Display work hours for a business', 'voxel-fse'),
  category: 'voxel-fse',
  icon: VoxelGridIcon,
  keywords: [
    __('work hours', 'voxel-fse'),
    __('business hours', 'voxel-fse'),
    __('schedule', 'voxel-fse'),
  ],
  supports: {
    html: false,
    align: false,
    className: true,
    customClassName: true,
  },
  edit: Edit,
  save: save,
});
