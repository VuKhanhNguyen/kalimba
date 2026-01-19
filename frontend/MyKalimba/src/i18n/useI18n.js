import { useContext } from "react";
import { I18nContext } from "./I18nProvider.jsx";

export function useI18n() {
  return useContext(I18nContext);
}

export default useI18n;
