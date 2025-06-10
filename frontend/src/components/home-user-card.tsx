import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";

import { User } from "@/api/users";

type Props = {
  user: User;
};

const HomeUserCard: React.FC<Props> = ({ user }) => {
  const handle = user.aka ? user.aka[0].split("://")[1] : user.did;

  return (
    <Link
      key={user.id}
      to="/users"
      className="group bg-background/75 hover:bg-background flex flex-col rounded-lg border p-2 text-sm shadow-xs transition-all active:shadow-inner"
    >
      <h3 className="overflow-hidden font-medium overflow-ellipsis whitespace-nowrap group-hover:underline">
        {handle}
      </h3>
      <span className="overflow-hidden text-xs overflow-ellipsis whitespace-nowrap opacity-70">
        First seen{" "}
        <span className="font-medium italic">
          {dayjs(user.createdAt).format("LL LTS")}
        </span>
      </span>
    </Link>
  );
};

export default HomeUserCard;
