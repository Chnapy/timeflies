import { Meta } from '@storybook/react/types-6-0';
import { Demo as InnerDemo } from './demo';

export default {
  title: 'Demo',
} as Meta;

export const Demo = () => (
  <InnerDemo />
);
