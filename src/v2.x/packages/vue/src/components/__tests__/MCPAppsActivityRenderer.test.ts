import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import {
  MCPAppsActivityContentSchema,
  MCPAppsActivityRenderer,
  MCPAppsActivityType,
} from "../MCPAppsActivityRenderer";

describe("MCPAppsActivityRenderer", () => {
  it("exports the expected activity type and schema", () => {
    expect(MCPAppsActivityType).toBe("mcp-apps");

    const valid = MCPAppsActivityContentSchema.safeParse({
      resourceUri: "ui://server/dashboard",
      serverHash: "abc123",
      result: {
        content: [{ type: "text", text: "ok" }],
        isError: false,
      },
    });
    expect(valid.success).toBe(true);

    const invalid = MCPAppsActivityContentSchema.safeParse({
      serverHash: "abc123",
      result: {},
    });
    expect(invalid.success).toBe(false);
  });

  it("shows an error when no agent is provided", async () => {
    const wrapper = mount(MCPAppsActivityRenderer, {
      props: {
        activityType: MCPAppsActivityType,
        content: {
          resourceUri: "ui://server/dashboard",
          serverHash: "abc123",
          result: {},
        },
        message: {
          id: "activity-1",
          role: "assistant",
          content: "",
          activityType: MCPAppsActivityType,
        },
        agent: undefined,
      },
    });

    await nextTick();

    expect(wrapper.text()).toContain("No agent available to fetch resource");
  });
});
