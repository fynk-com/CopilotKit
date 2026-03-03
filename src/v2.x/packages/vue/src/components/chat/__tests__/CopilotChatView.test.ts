import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { mount } from "@vue/test-utils";
import type { Message } from "@ag-ui/core";
import type { Suggestion } from "@copilotkitnext/core";
import CopilotKitProvider from "../../../providers/CopilotKitProvider.vue";
import CopilotChatConfigurationProvider from "../../../providers/CopilotChatConfigurationProvider.vue";
import CopilotChatView from "../CopilotChatView.vue";

const chatMessages: Message[] = [
  {
    id: "user-1",
    role: "user",
    content: "Hello",
    timestamp: new Date(),
  },
  {
    id: "assistant-1",
    role: "assistant",
    content: "Hi! How can I help?",
    timestamp: new Date(),
  },
];

const suggestions: Suggestion[] = [
  { title: "Summarize", message: "Summarize this chat", isLoading: false },
  { title: "Next steps", message: "List next steps", isLoading: false },
];

function mountChatView(
  props: Record<string, unknown> = {},
) {
  return mount(CopilotKitProvider, {
    props: {
      runtimeUrl: "/api/copilotkit",
    },
    slots: {
      default: () =>
        h(
          CopilotChatConfigurationProvider,
          {
            threadId: "thread-1",
            agentId: "default",
            labels: {
              welcomeMessageText: "Welcome to Copilot",
              chatInputPlaceholder: "Type a message...",
            },
          },
          {
            default: () => h(CopilotChatView, props),
          },
        ),
    },
  });
}

describe("CopilotChatView", () => {
  it("renders welcome screen when there are no messages", () => {
    const wrapper = mountChatView({
      messages: [],
    });

    expect(wrapper.get("[data-testid='copilot-chat-view-welcome-screen']").text()).toContain(
      "Welcome to Copilot",
    );
  });

  it("can disable welcome screen for empty message threads", () => {
    const wrapper = mountChatView({
      messages: [],
      welcomeScreen: false,
    });

    expect(wrapper.find("[data-testid='copilot-chat-view-welcome-screen']").exists()).toBe(false);
    expect(wrapper.find("[data-testid='copilot-chat-view-input-container']").exists()).toBe(true);
  });

  it("renders messages and forwards input change/submit events", async () => {
    const onSubmitMessage = vi.fn();
    const onInputChange = vi.fn();
    const wrapper = mountChatView({
      messages: chatMessages,
      onSubmitMessage,
      onInputChange,
    });

    const textarea = wrapper.get("[data-testid='copilot-chat-input-textarea']");
    await textarea.setValue("   hello from vue chat view   ");
    await textarea.trigger("keydown", { key: "Enter" });

    expect(onInputChange).toHaveBeenCalledWith("   hello from vue chat view   ");
    expect(onSubmitMessage).toHaveBeenCalledWith("hello from vue chat view");

    const chatViewWrapper = wrapper.findComponent(CopilotChatView);
    expect(chatViewWrapper.emitted("input-change")).toEqual(
      expect.arrayContaining([["   hello from vue chat view   "], [""]]),
    );
    expect(chatViewWrapper.emitted("submit-message")?.at(0)).toEqual(["hello from vue chat view"]);
  });

  it("renders suggestions and forwards selection callback and event", async () => {
    const onSelectSuggestion = vi.fn();
    const wrapper = mountChatView({
      messages: chatMessages,
      suggestions,
      onSelectSuggestion,
    });

    const suggestionButtons = wrapper.findAll("[data-testid='copilot-chat-suggestion-pill']");
    expect(suggestionButtons).toHaveLength(2);

    await suggestionButtons[1]?.trigger("click");

    expect(onSelectSuggestion).toHaveBeenCalledWith(suggestions[1], 1);
    const chatViewWrapper = wrapper.findComponent(CopilotChatView);
    expect(chatViewWrapper.emitted("select-suggestion")?.at(0)).toEqual([suggestions[1], 1]);
  });

  it("hides transcribe action when no transcribe handler is configured", () => {
    const wrapper = mountChatView({
      messages: chatMessages,
    });

    expect(
      wrapper.find("[data-testid='copilot-chat-input-start-transcribe']").exists(),
    ).toBe(false);
  });

  it("enables transcribe action when handler is provided and emits start-transcribe", async () => {
    const onStartTranscribe = vi.fn();
    const wrapper = mountChatView({
      messages: chatMessages,
      onStartTranscribe,
    });

    const startTranscribeButton = wrapper.get("[data-testid='copilot-chat-input-start-transcribe']");
    await startTranscribeButton.trigger("click");

    expect(onStartTranscribe).toHaveBeenCalled();
    const chatViewWrapper = wrapper.findComponent(CopilotChatView);
    expect(chatViewWrapper.emitted("start-transcribe")?.length).toBe(1);
  });

  it("forwards cancel/finish transcribe handlers and emits audio finish event", async () => {
    const onCancelTranscribe = vi.fn();
    const onFinishTranscribe = vi.fn();
    const onFinishTranscribeWithAudio = vi.fn();
    const wrapper = mountChatView({
      messages: chatMessages,
      inputMode: "transcribe",
      onCancelTranscribe,
      onFinishTranscribe,
      onFinishTranscribeWithAudio,
    });

    await wrapper.get("[data-testid='copilot-chat-input-cancel-transcribe']").trigger("click");
    expect(onCancelTranscribe.mock.calls.length).toBeGreaterThanOrEqual(1);

    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.get("[data-testid='copilot-chat-input-finish-transcribe']").trigger("click");
    expect(onFinishTranscribe.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(onFinishTranscribeWithAudio.mock.calls.length).toBeGreaterThanOrEqual(1);

    const chatViewWrapper = wrapper.findComponent(CopilotChatView);
    expect((chatViewWrapper.emitted("cancel-transcribe")?.length ?? 0)).toBeGreaterThanOrEqual(1);
    expect((chatViewWrapper.emitted("finish-transcribe")?.length ?? 0)).toBeGreaterThanOrEqual(1);
    expect((chatViewWrapper.emitted("finish-transcribe-with-audio")?.length ?? 0)).toBeGreaterThanOrEqual(1);
  });
});
