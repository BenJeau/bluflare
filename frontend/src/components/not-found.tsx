import { SimpleError } from "@/components";

interface Props {
  title?: string;
  data?: string;
}

const NotFound: React.FC<Props> = ({ title = "Page", data }) => (
  <SimpleError
    emoji="(ಥ﹏ಥ)"
    title="404"
    subtitle={title}
    data={data ?? window.location.pathname}
    description="The page you are looking for does not exist."
  />
);

export default NotFound;
