import type { AlertColor, AlertProps } from '@web3-explorer/uikit-mui/dist/mui/Alert';
import type { AvatarProps } from '@web3-explorer/uikit-mui/dist/mui/Avatar';
import type { BoxProps } from '@web3-explorer/uikit-mui/dist/mui/Box';
import type { ButtonProps } from '@web3-explorer/uikit-mui/dist/mui/Button';
import type { CardProps } from '@web3-explorer/uikit-mui/dist/mui/Card';
import type { ChipProps } from '@web3-explorer/uikit-mui/dist/mui/Chip';
import type { CircularProgressProps } from '@web3-explorer/uikit-mui/dist/mui/CircularProgress';
import type { DialogProps } from '@web3-explorer/uikit-mui/dist/mui/Dialog';
import type { DividerProps } from '@web3-explorer/uikit-mui/dist/mui/Divider';
import type { DrawerProps } from '@web3-explorer/uikit-mui/dist/mui/Drawer';
import type { IconButtonProps } from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import type { IconList, IconProps } from '@web3-explorer/uikit-mui/dist/mui/Icons';
import type { MenuItemProps } from '@web3-explorer/uikit-mui/dist/mui/MenuItem';
import type { SkeletonProps } from '@web3-explorer/uikit-mui/dist/mui/Skeleton';
import type { SnackbarProps } from '@web3-explorer/uikit-mui/dist/mui/Snackbar';
import { SxProps, Theme } from '@web3-explorer/uikit-mui/dist/mui/system';
import type { TypographyProps } from '@web3-explorer/uikit-mui/dist/mui/Typography';
import React, { ReactNode } from 'react';

type Color = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
type ButtonColor = 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';

export interface UtilsProps {
    noTrans?:boolean,
    transX?:number,
    transY?:number,
    miniScrollBar?:boolean;
    transitionEase?:string;
    transitionTransXEase?:number;
    transitionTransYEase?:number;
    loading?:boolean;
    loadingProps?:CircularProgressProps;
    list?:boolean,
    listItemText?:string;
    listSelected?:boolean;
    listItemIcon?:React.ReactNode;
    listItemRight?:React.ReactNode;
    card?:boolean,
    cardProps?:CardProps,
    menuItem?:boolean,
    menuItemProps?:MenuItemProps,
    skeletonProps?: SkeletonProps;
    skeletonText?: boolean;
    skeletonCircular?: boolean;
    skeletonRectangular?: boolean;
    skeletonRounded?: boolean;
    alert?: AlertColor;
    alertProps?: AlertProps;
    chip?: string;
    chipColor?: Color;
    chipSize?: 'small' | 'medium';
    chipVariant?: 'filled' | 'outlined';
    chipProps?: ChipProps;
    avatar?: AvatarProps;
    borderBottomColor?: string;
    borderRadius?: number;
    borderRadiusTop?: number;
    borderRadiusBottom?: number;
    pointer?: boolean;
    hoverBgColor?: string;
    appRegionDrag?: boolean;
    borderBox?: boolean;
    breakWord?: boolean;
    preWrap?: boolean;
    bgColor?: string;
    red?: boolean;
    blue?: boolean;
    hide?: boolean;
    h100p?: boolean;
    wh100p?: boolean;
    wh?: number | string;
    h100vh?: boolean;
    w100p?: boolean;
    w100vw?: boolean;
    overflowHidden?: boolean;
    overflowYAuto?: boolean;
    overflowXAuto?: boolean;
    userSelectNone?: boolean;
    useSelectText?: boolean;
    w?: any;
    h?: any;
    x?: number;
    y?: number;
    bottom?: number;
    right?: number;
    left?: number;
    top?: number;
    xx0?: boolean;
    yy0?: boolean;
    top0?: boolean;
    bottom0?: boolean;
    left0?: boolean;
    right0?: boolean;
    opacity?: number;
    absolute?: boolean;
    abs?: boolean;
    relative?: boolean;
    absFull?: boolean;
    zIdx?: number;

