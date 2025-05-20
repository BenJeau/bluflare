import React, { useEffect, useMemo } from "react";
import {
  LogOut,
  Languages,
  FlameKindling,
  Binoculars,
  Users,
  BarChart4,
  Github,
  MessageCircleMore,
  BookOpenText,
} from "lucide-react";
import { useRouterState, Link, Outlet } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

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

type Page =
  | "home"
  | "interests"
  | "users"
  | "posts"
  | "stats"
  | "docs"
  | "github";

export const Layout: React.FC = () => {
  const { location } = useRouterState();
  const { t, toggle, otherLang } = useTranslation();

  const page: Page | undefined = useMemo(() => {
    if (location.pathname.startsWith("/interests")) return "interests";
    if (location.pathname.startsWith("/posts")) return "posts";
    if (location.pathname.startsWith("/users")) return "users";
    if (location.pathname.startsWith("/stats")) return "stats";
    if (location.pathname.startsWith("/docs")) return "docs";
    if (location.pathname.startsWith("/github")) return "github";
    if (location.pathname === "/") return "home";
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    document.title = page ? `${t(page)} - Bluflare` : "Bluflare";
  }, [page, t]);

  return (
    <div className="relative flex h-full w-screen gap-2 px-2 sm:py-2 md:gap-4 md:p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.5 }}
          className="peer/nav fixed right-0 bottom-0 left-0 z-30 flex transition-[left,bottom,top] duration-500 sm:top-2 sm:right-full sm:bottom-2 sm:left-2 md:top-4 md:bottom-4 md:left-4"
        >
          <div className="group/nav bg-background/50 flex flex-1 justify-between overflow-hidden border shadow-md backdrop-blur transition-all duration-300 ease-in hover:w-[270px] hover:shadow-2xl hover:ease-out sm:w-12 sm:min-w-12 sm:flex-col sm:rounded-2xl sm:hover:min-w-[270px] md:w-14 md:min-w-14">
            <div className="flex sm:flex-col">
              <Link
                to="/"
                className={cn(
                  "bg-primary/20 focus-visible:ring-ring flex items-center justify-center px-3 font-medium whitespace-nowrap transition-[padding] ring-inset focus-visible:ring-1 focus-visible:outline-none sm:z-30 sm:h-[52px] sm:rounded-t-2xl sm:group-hover/nav:pe-4",
                  page === "home"
                    ? "bg-primary font-extrabold text-white dark:text-black"
                    : "hover:bg-primary/10 dark:hover:bg-primary/60 hover:text-neutral-700 dark:hover:text-white",
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
                    title: "interests",
                    to: "/interests",
                    variant: page === "interests" ? "default" : "ghost",
                    icon: Binoculars,
                  },
                  {
                    title: "users",
                    to: "/users",
                    variant: page === "users" ? "default" : "ghost",
                    icon: Users,
                  },
                  {
                    title: "posts",
                    to: "/posts",
                    variant: page === "posts" ? "default" : "ghost",
                    icon: MessageCircleMore,
                  },
                ]}
              />
              <div className="mx-2 hidden sm:block">
                <Separator />
              </div>
              <Nav
                links={[
                  {
                    title: "stats",
                    to: "/stats",
                    variant: page === "stats" ? "default" : "ghost",
                    icon: BarChart4,
                  },
                ]}
              />
            </div>
            <div className="flex sm:flex-col">
              <Nav
                links={[
                  {
                    title: "docs",
                    to: "/docs",
                    variant: page === "docs" ? "default" : "ghost",
                    icon: BookOpenText,
                  },
                ]}
              />
              <div className="mx-2 hidden sm:block">
                <Separator />
              </div>
              <Nav
                links={[
                  {
                    title: "github",
                    href: "https://github.com/BenJeau/bluflare",
                    variant: page === "github" ? "default" : "ghost",
                    icon: Github,
                  },
                ]}
              />
              <Separator className="hidden sm:block" />
              <Popover>
                <PopoverTrigger className="bg-muted/50 hover:bg-muted/10 focus-visible:ring-ring dark:hover:bg-muted/90 flex w-full cursor-pointer items-center justify-center gap-2 px-2 transition-all duration-300 ring-inset hover:text-neutral-700 focus-visible:ring-1 focus-visible:outline-none sm:rounded-b-2xl sm:py-3 sm:group-hover/nav:justify-start sm:group-hover/nav:px-4 dark:hover:text-white">
                  <Avatar className="border">
                    <AvatarImage alt="@shadcn" />
                    <AvatarFallback>BJ</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col sm:group-hover/nav:flex">
                    <span className="text-start font-semibold whitespace-nowrap">
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
                  className="ms-2 mb-1 w-48 overflow-hidden p-0"
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
        </motion.div>
      </AnimatePresence>
      <div
        className="absolute top-0 right-0 bottom-0 left-0 -z-10 hidden opacity-0 backdrop-blur peer-hover/nav:z-20 peer-hover/nav:opacity-100 sm:block"
        id="nav-backdrop"
      />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="group/main flex h-full w-full flex-col pb-16 sm:ms-14 sm:pb-0 md:ps-4"
        >
          <div className="flex w-full items-center justify-between gap-2 py-3 transition-all sm:min-h-[53px] sm:py-0">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-baseline gap-2 overflow-hidden"
            >
              <h1 className="text-xl font-bold whitespace-nowrap">
                {page && t(page)}
              </h1>
              <p className="overflow-hidden text-xs overflow-ellipsis whitespace-nowrap opacity-70">
                {page && t(`layout.${page}.description`)}
              </p>
            </motion.div>
          </div>
          <main className="bg-background/30 flex h-full flex-1 flex-col gap-2 overflow-y-scroll rounded-2xl border shadow-md backdrop-blur-sm">
            <Outlet />
          </main>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
