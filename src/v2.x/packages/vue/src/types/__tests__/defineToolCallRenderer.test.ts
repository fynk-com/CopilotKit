import { describe, it, expect } from "vitest";
import { defineComponent, h } from "vue";
import { z } from "zod";
import { ToolCallStatus } from "@copilotkitnext/core";
import type { AbstractAgent } from "@ag-ui/client";
import { defineToolCallRenderer } from "../defineToolCallRenderer";
import type { VueToolCallRenderer } from "../vue-tool-call-renderer";
import { mountWithProvider } from "../../__tests__/utils/mount";
import { StateCapturingAgent } from "../../__tests__/utils/agents";

describe("defineToolCallRenderer", () => {
  it("defaults wildcard args to z.any and preserves runtime tool name", () => {
    const wildcardRenderer = defineToolCallRenderer({
      name: "*",
      render: ({ name, args, status }) =>
        h("div", { "data-testid": "wildcard" }, `${name}:${status}:${JSON.stringify(args)}`),
    });

    expect(wildcardRenderer.name).toBe("*");
    expect(wildcardRenderer.args.safeParse({ anything: true }).success).toBe(true);

    const rendered = (wildcardRenderer.render as (props: {
      name: string;
      args: Record<string, unknown>;
      status: ToolCallStatus;
      result: string | undefined;
    }) => ReturnType<typeof h>)({
      name: "customTool",
      args: { x: 1 },
      status: ToolCallStatus.Executing,
      result: undefined,
    });

    expect(rendered.children).toContain("customTool");
    expect(rendered.children).not.toContain("*:");
  });

  it("supports mixed renderer arrays without type casts", () => {
    const wildcardRenderer = defineToolCallRenderer({
      name: "*",
      render: ({ name }) => h("div", `fallback:${name}`),
    });
    const weatherRenderer = defineToolCallRenderer({
      name: "get_weather",
      args: z.object({ location: z.string() }),
      render: ({ args }) => h("div", `weather:${args.location}`),
    });

    const renderers: VueToolCallRenderer<unknown>[] = [wildcardRenderer, weatherRenderer];
    expect(renderers).toHaveLength(2);
    expect(renderers[0]?.name).toBe("*");
    expect(renderers[1]?.name).toBe("get_weather");
  });

  it("works with provider renderToolCalls when mixed renderers are passed", () => {
    const wildcardRenderer = defineToolCallRenderer({
      name: "*",
      render: ({ name }) => h("div", { "data-testid": "wildcard" }, `fallback:${name}`),
    });
    const weatherRenderer = defineToolCallRenderer({
      name: "get_weather",
      args: z.object({ location: z.string() }),
      render: ({ args }) => h("div", { "data-testid": "weather" }, `weather:${args.location}`),
    });

    const rendererList = [wildcardRenderer, weatherRenderer];
    const agent = new StateCapturingAgent([], "test-agent");
    const TestApp = defineComponent({
      setup() {
        return () => h("div", { "data-testid": "app" }, "ok");
      },
    });

    const { wrapper } = mountWithProvider(
      () => h(TestApp),
      {
        agents__unsafe_dev_only: { "test-agent": agent as unknown as AbstractAgent },
        renderToolCalls: rendererList,
      },
    );

    expect(wrapper.find("[data-testid=app]").exists()).toBe(true);
  });

  it("infers typed args shape for specific tools", () => {
    const typedRenderer = defineToolCallRenderer({
      name: "get_weather",
      args: z.object({
        location: z.string(),
        units: z.enum(["celsius", "fahrenheit"]).optional(),
      }),
      render: ({ args, status, result }) => {
        if (status === ToolCallStatus.InProgress) {
          const locationMaybe: string | undefined = args.location;
          return h("div", `loading:${locationMaybe ?? ""}`);
        }
        if (status === ToolCallStatus.Executing) {
          const location: string = args.location;
          return h("div", `executing:${location}`);
        }
        return h("div", `complete:${args.location}:${result}`);
      },
    });

    const rendered = (typedRenderer.render as (props: {
      name: string;
      args: { location: string; units?: "celsius" | "fahrenheit" };
      status: ToolCallStatus;
      result: string | undefined;
    }) => ReturnType<typeof h>)({
      name: "get_weather",
      args: { location: "Paris", units: "celsius" },
      status: ToolCallStatus.Executing,
      result: undefined,
    });

    expect(rendered.children).toContain("executing:Paris");
  });
});
