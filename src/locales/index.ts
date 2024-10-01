import intl from "react-intl-universal";

import enUS from "./en-us.json";
import zhCN from "./zh-cn.json";
import zhTW from "./zh-tw.json";
import frFr from "./fr-fr.json";
import jaJP from "./ja-jp.json";

import antdEnUS from "antd/locale/en_US";
import antdZhCN from "antd/locale/zh_CN";
import antdZhTW from "antd/locale/zh_TW";
import antdFrFr from "antd/locale/fr_FR";
import antdJaJP from "antd/locale/ja_JP";

const LOCALE_DATA = {
    "en-us": enUS,
    "zh-cn": zhCN,
    "zh": zhCN,
    "zh-tw": zhTW,
    "zh-hk": zhTW,
    "fr-fr": frFr,
    "ja-jp": jaJP,
    all: new Set<string>(["en-us", "zh-cn","zh", "zh-tw", "zh-hk", "fr-fr", "ja-jp"]),
    "antd-en-us": antdEnUS,
    "antd-zh-cn": antdZhCN,
    "antd-zh": antdZhCN,
    "antd-zh-tw": antdZhTW,
    "antd-zh-hk": antdZhTW,
    "antd-fr-fr": antdFrFr,
    "antd-ja-jp": antdJaJP,
    antdAll: new Set<string>(["antd-en-us","antd-zh", "antd-zh-cn", "antd-zh-tw", "antd-zh-hk", "antd-fr-fr", "antd-ja-jp"])
};

/**
 * Get the application platform language environment
 */
const getLocale = () => {
    return window.navigator.language.toLowerCase();
};

/**
 * Get the antd language environment
 */
export const getAntdLocale = () => {
    let lang = window.navigator.language.toLowerCase();
    let locale = `antd-${lang}`;
    if (LOCALE_DATA.antdAll.has(locale)) {
        return LOCALE_DATA[locale];
    }
    return antdEnUS;
};

/**
 * i18n init
 */
export const i18n = async () => {
    let currentLocale = getLocale();
    // If the environment information is not detected, the default is English
    if (!LOCALE_DATA.all.has(currentLocale.toLowerCase())) {
        currentLocale = "en-us";
    }
    return await intl.init({
        currentLocale,
        locales: LOCALE_DATA
    });
};