import { ExternalLinkIcon, LucideIcon } from "lucide-react";
import { Link, LinkProps } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface BaseNavLinkProps {
  title: string;
  label?: React.ReactNode;
  icon: LucideIcon;
  variant?: "default" | "ghost";
  className?: string;
}

type ExtraNavLinkProps =
  | {
      href: string;
    }
  | {
      onClick: () => void;
      size?: string;
      disabled?: boolean;
    }
  | ({
      to: string;
      roles?: string[];
    } & LinkProps);

type NavLinkProps = BaseNavLinkProps & ExtraNavLinkProps;

interface NavProps {
  links: NavLinkProps[];
}

const LinkOrButtonOrExternalLink: React.FC<
  React.PropsWithChildren<ExtraNavLinkProps & { className?: string }>
> = (props) => {
  if ("to" in props) {
    return <Link {...props} />;
  }

  if ("href" in props) {
    return <a target="_blank" rel="noreferrer noopener" {...props} />;
  }

  return <div {...props} className={cn("cursor-pointer", props.className)} />;
};

const Nav: React.FC<NavProps> = ({ links }) => {
  return (
    <div className="flex py-2 sm:flex-col sm:gap-1">
      {links.map((link, index) => (
        <div className="flex" key={index}>
          <LinkOrButtonOrExternalLink
            {...link}
            className={cn(
              buttonVariants({
                variant: link.variant ?? "ghost",
              }),
              "relative mx-1 h-9 w-9 flex-1 p-0 text-xs sm:group-hover/nav:rounded-md sm:group-hover/nav:px-3 md:mx-2",
              link.variant === "default" &&
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-muted-foreground",
              "disabled" in link &&
                link.disabled &&
                "cursor-default opacity-50 hover:bg-transparent hover:text-current",
              link.className
            )}
          >
            <link.icon className="absolute left-3 h-4 w-4 min-w-4" />
            <div className="absolute left-9 right-4 flex flex-1 opacity-0 transition-opacity duration-300 ease-in sm:group-hover/nav:opacity-100 sm:group-hover/nav:ease-out">
              <span className="flex-1 whitespace-nowrap">{link.title}</span>
              {link.label !== undefined && (
                <span
                  className={cn(
                    link.variant === "default" && "dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
              {"href" in link && <ExternalLinkIcon size={14} />}
            </div>
          </LinkOrButtonOrExternalLink>
        </div>
      ))}
    </div>
  );
};

export default Nav;
