import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import type { UserMessage } from "@ag-ui/core";
import { CopilotChatDefaultLabels } from "../../../providers/types";
import CopilotChatUserMessage from "../CopilotChatUserMessage.vue";

describe("CopilotChatUserMessage", () => {
  it("renders flattened text content from structured message parts", () => {
    const message = {
      id: "user-1",
      role: "user",
      timestamp: new Date(),
      content: [
        { type: "text", text: "Line one" },
        { type: "tool-call", id: "ignore" },
        { type: "text", text: "Line two" },
      ],
    } as unknown as UserMessage;

    const wrapper = mount(CopilotChatUserMessage, {
      props: {
        message,
      },
    });

    expect(wrapper.text()).toContain("Line one");
    expect(wrapper.text()).toContain("Line two");
    expect(wrapper.text()).not.toContain("ignore");
  });

  it("emits and invokes edit handler when edit button is clicked", async () => {
    const onEditMessage = vi.fn();
    const message: UserMessage = {
      id: "user-2",
      role: "user",
      timestamp: new Date(),
      content: "Can you edit this?",
    };

    const wrapper = mount(CopilotChatUserMessage, {
      props: {
        message,
        onEditMessage,
      },
    });

    const editButton = wrapper.find(
      `[aria-label="${CopilotChatDefaultLabels.userMessageToolbarEditMessageLabel}"]`,
    );
    expect(editButton.exists()).toBe(true);

    await editButton.trigger("click");

    expect(onEditMessage).toHaveBeenCalledWith({ message });
    expect(wrapper.emitted("edit-message")?.[0]).toEqual([{ message }]);
  });

  it("hides edit button when edit callback is not provided", () => {
    const message: UserMessage = {
      id: "user-3",
      role: "user",
      timestamp: new Date(),
      content: "No edit action",
    };

    const wrapper = mount(CopilotChatUserMessage, {
      props: {
        message,
      },
    });

    expect(
      wrapper.find(`[aria-label="${CopilotChatDefaultLabels.userMessageToolbarEditMessageLabel}"]`).exists(),
    ).toBe(false);
  });

  it("renders branch navigation and emits switch payload", async () => {
    const onSwitchToBranch = vi.fn();
    const message: UserMessage = {
      id: "user-4",
      role: "user",
      timestamp: new Date(),
      content: "Branch message",
    };

    const wrapper = mount(CopilotChatUserMessage, {
      props: {
        message,
        branchIndex: 1,
        numberOfBranches: 3,
        onSwitchToBranch,
      },
    });

    expect(wrapper.text()).toContain("2/3");

    const nextButton = wrapper.find('[aria-label="Next branch"]');
    await nextButton.trigger("click");

    expect(onSwitchToBranch).toHaveBeenCalledWith({
      branchIndex: 2,
      numberOfBranches: 3,
      message,
    });
    expect(wrapper.emitted("switch-to-branch")?.[0]).toEqual([
      {
        branchIndex: 2,
        numberOfBranches: 3,
        message,
      },
    ]);
  });

  it("disables unavailable branch navigation controls", () => {
    const message: UserMessage = {
      id: "user-5",
      role: "user",
      timestamp: new Date(),
      content: "First branch",
    };

    const wrapper = mount(CopilotChatUserMessage, {
      props: {
        message,
        branchIndex: 0,
        numberOfBranches: 2,
        onSwitchToBranch: vi.fn(),
      },
    });

    expect(wrapper.find('[aria-label="Previous branch"]').attributes("disabled")).toBeDefined();
    expect(wrapper.find('[aria-label="Next branch"]').attributes("disabled")).toBeUndefined();
  });
});
