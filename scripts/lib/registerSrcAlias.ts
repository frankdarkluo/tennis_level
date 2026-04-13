import Module from "node:module";
import { resolve } from "node:path";

let registered = false;

export function registerSrcAlias() {
  if (registered) {
    return;
  }

  const moduleApi = Module as typeof Module & {
    _resolveFilename: (
      request: string,
      parent: NodeModule | null | undefined,
      isMain: boolean,
      options?: unknown
    ) => string;
  };
  const originalResolveFilename = moduleApi._resolveFilename.bind(moduleApi);
  const srcRoot = resolve(__dirname, "..", "..", "src");

  moduleApi._resolveFilename = (request, parent, isMain, options) => {
    if (request.startsWith("@/")) {
      return originalResolveFilename(resolve(srcRoot, request.slice(2)), parent, isMain, options);
    }

    return originalResolveFilename(request, parent, isMain, options);
  };

  registered = true;
}
