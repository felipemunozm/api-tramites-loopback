import { Category, CategoryLogger, CategoryServiceFactory, CategoryConfiguration, LogLevel } from "typescript-logging";

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

export const controllerLogger = new Category("Controller");
