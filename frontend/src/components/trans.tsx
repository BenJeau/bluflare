import { TransId, useTranslation } from "@/i18n";

interface Props extends Record<string, React.ReactNode> {
  id: TransId;
  case?: "sentence";
}

const Text: React.FC<Props> = ({ id, ...props }) => {
  const { t } = useTranslation();

  let text = t(id, props);

  if (
    props.case === "sentence" &&
    typeof text === "string" &&
    text.length > 0
  ) {
    text = text[0].toUpperCase() + text.slice(1);
  }

  return text;
};

export default Text;
