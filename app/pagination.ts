import { type HonoRequest } from "hono";

export function getPaginationVariables(
  request: HonoRequest,
  options: { pageBy: number } = { pageBy: 20 }
) {
  const { pageBy } = options;
  const searchParams = new URLSearchParams(new URL(request.url).search);

  const cursor = searchParams.get("cursor") ?? undefined;
  const direction =
    searchParams.get("direction") === "previous" ? "previous" : "next";
  const isPrevious = direction === "previous";

  const prevPage = {
    last: pageBy,
    startCursor: cursor ?? null,
  };

  const nextPage = {
    first: pageBy,
    endCursor: cursor ?? null,
  };

  const variables = isPrevious ? prevPage : nextPage;

  return variables;
}

export function getPaginationCursor(pageInfo?: {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}): { next: string | null; previous: string | null } {
  if (!pageInfo) return { next: null, previous: null };

  const { hasPreviousPage, hasNextPage, startCursor, endCursor } = pageInfo;

  const previous = hasPreviousPage
    ? `?cursor=${startCursor}&direction=previous`
    : null;

  const next = hasNextPage ? `?cursor=${endCursor}&direction=next` : null;

  return { next, previous };
}
