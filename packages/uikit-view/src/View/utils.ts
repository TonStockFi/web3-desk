import { SxProps, Theme } from '@web3-explorer/uikit-mui/dist/mui/system';
import { CSSProperties } from 'react';
import { ViewProps } from './types';

export function handleProps(props: ViewProps): Omit<ViewProps, 'sx'> & { sx: SxProps<Theme> } {
    let {
        miniScrollBar,
        transitionEase,
        transitionTransYEase,
        transitionTransXEase,
        borderRadius,
        borderRadiusTop,
        borderRadiusBottom,
        pointer,
        hoverBgColor,
        appRegionDrag,
        borderBottomColor,
        m,
        p,
        borderBox,
        breakWord,
        preWrap,
        sx,
        flex1,
        flx,
        bgColor,
        red,
        blue,
        row,
        rowVCenter,
        column,
        jCenter,
        displayNone,
        jStart,
        jEnd,
        jSpaceAround,
        jSpaceBetween,
        aStart,
        aEnd,
        aCenter,
        m12,
        ml12,
        mt12,
        mr12,
        mb12,
        p12,
        pl12,
        pt12,
        pr12,
        pb12,
        px12,
        py12,
        mx12,
        my12,
        ph8,
        bottom,
        right,
        left,
        top,
        bottom0,
        right0,
        left0,
        xx0,
        yy0,
        top0,
        pv8,
        w,
        h,
        wh,
        transX,
        transY,
        x,
        y,
        mx,
        px,
        my,
        py,
        mr,
        pr,
        ml,
        pl,
        mt,
        pt,
        mb,
        pb,
        fWrap,
        absolute,
        abs,
        relative,
        absFull,
        center,
        h100p,
        h100vh,
        w100p,
        wh100p,
        w100vw,
        overflowHidden,
        overflowYAuto,
        overflowXAuto,
        zIdx,
        opacity,
        userSelectNone,
        useSelectText,
        ...props_
    } = props;

    const sx_: CSSProperties = {};

    if (flx) {
        sx_.display = 'flex';
    }
    if (flex1) {
        sx_.display = 'flex';
        sx_.flex = 1;
    }
    if (row) {
        sx_.display = 'flex'; 
        sx_.flexDirection = 'row'; 
    } else if (column) {
        sx_.display = 'flex'; 
        sx_.flexDirection = 'column';
    }
    if (rowVCenter) {
        sx_.display = 'flex'; 
        sx_.flexDirection = 'row'; 
        sx_.alignItems = 'center'; 
    } 
    if(borderBottomColor){
        sx_.borderBottom = `1px solid ${borderBottomColor}`;
    }
    
    if(borderBox){
        sx_.boxSizing = 'border-box';
    }
    if(breakWord){
        sx_.wordBreak = 'break-word';
    }
    if(preWrap){
        sx_.whiteSpace = 'pre-wrap'
    }
    if(userSelectNone){
        sx_.userSelect = 'none';
    }
    if(useSelectText){
        sx_.userSelect = 'text';
    }
    if (absolute || abs) {
        sx_.position = 'absolute';
    }
    if (relative) {
        sx_.position = 'relative';
    }
    if (absFull) {
        sx_.position = 'absolute';
        sx_.left = 0;
        sx_.top = 0;
        sx_.right = 0;
        sx_.bottom = 0;
    }

    if(xx0 !== undefined){
        sx_.left = 0;
        sx_.right = 0;
    }

    if(yy0 !== undefined){
        sx_.top = 0;
        sx_.bottom = 0;
    }
    if(top0 !== undefined){
        sx_.top = 0;
    }
    if(left0 !== undefined){
        sx_.left = 0;
    }
    if(right0 !== undefined){
        sx_.right = 0;
    }
    if(bottom0 !== undefined){
        sx_.bottom = 0;
    }

    if (x !== undefined) {
        sx_.left = `${x}px`;
    }

    if (y !== undefined) {
        sx_.top = `${y}px`;
    }

    if (bottom !== undefined) {
        sx_.bottom = `${bottom}px`;
    }

    if (top !== undefined) {
        sx_.top = `${top}px`;
    }

    if (left !== undefined) {
        sx_.left = `${left}px`;
    }

    if (right !== undefined) {
        sx_.right = `${right}px`;
    }

    if (transX !== undefined) {
        sx_.transform = `translateX(${transX}px)`;
    }
    
    if (transY !== undefined) {
        sx_.transform = `translateY(${transY}px)`;
    }
    

    if (w !== undefined) {
        if (typeof w === 'string') {
            sx_.width = w;
        } else {
            sx_.width = `${w}px`;
        }
    }

    if (wh !== undefined) {
        if (typeof wh === 'string') {
            sx_.height = wh;
            sx_.width = wh;
        } else {
            sx_.height = `${wh}px`;
            sx_.width = `${wh}px`;
        }
    }

    if (h !== undefined) {
        if (typeof h === 'string') {
            sx_.height = h;
        } else {
            sx_.height = `${h}px`;
        }
    }
    if (w100p) {
        sx_.width = '100%';
    }

    if (w100vw) {
        sx_.width = '100vw';
    }
    if (h100p) {
        sx_.height = '100%';
    }
    if (h100vh) {
        sx_.height = '100vh';
    }

    if (wh100p) {
        sx_.width = sx_.height = '100%';
    }
    if (m !== undefined) {
        let margin = '';
        if (-1 === String(m).indexOf('px')) {
            margin = `${m}px`;
        } else {
            margin = String(m);
        }
        sx_.margin = margin;
    }

    if (p !== undefined) {
        let padding = '';
        if (-1 === String(p).indexOf('px')) {
            padding = `${p}px`;
        } else {
            padding = String(p);
        }
        sx_.padding = padding;
    }
    if (mx !== undefined) {
        sx_.marginLeft = `${mx}px`;
        sx_.marginRight = `${mx}px`;
    }

    if (px !== undefined) {
        sx_.paddingLeft = `${px}px`;
        sx_.paddingRight = `${px}px`;
    }

    if (my !== undefined) {
        sx_.marginTop = `${my}px`;
        sx_.marginBottom = `${my}px`;
    }

    if (py !== undefined) {
        sx_.paddingTop = `${py}px`;
        sx_.paddingBottom = `${py}px`;
    }

    if (mr !== undefined) {
        sx_.marginRight = `${mr}px`;
    }

    if (pr !== undefined) {
        sx_.paddingRight = `${pr}px`;
    }

    if (ml !== undefined) {
        sx_.marginLeft = `${ml}px`;
    }

    if (pl !== undefined) {
        sx_.paddingLeft = `${pl}px`;
    }

    if (mt !== undefined) {
        sx_.marginTop = `${mt}px`;
    }

    if (pt !== undefined) {
        sx_.paddingTop = `${pt}px`;
    }

    if (mb !== undefined) {
        sx_.marginBottom = `${mb}px`;
    }

    if (pb !== undefined) {
        sx_.paddingBottom = `${pb}px`;
    }

    if (m12) sx_.margin = '12px';
    if (ml12) sx_.marginLeft = '12px';
    if (mt12) sx_.marginTop = '12px';
    if (mr12) sx_.marginRight = '12px';
    if (mb12) sx_.marginBottom = '12px';

    if (mx12) {
        sx_.marginLeft = '12px';
        sx_.marginRight = '12px';
    }

    if (my12) {
        sx_.marginTop = '12px';
        sx_.marginBottom = '12px';
    }
    if (p12) sx_.padding = '12px';
    if (pl12) sx_.paddingLeft = '12px';
    if (pt12) sx_.paddingTop = '12px';
    if (pr12) sx_.paddingRight = '12px';
    if (pb12) sx_.paddingBottom = '12px';

    if (px12) {
        sx_.paddingLeft = '12px';
        sx_.paddingRight = '12px';
    }

    if (py12) {
        sx_.paddingBottom = '12px';
        sx_.paddingTop = '12px';
    }
    if (ph8) {
        sx_.paddingLeft = '8px';
        sx_.paddingRight = '8px';
    }
    if (pv8 !== undefined) {
        sx_.paddingTop = '8px';
        sx_.paddingBottom = '8px';
    }
    if (center) {
        sx_.display = 'flex';
        sx_.alignItems = 'center';
        sx_.justifyContent = 'center';
    }
    if (jCenter) {
        sx_.display = 'flex';
        sx_.justifyContent = 'center';
    }

    if (fWrap) {
        sx_.display = 'flex';
        sx_.flexWrap = 'wrap';
    }

    if (jStart) {
        sx_.display = 'flex';
        sx_.justifyContent = 'flex-start';
    }

    if (jEnd) {
        sx_.display = 'flex';
        sx_.justifyContent = 'flex-end';
    }

    if (jSpaceBetween) {
        sx_.display = 'flex';
        sx_.justifyContent = 'space-between';
    }

    if (jSpaceAround) {
        sx_.display = 'flex';
        sx_.justifyContent = 'space-around';
    }

    if (aStart) {
        sx_.display = 'flex';
        sx_.alignItems = 'flex-start';
    }

    if (aEnd) {
        sx_.display = 'flex';
        sx_.alignItems = 'flex-end';
    }

    if (aCenter) {
        sx_.display = 'flex';
        sx_.alignItems = 'center';
    }

    if (zIdx !== undefined) {
        sx_.zIndex = zIdx;
    }

    if (opacity !== undefined) {
        sx_.opacity = opacity;
    }

    if (overflowXAuto) {
        sx_.overflowX = 'auto';
    }
    if (overflowYAuto) {
        sx_.overflowY = 'auto';
    }

    if (overflowHidden) {
        sx_.overflow = 'hidden';
    }
    if (displayNone) {
        sx_.display = 'none';
    }
    if(transitionEase){
        sx_.transition = `${transitionEase} ease`;
    }

    if(transitionTransXEase){
        sx_.transition = `translateX ${transitionTransXEase}s ease`;
    }

    if(transitionTransYEase){
        sx_.transition = `translateY ${transitionTransYEase}s ease`;
    }
    if(borderRadius!== undefined){
        //@ts-ignore
        sx_.borderRadius = `${borderRadius}px`;
    }

    if(borderRadiusTop!== undefined){
        //@ts-ignore
        sx_.borderTopLeftRadius = `${borderRadiusTop}px`;
        sx_.borderTopRightRadius = `${borderRadiusTop}px`;
    }

    if(borderRadiusBottom!== undefined){
        //@ts-ignore
        sx_.borderBottomLeftRadius = `${borderRadiusBottom}px`;
        sx_.borderBottomRightRadius = `${borderRadiusBottom}px`;
    }

    if(miniScrollBar!== undefined){
        //@ts-ignore
        sx_['&::-webkit-scrollbar'] = {
            height: 1
        };
        //@ts-ignore
        sx_['&::-webkit-scrollbar-thumb'] = {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 2
        };
    }
    if(pointer){
        //@ts-ignore
        sx_.cursor = "pointer"
    }
    if (!sx) {
        sx = {};
    }

    if (bgColor) {
        //@ts-ignore
        sx.bgcolor = bgColor;
    }

    if (red) {
        //@ts-ignore
        sx.bgcolor = 'red';
    } else if (blue) {
        //@ts-ignore
        sx.bgcolor = 'blue';
    }
    let style:{
        appRegion?:"drag",
        overflow?:"hidden",
        whitSpace?:"nowrap",
        textOverflow?:"nowrap"
    } = {}
    if(appRegionDrag){
        style.appRegion = "drag"
    }

    if(hoverBgColor){
        //@ts-ignore
        if(!sx["&:hover"]){
            //@ts-ignore
            sx["&:hover"] = {}
        }
        //@ts-ignore
        sx["&:hover"]["bgcolor"] = hoverBgColor
    }
    
    return {
        ...props_,
        style,
        //@ts-ignore
        sx: { ...sx, ...sx_ }
    };
}
