import { useTranslation as useTranslationBase } from 'react-i18next';

function hasChineseCharacters(input: string): boolean {
    const chineseRegex = /[\u4e00-\u9fff]/;
    return chineseRegex.test(input);
}
let cache: any = {};
export const useTranslation = () => {
    const { t: tBase, i18n, ...other } = useTranslationBase();

    const t = (text: any, replaces?: Record<string, string | number>) => {
        let res = tBase(text);

        if (i18n.language !== 'zh_CN' && hasChineseCharacters(res)) {
            if (cache[text] === undefined && text.trim().indexOf('#') !== 0) {
                cache[text] = text;
                localStorage.setItem('_lng_ZhCnList', JSON.stringify(cache));
            }
        }
        if (!replaces) {
            return res;
        }

        return Object.entries(replaces).reduce(
            (acc, [key, val]) => acc.replace(new RegExp('%{' + key + '}'), val.toString()),
            res
        );
    };
    return { t, i18n, ...other };
};
