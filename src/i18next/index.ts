import i18next from "i18next";
import languageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import * as en from "./en.json";
import * as ko from "./ko.json";

i18next
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        detection: {
            order: ["querystring", "localStorage"],

            lookupQuerystring: "lang",
            lookupLocalStorage: "i18nextLang",

            caches: ["localStorage"],
            excludeCacheFor: ["cimode"]
        },
        resources: {
            en: {
                trans: en
            },
            ko: {
                trans: ko
            }
        }
    });

export default i18next;
