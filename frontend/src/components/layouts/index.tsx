import { useUpdateTheme } from "@/atoms/theme";

import * as Authenticated from "./authenticated";

const Layout = () => {
  useUpdateTheme();

  return <Authenticated.Layout />;
};

export default Layout;
