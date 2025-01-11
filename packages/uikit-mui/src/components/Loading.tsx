import * as React from 'react';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';

export default function Loading({
    circularProgressProps,
}: {
    circularProgressProps?: CircularProgressProps;
}) {
    return (
        <CircularProgress {...circularProgressProps} />
    );
}