    empty?: boolean;
    displayNone?: boolean;
    onClick?: (e: any) => void;
    _D?: any;
    _D0?: any;
}

export interface FlexProps {
    row?: boolean;
    rowVCenter?:boolean;
    flex1?: boolean;
    flx?: boolean;
    column?: boolean;
    center?: boolean;
    jCenter?: boolean;
    aCenter?: boolean;
    aStart?: boolean;
    aEnd?: boolean;
    jSpaceAround?: boolean;
    jSpaceBetween?: boolean;
    jStart?: boolean;
    fWrap?: boolean;
    jEnd?: boolean;
}

export interface MarginProps {
    m12?: boolean;
    ml12?: boolean;
    mt12?: boolean;
    mr12?: boolean;
    mb12?: boolean;
    mx12?: boolean;
    my12?: boolean;
    m?: any;
    mr?: number;
    ml?: number;
    mt?: number;
    mb?: number;
    mx?: number;
    my?: number;
}

export interface PaddingProps {
    p?: any;
    pr?: number;
    pl?: number;
    pt?: number;
    pb?: number;
    px?: number;
    py?: number;
    px12?: boolean;
    py12?: boolean;
    p12?: boolean;
    pl12?: boolean;
    pt12?: boolean;
    pr12?: boolean;
    pb12?: boolean;
    ph8?: boolean;
    pv8?: boolean;
}

export interface DialogViewProps {
    content: React.ReactNode;
    dialogProps: DialogProps;
}

export interface ConfirmationDialogProps {
    id?: string;
    confirming?: boolean;
    cancelTxt?: string;
    titleIcon?: any;
    title?: string;
    confirmTxt?: string;
    content: string | any;
    keepMounted?: boolean;
    open?: boolean;
    onConfirm?: () => void | Promise<void> | boolean;
    onCancel?: () => void;
}

export interface PromptProps {
    title: string;
    desc?: string;
    cancelTxt?: string;
    confirmTxt?: string;
    inputLabel?: string;
    onClose: () => void;
    onConfirm: (value: string) => Promise<boolean>;
    open?: boolean;
}

export interface ComponentsProps {
    divider?: boolean | DividerProps;
    dividerProps?: DividerProps;
    textEllipsis?: boolean;
    text?: string;
    label?: string;
    labelWidth?: number;
    textVariant?:"h1"|"h6";
    textColor?: string;
    textSmall?: boolean;
    textSmall9?: boolean;
    textFontSize?: string;
    textBold?: boolean;
    textProps?: TypographyProps;
    json?: object | Array<any> | null | undefined;
    snackbar?: SnackbarProps;
    tips?: string;
    tipsPlacement?: | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
    button?: string;
    buttonProps?: ButtonProps;
    buttonSize?: 'small' | 'medium' | 'large';
    buttonVariant?: 'text' | 'outlined' | 'contained';
    buttonContained?: boolean | string;
    buttonOutlined?: boolean | string;
    buttonEndIcon?: React.ReactNode;
    buttonColor?: ButtonColor;
    buttonStartIcon?: React.ReactNode;
    icon?: IconList | string | ReactNode;
    iconColor?: string;
    iconSmall?: boolean;
    iconFontSize?: string;
    iconProps?: IconProps;
    iconButton?: boolean | IconButtonProps;
    iconButtonColor?:string;
    iconButtonSmall?: boolean;
    iconButtonProps?: IconButtonProps;
    drawer?: DrawerProps;
    prompt?: PromptProps;
    dialog?: DialogViewProps;
    confirm?: ConfirmationDialogProps;
}

//@ts-ignore
export interface ViewProps
    extends BoxProps,
        ComponentsProps,
        UtilsProps,
        FlexProps,
        MarginProps,
        PaddingProps,
        React.HTMLProps<HTMLElement> {
    sx?: SxProps<Theme>;
}
