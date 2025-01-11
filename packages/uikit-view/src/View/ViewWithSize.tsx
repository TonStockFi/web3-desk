import { ReactNode, useEffect, useRef, useState } from 'react';
import { View } from '.';
import { ViewProps } from './types';

interface ViewWithSizeProps extends ViewProps {
    children: ReactNode;
    onChangeSize?: (size: { width: number; height: number }) => void;
}

export function ViewWithSize({ onChangeSize, children, ...props }: ViewWithSizeProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setSize({ width, height });
                onChangeSize && onChangeSize({ width, height });
            }
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.unobserve(element);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <View {...props} ref={ref}>
            {size.height === 0 || size.width === 0 ? null : children}
        </View>
    );
}
