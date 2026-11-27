import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // shadcn-owned files are kept byte-identical to the registry.
  {
    files: ["components/ui/**", "hooks/use-mobile.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Behind a reverse proxy `request.nextUrl`/`request.url` hold the server's own address
  // (localhost:3000), so an absolute redirect built from them sends people to localhost.
  // Redirect with redirectTo() from lib/http/redirect.ts (a relative Location) instead.
  {
    files: ["app/**/route.ts"],
    ignores: ["lib/http/redirect.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='NextResponse'][callee.property.name='redirect']",
          message: "Use redirectTo() from @/lib/http/redirect: an absolute redirect built from the request points at localhost behind the proxy.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "maktech_laravel/**",
    "maktech-laravel/**",
    "API/**",
  ]),
]);

export default eslintConfig;
