type Stack = "frontend" | "backend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type BackendPackage =
    | "cache"
    | "cron_job"
    | "controller"
    | "db"
    | "domain"
    | "handler"
    | "repository"
    | "route"
    | "service"
    | "auth"
    | "config"
    | "middleware"
    | "utils";
type FrontendPackage =
    | "api"
    | "component"
    | "hook"
    | "page"
    | "state"
    | "style"
    | "auth"
    | "config"
    | "middleware"
    | "utils";

export type Log =
    | {
          stack: "frontend";
          package: FrontendPackage;
          level: Level;
          message: string;
      }
    | {
          stack: "backend";
          package: BackendPackage;
          level: Level;
          message: string;
      };
