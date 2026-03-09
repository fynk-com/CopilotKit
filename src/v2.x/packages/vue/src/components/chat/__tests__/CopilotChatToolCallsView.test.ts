import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import type { AssistantMessage, Message, ToolMessage } from "@ag-ui/core";
import CopilotKitProvider from "../../../providers/CopilotKitProvider.vue";
import CopilotChatConfigurationProvider from "../../../providers/CopilotChatConfigurationProvider.vue";
import { useCopilotKit } from "../../../providers/useCopilotKit";
import CopilotChatToolCallsView from "../CopilotChatToolCallsView.vue";

function baseAssistantMessage(toolName = "search_docs"): AssistantMessage {
  return {
    id: "assistant-tool",
    role: "assistant",
    content: "",
    toolCalls: [
      {
        id: "tc-1",
        type: "function",
        function: {
          name: toolName,
          arguments: JSON.stringify({ query: "vue slots" }),
        },
      },
    ],
  };
}

function mountToolCallsView(
  message: AssistantMessage,
  messages: Message[] = [message],
  slots: Parameters<typeof h>[2] = {},
) {
  return mount(CopilotKitProvider, {
    props: { runtimeUrl: "/api/copilotkit" },
    slots: {
      default: () =>
        h(
          CopilotChatConfigurationProvider,
          { threadId: "thread-1", agentId: "default" },
          {
            default: () =>
              h(
                CopilotChatToolCallsView,
                {
                  message,
                  messages,
                },
                slots,
              ),
          },
        ),
    },
  });
}

describe("CopilotChatToolCallsView", () => {
  it("renders nothing when assistant message has no tool calls", () => {
    const message: AssistantMessage = {
      id: "assistant-empty",
      role: "assistant",
      content: "No tools",
      toolCalls: [],
    };

    const wrapper = mountToolCallsView(message);
    expect(wrapper.text().trim()).toBe("");
  });

  it("prefers named tool slot over fallback slot", () => {
    const message = baseAssistantMessage("search_docs");
    const wrapper = mountToolCallsView(message, [message], {
      "tool-call-search_docs": ({ status }: { status: string }) =>
        h("div", { "data-testid": "named-tool-slot" }, status),
      "tool-call": () => h("div", { "data-testid": "fallback-tool-slot" }, "fallback"),
    });

    expect(wrapper.find("[data-testid='named-tool-slot']").text()).toBe("inProgress");
    expect(wrapper.find("[data-testid='fallback-tool-slot']").exists()).toBe(false);
  });

  it("uses fallback tool slot when no named slot matches", () => {
    const message = baseAssistantMessage("unknown_tool");
    const wrapper = mountToolCallsView(message, [message], {
      "tool-call": ({ name }: { name: string }) =>
        h("div", { "data-testid": "fallback-tool-slot" }, name),
    });

    expect(wrapper.find("[data-testid='fallback-tool-slot']").text()).toBe("unknown_tool");
  });

  it("renders complete status and result when tool message exists", () => {
    const message = baseAssistantMessage("search_docs");
    const toolMessage: ToolMessage = {
      id: "tool-result-1",
      role: "tool",
      toolCallId: "tc-1",
      content: "found docs",
    };

    const wrapper = mountToolCallsView(message, [message, toolMessage], {
      "tool-call-search_docs": ({ status, result }: { status: string; result?: string }) =>
        h("div", { "data-testid": "tool-status" }, `${status}:${result}`),
    });

    expect(wrapper.find("[data-testid='tool-status']").text()).toBe("complete:found docs");
  });

  it("renders executing status when tool call id is executing", () => {
    const message = baseAssistantMessage("search_docs");
    const SetExecuting = defineComponent({
      setup() {
        const { executingToolCallIds } = useCopilotKit();
        executingToolCallIds.value = new Set(["tc-1"]);
        return () => null;
      },
    });

    const wrapper = mount(CopilotKitProvider, {
      props: { runtimeUrl: "/api/copilotkit" },
      slots: {
        default: () =>
          h(
            CopilotChatConfigurationProvider,
            { threadId: "thread-1", agentId: "default" },
            {
              default: () =>
                h("div", [
                  h(SetExecuting),
                  h(
                    CopilotChatToolCallsView,
                    { message, messages: [message] },
                    {
                      "tool-call-search_docs": ({ status }: { status: string }) =>
                        h("div", { "data-testid": "tool-status" }, status),
                    },
                  ),
                ]),
            },
          ),
      },
    });

    expect(wrapper.find("[data-testid='tool-status']").text()).toBe("executing");
  });
});
