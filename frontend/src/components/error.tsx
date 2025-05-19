import {
  AlertTriangle,
  ChevronsDown,
  Home,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { ErrorInfo } from "react";

import Image from "@/assets/this-is-fine.gif";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RawContent, Trans } from "@/components";
import { useTranslation } from "@/i18n";

interface Props {
  info?: ErrorInfo;
  error: unknown;
  showImage?: boolean;
}

const ErrorComponent: React.FC<Props> = ({ info, error, showImage }) => {
  const { t } = useTranslation();

  const errorMessage =
    error instanceof Error ? error.message : t("unknown.error");
  const errorName = error instanceof Error ? error.name : t("unknown.error");
  const errorStack =
    error instanceof Error ? error.stack?.trim() : t("unknown.error");

  const componentStack = info?.componentStack?.trim();
  return (
    <div className="container relative mx-auto flex  flex-1 items-center justify-center gap-8 p-4 dark:text-white">
      {showImage && (
        <div className="hidden h-[20rem] w-[20rem] flex-col gap-6 lg:flex xl:h-[30rem] xl:w-[30rem]">
          <img
            src={Image}
            alt={t("this.is.fine.image.alt")}
            className="h-fit w-fit rounded-3xl object-cover text-white shadow-lg shadow-primary/20 dark:shadow-primary/5"
          />

          <div className="hidden flex-wrap items-center justify-between gap-4 xl:flex">
            {/* <Layouts.Public.Footer /> */}
          </div>
        </div>
      )}

      <div className="relative flex flex-1 flex-col gap-2">
        <div className="text-500 z-10 font-serif text-5xl font-bold leading-[1] sm:text-7xl lg:text-8xl xl:text-9xl">
          <Trans id="error.unexpected.title" />
        </div>

        <div className="dark:text-800 absolute -right-5 -top-10 ms-4 select-none font-serif text-7xl font-bold leading-5 text-primary/30 sm:text-7xl md:text-9xl xl:top-10 xl:text-[10rem]">
          x⸑x
        </div>
        <div className="mb-2 text-sm">
          <Trans id="error.unexpected.description" />
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href="/" className="gap-2">
                    <Home size={16} />
                    <Trans id="home" />
                  </a>
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  <RefreshCw size={16} />
                  <Trans id="refresh" />
                </Button>
                <Button variant="secondary" asChild>
                  <a href="/auth/logout" className="gap-2">
                    <LogOut size={16} />
                    <Trans id="logout" />
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <AccordionTrigger className="mx-2 my-2 gap-2 p-0">
                  <Trans id="error.toggle" />
                </AccordionTrigger>
              </div>
            </div>
            <AccordionContent className="mt-4 pb-2">
              <Tabs
                defaultValue="error"
                className="dark:bg-950 flex flex-col gap-2 rounded-xl border bg-background p-4 shadow-sm"
              >
                <div className="flex justify-between">
                  <h3 className="text-800 flex gap-2 text-2xl font-medium dark:text-white">
                    <AlertTriangle size={32} strokeWidth={2.5} /> {errorName}
                  </h3>
                  {errorStack && componentStack && (
                    <TabsList>
                      {errorStack && (
                        <TabsTrigger value="error">
                          <Trans id="error.stack" />
                        </TabsTrigger>
                      )}
                      {componentStack && (
                        <TabsTrigger value="component">
                          <Trans id="component.stack" />
                        </TabsTrigger>
                      )}
                    </TabsList>
                  )}
                </div>
                <p>{errorMessage}</p>
                {errorStack && (
                  <TabsContent value="error">
                    <RawContent content={errorStack} />
                  </TabsContent>
                )}
                {componentStack && (
                  <TabsContent value="component">
                    <RawContent content={componentStack} />
                  </TabsContent>
                )}
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 xl:hidden">
          {/* <Layouts.Public.Footer /> */}
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
