import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { mount } from "@vue/test-utils";
import CopilotChatConfigurationProvider from "../../../providers/CopilotChatConfigurationProvider.vue";
import CopilotChatInput from "../CopilotChatInput.vue";

function mountWithProvider(
  props: Record<string, unknown> = {},
  listeners: Record<string, (...args: unknown[]) => void> = {},
) {
  return mount(CopilotChatConfigurationProvider, {
    props: {
      threadId: "thread-1",
      agentId: "default",
      labels: {
        chatInputPlaceholder: "Ask anything",
        chatDisclaimerText: "Double-check important answers.",
      },
    },
    slots: {
      default: () => h(CopilotChatInput, { ...props, ...listeners }),
    },
  });
}

describe("CopilotChatInput", () => {
  it("resolves placeholder from provider labels", () => {
    const wrapper = mountWithProvider();
    const textarea = wrapper.get("[data-testid=copilot-chat-input-textarea]");
    expect(textarea.attributes("placeholder")).toBe("Ask anything");
  });

  it("submits trimmed value and clears in controlled mode", async () => {
    const onSubmitMessage = vi.fn();
    const onUpdateModelValue = vi.fn();
    const wrapper = mountWithProvider(
      { modelValue: "  hello world  " },
      {
        onSubmitMessage,
        "onUpdate:modelValue": onUpdateModelValue,
      },
    );

    await wrapper.get("[data-testid=copilot-chat-input-textarea]").trigger("keydown.enter");

    expect(onSubmitMessage).toHaveBeenCalledWith("hello world");
    expect(onUpdateModelValue).toHaveBeenCalledWith("");
  });

  it("does not submit on Shift+Enter", async () => {
    const onSubmitMessage = vi.fn();
    const wrapper = mountWithProvider(
      { modelValue: "hello" },
      { onSubmitMessage },
    );

    await wrapper
      .get("[data-testid=copilot-chat-input-textarea]")
      .trigger("keydown.enter", { shiftKey: true });

    expect(onSubmitMessage).not.toHaveBeenCalled();
  });

  it("does not submit whitespace-only input", async () => {
    const onSubmitMessage = vi.fn();
    const onUpdateModelValue = vi.fn();
    const wrapper = mountWithProvider(
      { modelValue: "   " },
      {
        onSubmitMessage,
        "onUpdate:modelValue": onUpdateModelValue,
      },
    );

    await wrapper.get("[data-testid=copilot-chat-input-textarea]").trigger("keydown.enter");
    await wrapper.get("[data-testid=copilot-chat-input-send]").trigger("click");

    expect(onSubmitMessage).not.toHaveBeenCalled();
    expect(onUpdateModelValue).not.toHaveBeenCalled();
  });

  it("clears local state after submit in uncontrolled mode", async () => {
    const onSubmitMessage = vi.fn();
    const onUpdateModelValue = vi.fn();
    const wrapper = mountWithProvider(
      {},
      {
        onSubmitMessage,
        "onUpdate:modelValue": onUpdateModelValue,
      },
    );
    const textarea = wrapper.get(
      "[data-testid=copilot-chat-input-textarea]",
    );

    await textarea.setValue("hello");
    await textarea.trigger("keydown.enter");

    expect(onSubmitMessage).toHaveBeenCalledWith("hello");
    expect((textarea.element as HTMLTextAreaElement).value).toBe("");
    expect(onUpdateModelValue).toHaveBeenCalledWith("");
  });

  it("blocks submit while IME composition is active", async () => {
    const onSubmitMessage = vi.fn();
    const wrapper = mountWithProvider(
      { modelValue: "hello" },
      { onSubmitMessage },
    );
    const textarea = wrapper.get("[data-testid=copilot-chat-input-textarea]");

    await textarea.trigger("compositionstart");
    await textarea.trigger("keydown.enter");
    expect(onSubmitMessage).not.toHaveBeenCalled();

    await textarea.trigger("compositionend");
    await textarea.trigger("keydown.enter");
    expect(onSubmitMessage).toHaveBeenCalledWith("hello");
  });

  it("blocks submission when disabled", async () => {
    const onSubmitMessage = vi.fn();
    const wrapper = mountWithProvider(
      { modelValue: "hello", disabled: true },
      { onSubmitMessage },
    );

    const textarea = wrapper.get("[data-testid=copilot-chat-input-textarea]");
    const sendButton = wrapper.get("[data-testid=copilot-chat-input-send]");

    expect(textarea.attributes("disabled")).toBeDefined();
    expect(sendButton.attributes("disabled")).toBeDefined();

    await textarea.trigger("keydown.enter");
    await sendButton.trigger("click");
    expect(onSubmitMessage).not.toHaveBeenCalled();
  });

  it("renders disclaimer by default and hides it when disabled", () => {
    const withDisclaimer = mountWithProvider();
    expect(
      withDisclaimer.get("[data-testid=copilot-chat-input-disclaimer]").text(),
    ).toBe("Double-check important answers.");

    const withoutDisclaimer = mountWithProvider({ showDisclaimer: false });
    expect(
      withoutDisclaimer.find("[data-testid=copilot-chat-input-disclaimer]").exists(),
    ).toBe(false);
  });

  it("shows stop button only while running and emits stop", async () => {
    const onStop = vi.fn();

    const hiddenWrapper = mountWithProvider(
      { isRunning: false },
      { onStop },
    );
    expect(hiddenWrapper.find("[data-testid=copilot-chat-input-stop]").exists()).toBe(false);

    const visibleWrapper = mountWithProvider(
      { isRunning: true, showStopButton: true },
      { onStop },
    );
    await visibleWrapper.get("[data-testid=copilot-chat-input-stop]").trigger("click");
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("renders add button disabled without handler and emits add-file when provided", async () => {
    const withoutHandler = mountWithProvider();
    const disabledAddButton = withoutHandler.get("[data-testid=copilot-chat-input-add]");
    expect(disabledAddButton.attributes("disabled")).toBeDefined();

    const onAddFile = vi.fn();
    const withHandler = mountWithProvider({}, { onAddFile });
    const enabledAddButton = withHandler.get("[data-testid=copilot-chat-input-add]");
    expect(enabledAddButton.attributes("disabled")).toBeUndefined();
    await enabledAddButton.trigger("click");
    expect(onAddFile).toHaveBeenCalledTimes(1);
  });

  it("shows start transcribe button only when handler is provided and emits start-transcribe", async () => {
    const withoutHandler = mountWithProvider();
    expect(
      withoutHandler.find("[data-testid=copilot-chat-input-start-transcribe]").exists(),
    ).toBe(false);

    const onStartTranscribe = vi.fn();
    const withHandler = mountWithProvider({}, { onStartTranscribe });
    const startButton = withHandler.get("[data-testid=copilot-chat-input-start-transcribe]");
    await startButton.trigger("click");
    expect(onStartTranscribe).toHaveBeenCalledTimes(1);
  });

  it("supports controlled typing via update:modelValue", async () => {
    const Harness = defineComponent({
      setup() {
        const value = ref("");
        return () =>
          h(CopilotChatConfigurationProvider, { threadId: "thread-1", agentId: "default" }, {
            default: () =>
              h(CopilotChatInput, {
                modelValue: value.value,
                "onUpdate:modelValue": (next: string) => {
                  value.value = next;
                },
              }),
          });
      },
    });

    const wrapper = mount(Harness);
    const textarea = wrapper.get("[data-testid=copilot-chat-input-textarea]");
    await textarea.setValue("draft");
    expect((textarea.element as HTMLTextAreaElement).value).toBe("draft");
  });
});
