import { describe, expect, it } from "vitest";
import * as VuePackage from "../index";

describe("package exports", () => {
  it("exports chat components and MCP activity renderer from the package root", () => {
    expect(typeof VuePackage.CopilotChatMessageView).toBe("object");
    expect(typeof VuePackage.CopilotChatToolCallsView).toBe("object");
    expect(typeof VuePackage.CopilotChatInput).toBe("object");
    expect(VuePackage.MCPAppsActivityType).toBe("mcp-apps");
    expect(typeof VuePackage.MCPAppsActivityRenderer).toBe("object");
  });
});
