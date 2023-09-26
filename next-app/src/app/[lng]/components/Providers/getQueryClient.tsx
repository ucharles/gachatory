// why using query-core instead of react-query?
// https://github.com/TanStack/query/issues/4933#issuecomment-1548778081

import { QueryClient } from "@tanstack/query-core";
import { cache } from "react";

const getQueryClient = cache(() => new QueryClient());

export default getQueryClient;
