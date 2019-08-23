import i18next from "i18next";
import languageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./en";
import ko from "./ko";

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
            en,
            ko
        }
    });

export default i18next;
