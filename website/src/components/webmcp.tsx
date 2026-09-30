"use client";
import { useEffect, useRef } from "react";
import { useTravel } from "@/lib/travel-provider";
type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type Registry = {
  registerTool: (
    tool: Tool,
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function QuestTools() {
  const { catalog, daily, progress } = useTravel();
  const state = useRef({ catalog, daily, progress });
  state.current = { catalog, daily, progress };
  useEffect(() => {
    const registry = (document as Document & { modelContext?: Registry })
      .modelContext;
    if (!registry?.registerTool) return;
    const lifecycle = new AbortController();
    const tool: Tool = {
      name: "search_weout_sidequests",
      title: "Find a WeOut SideQuest",
      description:
        "Search the visible quest catalog. Returns matching quests, completion status, and links. Does not join or complete a quest.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string", maxLength: 100 } },
        required: ["query"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        if (
          !input ||
          typeof input !== "object" ||
          !("query" in input) ||
          typeof input.query !== "string" ||
          input.query.length > 100 ||
          Object.keys(input).some((k) => k !== "query")
        )
          throw new Error("Provide a query string up to 100 characters.");
        const search = input.query.toLowerCase(),
          current = state.current;
        return [
          ...new Map(
            [current.daily, ...current.catalog].map((q) => [q.id, q]),
          ).values(),
        ]
          .filter((q) =>
            (q.title + " " + q.category + " " + q.description)
              .toLowerCase()
              .includes(search),
          )
          .slice(0, 20)
          .map((q) => ({
            id: q.id,
            title: q.title,
            category: q.category,
            minutes: q.minutes,
            status: current.progress.completed[q.id]
              ? "completed"
              : current.progress.started.includes(q.id)
                ? "active"
                : "available",
            url: "/sidequests/detail?id=" + encodeURIComponent(q.id),
          }));
      },
    };
    try {
      void Promise.resolve(
        registry.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  return null;
}
