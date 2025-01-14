import Tab from '@web3-explorer/uikit-mui/dist/mui/Tab';
import Tabs from '@web3-explorer/uikit-mui/dist/mui/Tabs';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { CSSProperties } from 'react';

export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    style?: CSSProperties;
}

export function TabPanelView(props: TabPanelProps) {
    const { children, style, value, index, ...other } = props;
    return (
        <View
            w100p
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            sx={style}
            {...other}
        >
            {value === index && children}
        </View>
    );
}

export function a11yProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`
    };
}

export interface TabItem {
    id?: string | number;
    title: string;
    icon?: React.ReactElement<unknown>;
    props?: any;
    disabled?: boolean;
    node?: React.ElementType | React.ReactNode;
}

export default function ({
    tabs,
    topTabStyle,
    panelStyle,
    isVertical,
    currentTabIndex,
    scrollable,
    tabsSx,
    onChangeTabIndex
}: {
    scrollable?: boolean;
    tabsSx?: any;
    isVertical?: boolean;
    panelStyle?: CSSProperties;
    topTabStyle?: CSSProperties;
    tabs: TabItem[];
    currentTabIndex: number;
    onChangeTabIndex: (index: number) => void;
}) {
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        onChangeTabIndex(newValue);
    };
    return (
        <View w100p h100p row={isVertical}>
            <View empty={isVertical} w100p>
                <Tabs
                    orientation={isVertical ? 'vertical' : undefined}
                    value={currentTabIndex}
                    onChange={handleChange}
                    aria-label=""
                    variant={scrollable ? 'scrollable' : undefined}
                    scrollButtons={scrollable ? 'auto' : undefined}
                    sx={{
                        borderBottom: !isVertical ? 1 : 0,
                        borderRight: isVertical ? 1 : 0,
                        borderColor: 'divider',
                        ...tabsSx
                    }}
                >
                    {tabs.map((tab: TabItem, index: number) => (
                        <Tab
                            icon={tab.icon}
                            disabled={!!tab.disabled}
                            key={index}
                            label={<View text={tab.title}></View>}
                            {...a11yProps(index)}
                            sx={topTabStyle}
                        />
                    ))}
                </Tabs>
            </View>
            {tabs.map((tab: TabItem, index: number) => {
                if (!tab.node) {
                    return null;
                }
                const NodeType = tab.node as React.ElementType;
                return (
                    <TabPanelView
                        key={index}
                        value={currentTabIndex}
                        index={Number(index)}
                        style={{ ...panelStyle }}
                    >
                        {React.isValidElement(tab.node) ? tab.node : <NodeType {...tab.props} />}
                    </TabPanelView>
                );
            })}
        </View>
    );
}
