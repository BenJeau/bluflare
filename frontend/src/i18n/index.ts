import React, { useCallback, useMemo } from "react";
import { useAtom } from "jotai";

import { languageAtom } from "@/atoms/language";

import { Language, languages, TransId } from "./lang";

const valueRegex = /{([^}]+)}/;

export const useTranslation = () => {
  const [lang, setLang] = useAtom(languageAtom);

  // Used to retrict the type to a string when no values are provided
  function tHelper(id: TransId): string;
  function tHelper(
    id: TransId,
    values: Record<string, React.ReactNode>,
  ): (string | React.ReactNode)[];

  function tHelper(
    id: TransId,
    values?: Record<string, React.ReactNode>,
  ): string | (string | React.ReactNode)[] {
    const text = languages[lang].file[id];

    if (
      !values ||
      Object.values(values).length === 0 ||
      !valueRegex.test(text)
    ) {
      return text;
    }

    return text.split(valueRegex).map((part) => {
      if (part in values!) {
        return values![part];
      }
      return part;
    });
  }

  const otherLang: Language = useMemo(() => {
    const other = languages[lang].other;
    return { code: other, lang: languages[other] };
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((prev) => languages[prev].other);
  }, [setLang]);

  const t = useCallback(tHelper, [lang]);

  return { lang: languages[lang], t, toggle, otherLang };
};

export type { TransId };
