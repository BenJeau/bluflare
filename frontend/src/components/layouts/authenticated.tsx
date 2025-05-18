import React, { useEffect, useMemo } from "react";
import {
  LogOut,
  Languages,
  ContactRound,
  FlameKindling,
  Binoculars,
  Users,
} from "lucide-react";
import { useRouterState, Link, Outlet } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Nav, Trans } from "@/components";
import config from "@/lib/config";
import { useTranslation } from "@/i18n";

type Page = "home" | "interests";

export const Layout: React.FC = () => {
  const { location } = useRouterState();
  const { t, toggle, otherLang } = useTranslation();

  const page: Page | undefined = useMemo(() => {
    if (location.pathname.startsWith("/interests")) return "interests";
    if (location.pathname === "/") return "home";
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    document.title = page ? `${t(page)} - Bluflare` : "Bluflare";
  }, [page, t]);

  return (
    <div className="relative flex h-full w-screen gap-2 px-2 sm:py-2 md:gap-4 md:p-4">
      <div className="peer/nav fixed bottom-0 left-0 right-0 z-30 flex transition-[left,bottom,top] duration-500 sm:bottom-2 sm:left-2 sm:right-full sm:top-2 md:bottom-4 md:left-4 md:top-4">
        <div className="group/nav flex flex-1 justify-between overflow-hidden border bg-background/50 shadow-md backdrop-blur-md transition-all duration-300 ease-in hover:w-[270px] hover:shadow-2xl hover:ease-out sm:w-12 sm:min-w-12 sm:flex-col sm:rounded-2xl sm:hover:min-w-[270px] md:w-14 md:min-w-14">
          <div className="flex sm:flex-col">
            <Link
              to="/"
              className={cn(
                "flex items-center justify-center whitespace-nowrap bg-primary/20 px-3 font-medium ring-inset transition-[padding] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:z-30 sm:h-[52px] sm:rounded-t-2xl sm:group-hover/nav:pe-4",
                page === "home"
                  ? "bg-primary font-extrabold text-white dark:text-black"
                  : "hover:bg-primary/10 hover:text-neutral-700 dark:hover:bg-primary/60 dark:hover:text-white"
              )}
              disabled={page === "home"}
            >
              <FlameKindling strokeWidth={2.5} className="min-w-6" />
              <div className="w-0 font-bold opacity-0 transition-all duration-300 sm:group-hover/nav:ms-2 sm:group-hover/nav:w-auto sm:group-hover/nav:opacity-100">
                Bluflare
              </div>
            </Link>
            <Separator className="hidden sm:block" />
            <Nav
              links={[
                {
                  title: t("interests"),
                  to: "/interests",
                  variant: page === "interests" ? "default" : "ghost",
                  icon: Binoculars,
                },
                {
                  title: t("users"),
                  to: "/users",
                  variant: page === "users" ? "default" : "ghost",
                  icon: Users,
                },
              ]}
            />
            {/* <div className="mx-2 hidden sm:block">
                <Separator />
              </div>
              <Nav
                links={[
                  {
                    title: t("interests"),
                    to: "/interests",
                    variant: page === "interests" ? "default" : "ghost",
                    icon: Database,
                  },
                ]}
              /> */}
          </div>
          <div className="flex sm:flex-col">
            <Popover>
              <PopoverTrigger className="flex w-full cursor-pointer items-center justify-center gap-2 bg-muted/50 px-2 ring-inset transition-all duration-300 hover:bg-muted/10 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:hover:bg-muted/90 dark:hover:text-white sm:rounded-b-2xl sm:py-3 sm:group-hover/nav:justify-start sm:group-hover/nav:px-4">
                <Avatar className="border">
                  <AvatarImage alt="@shadcn" />
                  <AvatarFallback>BJ</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col sm:group-hover/nav:flex">
                  <span className="whitespace-nowrap text-start font-semibold">
                    Benoît Jeaurond
                  </span>
                  <span className="text-xs opacity-70">
                    benoit@jeaurond.dev
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                className="mb-1 ms-2 w-48 overflow-hidden p-0"
              >
                <div className="flex flex-col gap-1 p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={toggle}
                  >
                    <Languages size={16} />
                    <p className="text-xs">
                      {t("change.to") + " " + otherLang.lang.lang}
                    </p>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link to="/me">
                      <ContactRound size={16} />
                      <p className="text-xs">View profile</p>
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link to="/auth/logout" preload={false}>
                      <LogOut size={16} />
                      <p className="text-xs">
                        <Trans id="logout" />
                      </p>
                    </Link>
                  </Button>
                </div>
                <Separator />
                <div className="bg-background px-6 py-2 text-xs italic opacity-50">
                  {config.commit_sha} - {config.version}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 top-0 -z-10 hidden opacity-0 backdrop-blur peer-hover/nav:z-20 peer-hover/nav:opacity-100 sm:block"
        id="nav-backdrop"
      />
      <div className="group/main flex h-full w-full flex-col pb-16 sm:ms-14 sm:pb-0 md:ps-4">
        <div className="flex w-full items-center justify-between gap-2 py-3 transition-all sm:min-h-[53px] sm:py-0">
          <div className="flex items-baseline gap-2 overflow-hidden">
            <h1 className="whitespace-nowrap text-xl font-bold">
              {page && t(page)}
            </h1>
            <p
              className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs opacity-70"
              title={page && t(`layout.${page}.description`)}
            >
              {page && t(`layout.${page}.description`)}
            </p>
          </div>
        </div>
        <main className="flex flex-1 flex-col gap-2 overflow-y-scroll rounded-2xl border bg-background/50 shadow-md backdrop-blur-sm h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
