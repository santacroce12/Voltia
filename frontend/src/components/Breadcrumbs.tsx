import { useMatches, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

type CrumbHandle = {
  crumb: (data: any) => string;
};

export function Breadcrumbs() {
  const matches = useMatches() as Array<
    ReturnType<typeof useMatches>[number] & { handle?: CrumbHandle; data: any; params: any }
  >;

  const crumbs = matches
    .filter((match) => Boolean(match.handle?.crumb))
    .map((match) => ({
      label: match.handle!.crumb({ ...match.data, params: match.params }),
      pathname: match.pathname,
    }));

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex flex-wrap items-center text-sm font-medium text-muted-foreground">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.pathname}>
            {index > 0 && <ChevronRight className="mx-1 h-4 w-4" />}
            <Link
              to={crumb.pathname}
              className={cn("ml-1", isLast ? "text-foreground font-semibold" : "hover:text-primary")}
              aria-current={isLast ? "page" : undefined}
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
