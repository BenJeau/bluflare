import React, { useEffect, useMemo } from "react";
import {
  Languages,
  FlameKindling,
  Binoculars,
  Users,
  BarChart4,
  Github,
  MessageCircleMore,
  BookOpenText,
  User,
  Lock,
  LogOut,
} from "lucide-react";
import { useRouterState, Link, Outlet } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Nav, Trans } from "@/components";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { userAtom } from "@/atoms/user";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLogin, useLogout } from "@/api/auth";
import { toast } from "sonner";

type Page = "home" | "topics" | "users" | "posts" | "stats" | "docs" | "github";

export const Layout: React.FC = () => {
  const { location } = useRouterState();
  const { t, toggle } = useTranslation();
  const [user, setUser] = useAtom(userAtom);

  const page: Page | undefined = useMemo(() => {
    if (location.pathname.startsWith("/topics")) return "topics";
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

  const { mutateAsync: login } = useLogin();
  const { mutate: logout } = useLogout();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({
        username: e.target.username.value,
        password: e.target.password.value,
      });

      toast.success("Logged in successfully");
      setUser(e.target.username.value);
    } catch (error) {
      console.error(error);
      toast.error("Failed to login");
    }
  };

  return (
    <div className="relative flex h-full w-screen gap-2 px-2 sm:py-2 md:gap-4 md:p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.5 }}
          className="peer/nav fixed right-0 bottom-0 left-0 z-30 flex transition-[left,bottom,top] duration-500 sm:relative sm:right-full"
        >
          <div className="group/nav bg-background/75 flex flex-1 justify-between overflow-hidden border shadow-md backdrop-blur transition-all duration-300 ease-in hover:w-[250px] hover:shadow-2xl hover:ease-out sm:w-12 sm:min-w-12 sm:flex-col sm:rounded-2xl sm:hover:min-w-[250px] md:w-14 md:min-w-14">
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
                    title: "topics",
                    to: "/topics",
                    variant: page === "topics" ? "default" : "ghost",
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
                    title: "change.language",
                    onClick: toggle,
                    variant: "ghost",
                    icon: Languages,
                  },
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
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="group/main flex h-full w-full flex-col pb-16 sm:pb-0"
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

            <Popover>
              <PopoverTrigger className="flex cursor-pointer items-center gap-2 p-0 hover:bg-transparent dark:hover:bg-transparent">
                <p className="text-xs italic opacity-70">
                  {user ? user : <Trans id="not.logged.in" />}
                </p>
                <Avatar className="h-8 w-8 border opacity-70 shadow">
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={10}>
                {!user && (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm opacity-70">
                        Login to the platform to manage your topics and posts
                      </p>
                    </div>

                    <form
                      className="flex w-full flex-col gap-2"
                      onSubmit={handleLogin}
                    >
                      <Input
                        type="text"
                        placeholder="Username"
                        name="username"
                        minLength={1}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        name="password"
                        minLength={1}
                      />
                      <Button className="mt-4 cursor-pointer" type="submit">
                        <Lock size={16} />
                        <Trans id="login" />
                      </Button>
                    </form>
                  </div>
                )}
                {user && (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                    <p className="text-sm opacity-70">
                      Successfully logged in as <b>{user}</b>
                    </p>
                    <Button
                      className="w-full cursor-pointer"
                      variant="outline"
                      onClick={() => {
                        logout();
                        setUser(null);
                      }}
                    >
                      <LogOut size={16} />
                      <Trans id="logout" />
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <main className="bg-background/30 flex h-full flex-1 flex-col gap-2 overflow-y-scroll rounded-2xl border shadow-md backdrop-blur-sm">
            <Outlet />
          </main>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
