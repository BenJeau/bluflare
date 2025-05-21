import { TransId, useTranslation } from "@/i18n";

interface Props extends Record<string, React.ReactNode> {
  id: TransId;
}

const Text: React.FC<Props> = ({ id, ...props }) => {
  const { t } = useTranslation();

  return t(id, props);
};

export default Text;
