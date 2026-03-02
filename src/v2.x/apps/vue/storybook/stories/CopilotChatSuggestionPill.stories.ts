import { defineComponent, h, markRaw } from "vue";
import type { Component } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ArrowRight, Sparkles } from "lucide-vue-next";
import { CopilotChatSuggestionPill } from "@copilotkitnext/vue";

type SuggestionPillStoryArgs = {
  label: string;
  isLoading?: boolean;
  icon?: Component;
};

const SparklesIcon = markRaw(
  defineComponent({
    name: "SparklesIcon",
    render() {
      return h(Sparkles, { class: "h-4 w-4", "aria-hidden": "true" });
    },
  }),
);

const ArrowRightIcon = markRaw(
  defineComponent({
    name: "ArrowRightIcon",
    render() {
      return h(ArrowRight, { class: "h-4 w-4", "aria-hidden": "true" });
    },
  }),
);

const meta = {
  title: "UI/CopilotChatSuggestionPill",
  component: CopilotChatSuggestionPill,
  args: {
    label: "Draft a project brief",
  },
  parameters: {
    layout: "centered",
  },
  render: (args: SuggestionPillStoryArgs) => ({
    components: { CopilotChatSuggestionPill },
    setup() {
      return { args };
    },
    template: `
      <CopilotChatSuggestionPill :icon="args.icon" :is-loading="args.isLoading">
        {{ args.label }}
      </CopilotChatSuggestionPill>
    `,
  }),
} satisfies Meta<SuggestionPillStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: SparklesIcon,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithArrow: Story = {
  args: {
    icon: ArrowRightIcon,
    label: "Summarize notes into next steps",
  },
};
