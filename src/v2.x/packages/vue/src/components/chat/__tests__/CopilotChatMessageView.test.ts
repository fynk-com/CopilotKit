import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import type { ActivityMessage, AssistantMessage, Message, ToolMessage } from "@ag-ui/core";
import CopilotKitProvider from "../../../providers/CopilotKitProvider.vue";
import CopilotChatConfigurationProvider from "../../../providers/CopilotChatConfigurationProvider.vue";
import { useCopilotKit } from "../../../providers/useCopilotKit";
import { CopilotChatDefaultLabels } from "../../../providers/types";
import CopilotChatMessageView from "../CopilotChatMessageView.vue";

function mountMessageView(
  messages: Message[],
  slotEntries: Parameters<typeof h>[2] = {},
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
                CopilotChatMessageView,
                { messages },
                slotEntries,
              ),
          },
        ),
    },
  });
}

describe("CopilotChatMessageView (Vue slots)", () => {
  it("renders default assistant and user components when no custom slots are passed", () => {
    const messages: Message[] = [
      {
        id: "user-default",
        role: "user",
        content: "hello user",
      } as Message,
      {
        id: "assistant-default",
        role: "assistant",
        content: "hello assistant",
      } as AssistantMessage,
    ];

    const wrapper = mountMessageView(messages);

    expect(wrapper.find('[data-message-id="user-default"]').exists()).toBe(true);
    expect(wrapper.find('[data-message-id="assistant-default"]').exists()).toBe(true);
    expect(
      wrapper
        .find(`[aria-label="${CopilotChatDefaultLabels.assistantMessageToolbarCopyMessageLabel}"]`)
        .exists(),
    ).toBe(true);
  });

  it("renders named activity slot when activity type matches", () => {
    const messages: Message[] = [
      {
        id: "act-1",
        role: "activity",
        activityType: "search-progress",
        content: { percent: 42 },
      } as ActivityMessage,
    ];

    const wrapper = mountMessageView(messages, {
      "activity-search-progress": ({ content }: { content: { percent: number } }) =>
        h("div", { "data-testid": "activity-rendered" }, `Progress: ${content.percent}`),
    });

    expect(wrapper.find("[data-testid=activity-rendered]").text()).toContain("42");
  });

  it("falls back to generic activity slot when named slot is absent", () => {
    const messages: Message[] = [
      {
        id: "act-2",
        role: "activity",
        activityType: "build-progress",
        content: { step: "compile" },
      } as ActivityMessage,
    ];

    const wrapper = mountMessageView(messages, {
      "activity-message": ({ activityType }: { activityType: string }) =>
        h("div", { "data-testid": "activity-fallback" }, activityType),
    });

    expect(wrapper.find("[data-testid=activity-fallback]").text()).toBe("build-progress");
  });

  it("renders built-in MCP fallback when no activity slot exists", async () => {
    const messages: Message[] = [
      {
        id: "act-mcp",
        role: "activity",
        activityType: "mcp-apps",
        content: {
          resourceUri: "ui://server/dashboard",
          serverHash: "abc123",
          result: {},
        },
      } as ActivityMessage,
    ];

    const wrapper = mountMessageView(messages);
    await nextTick();

    expect(wrapper.text()).toContain("No agent available to fetch resource");
  });

  it("uses named tool slot over generic tool slot", () => {
    const messages: Message[] = [
      {
        id: "assistant-1",
        role: "assistant",
        content: "",
        toolCalls: [
          {
            id: "tc-1",
            type: "function",
            function: {
              name: "search_docs",
              arguments: JSON.stringify({ query: "slots" }),
            },
          },
        ],
      } as AssistantMessage,
    ];

    const wrapper = mountMessageView(messages, {
      "tool-call-search_docs": ({ status }: { status: string }) =>
        h("div", { "data-testid": "tool-named" }, status),
      "tool-call": () => h("div", { "data-testid": "tool-fallback" }, "fallback"),
    });

    expect(wrapper.find("[data-testid=tool-named]").text()).toBe("inProgress");
    expect(wrapper.find("[data-testid=tool-fallback]").exists()).toBe(false);
  });

  it("renders generic tool slot when no named slot exists", () => {
    const messages: Message[] = [
      {
        id: "assistant-2",
        role: "assistant",
        content: "",
        toolCalls: [
          {
            id: "tc-2",
            type: "function",
            function: {
              name: "unknown_tool",
              arguments: JSON.stringify({ value: 1 }),
            },
          },
        ],
      } as AssistantMessage,
    ];

    const wrapper = mountMessageView(messages, {
      "tool-call": ({ name }: { name: string }) =>
        h("div", { "data-testid": "tool-fallback" }, name),
    });

    expect(wrapper.find("[data-testid=tool-fallback]").text()).toBe("unknown_tool");
  });

  it("provides before/after message scoped slots with run metadata", () => {
    const messages: Message[] = [
      {
        id: "assistant-3",
        role: "assistant",
        content: "hello",
      } as AssistantMessage,
    ];

    const wrapper = mountMessageView(messages, {
      "message-before": ({ runId }: { runId: string }) =>
        h("div", { "data-testid": "before-run" }, runId),
      "message-after": ({ runId }: { runId: string }) =>
        h("div", { "data-testid": "after-run" }, runId),
    });

    expect(wrapper.find("[data-testid=before-run]").text()).toBe(
      "missing-run-id:assistant-3",
    );
    expect(wrapper.find("[data-testid=after-run]").text()).toBe(
      "missing-run-id:assistant-3",
    );
  });

  it("passes complete status and result when tool message exists", () => {
    const messages: Message[] = [
      {
        id: "assistant-4",
        role: "assistant",
        content: "",
        toolCalls: [
          {
            id: "tc-3",
            type: "function",
            function: {
              name: "search_docs",
              arguments: JSON.stringify({ query: "done" }),
            },
          },
        ],
      } as AssistantMessage,
      {
        id: "tool-1",
        role: "tool",
        toolCallId: "tc-3",
        content: "finished",
      } as ToolMessage,
    ];

    const wrapper = mountMessageView(messages, {
      "tool-call-search_docs": ({ status, result }: { status: string; result?: string }) =>
        h("div", { "data-testid": "tool-complete" }, `${status}:${result}`),
    });

    expect(wrapper.find("[data-testid=tool-complete]").text()).toBe("complete:finished");
  });

  it("passes executing status when tool id is in executing set", () => {
    const messages: Message[] = [
      {
        id: "assistant-5",
        role: "assistant",
        content: "",
        toolCalls: [
          {
            id: "tc-4",
            type: "function",
            function: {
              name: "search_docs",
              arguments: JSON.stringify({ query: "run" }),
            },
          },
        ],
      } as AssistantMessage,
    ];

    const SetExecuting = defineComponent({
      setup() {
        const { executingToolCallIds } = useCopilotKit();
        executingToolCallIds.value = new Set(["tc-4"]);
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
                    CopilotChatMessageView,
                    { messages },
                    {
                      "tool-call-search_docs": ({ status }: { status: string }) =>
                        h("div", { "data-testid": "tool-executing" }, status),
                    },
                  ),
                ]),
            },
          ),
      },
    });

    expect(wrapper.find("[data-testid=tool-executing]").text()).toBe("executing");
  });
});
