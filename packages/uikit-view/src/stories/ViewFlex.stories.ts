import type { Meta, StoryObj } from '@storybook/react';
import ViewFlex from './ViewFlex';

const meta = {
    title: 'Components/ViewFlex',
    component: ViewFlex,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
    argTypes: {},
    args: {}
} satisfies Meta<typeof ViewFlex>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Row: Story = {
    args: {
        row: true
    }
};

export const Column: Story = {
    args: {
        row: false
    }
};
