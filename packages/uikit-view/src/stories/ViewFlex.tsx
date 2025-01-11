import React from 'react';
import { View } from '../View';

export default function({ row }: { row?: boolean }) {
    return (
        <View column={!row} row={row}>
            <View red ph8 pv8 mr12 mb12>
                {row ? 'row' : 'column'}
            </View>
            <View blue ph8 pv8 mr12 mb12>
                {row ? 'row' : 'column'}
            </View>
        </View>
    );
}
