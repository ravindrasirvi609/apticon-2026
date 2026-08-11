// The installed lucide-react@1.27.0 package declares a "typings" field pointing at
// dist/lucide-react.d.ts, but that file isn't actually included in the published package —
// every import from "lucide-react" fails to type-check across the whole repo without this
// pre-existing, unrelated packaging issue worked around here.
declare module "lucide-react";
