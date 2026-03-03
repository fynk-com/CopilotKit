import type { UserMessage } from "@ag-ui/core";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { CopilotChatUserMessage } from "@copilotkitnext/vue";
import CopilotStoryLayout from "./CopilotStoryLayout.vue";

const simpleMessage: UserMessage = {
  id: "simple-user-message",
  content: "Hello! Can you help me build a React component?",
  role: "user",
};

const longMessage: UserMessage = {
  id: "long-user-message",
  content: `I need help with creating a complex React component.

1. Login and signup forms
2. Form validation
3. Mobile responsiveness
4. Social login`,
  role: "user",
};

const codeMessage: UserMessage = {
  id: "code-user-message",
  content: `I'm getting this error:
TypeError: Cannot read property 'map' of undefined

How can I fix this?`,
  role: "user",
};

const shortMessage: UserMessage = {
  id: "short-user-message",
  content: "What's the difference between useState and useReducer?",
  role: "user",
};

const meta = {
  title: "UI/CopilotChatUserMessage",
  component: CopilotChatUserMessage,
  args: {
    message: simpleMessage,
    onEditMessage: () => {
      console.log("[Storybook] Edit message");
    },
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (story) => ({
      components: { story, CopilotStoryLayout },
      template: `
        <CopilotStoryLayout>
          <section style="display:flex; justify-content:center; align-items:flex-start; min-height: calc(100vh - 120px); padding: 16px">
            <div style="width:100%; max-width:640px">
              <story />
            </div>
          </section>
        </CopilotStoryLayout>
      `,
    }),
  ],
} satisfies Meta<typeof CopilotChatUserMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

function unsupportedStory(featureLabel: string): Story {
  return {
    render: () => ({
      setup() {
        return { featureLabel };
      },
      template: `
        <section
          style="
            border: 1px dashed #cbd5e1;
            border-radius: 12px;
            background: white;
            padding: 16px;
            color: #0f172a;
          "
        >
          <h3 style="margin: 0 0 8px; font-size: 16px; line-height: 1.2">UI/CopilotChatUserMessage</h3>
          <p style="margin: 0; color: #475569">
            Placeholder for React parity: <strong>{{ featureLabel }}</strong>.
          </p>
          <p style="margin: 8px 0 0; color: #64748b">
            This scenario depends on slot/render APIs not yet available in the Vue port.
          </p>
        </section>
      `,
    }),
  };
}

export const Default: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      return { message: simpleMessage };
    },
    template: `<CopilotChatUserMessage :message="message" />`,
  }),
};

export const LongMessage: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      return { message: longMessage };
    },
    template: `<CopilotChatUserMessage :message="message" />`,
  }),
};

export const WithEditButton: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      const onEditMessage = () => {
        console.log("[Storybook] Edit message");
      };
      return { message: simpleMessage, onEditMessage };
    },
    template: `<CopilotChatUserMessage :message="message" :on-edit-message="onEditMessage" />`,
  }),
};

export const WithoutEditButton: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      return { message: simpleMessage };
    },
    template: `<CopilotChatUserMessage :message="message" />`,
  }),
};

export const CodeRelatedMessage: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      const onEditMessage = () => {
        console.log("[Storybook] Edit code message");
      };
      return { message: codeMessage, onEditMessage };
    },
    template: `<CopilotChatUserMessage :message="message" :on-edit-message="onEditMessage" />`,
  }),
};

export const ShortQuestion: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      const onEditMessage = () => {
        console.log("[Storybook] Edit short message");
      };
      return { message: shortMessage, onEditMessage };
    },
    template: `<CopilotChatUserMessage :message="message" :on-edit-message="onEditMessage" />`,
  }),
};

export const WithAdditionalToolbarItems: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      const onEditMessage = () => {
        console.log("[Storybook] Edit message");
      };
      return { message: simpleMessage, onEditMessage };
    },
    template: `
      <CopilotChatUserMessage :message="message" :on-edit-message="onEditMessage">
        <template #toolbar-items>
          <button
            type="button"
            style="height:32px; width:32px; border-radius:6px; border:1px solid #ddd; background:#f8f8f8"
            title="Attach file"
          >
            📎
          </button>
        </template>
      </CopilotChatUserMessage>
    `,
  }),
};

export const CustomAppearance: Story = unsupportedStory("custom slot appearance API");
export const CustomComponents: Story = unsupportedStory("component replacement slots");
export const UsingChildrenRenderProp: Story = unsupportedStory("children render prop");

export const WithBranchNavigation: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      const onSwitchToBranch = ({ branchIndex }: { branchIndex: number }) => {
        console.log("[Storybook] Switch branch", branchIndex);
      };
      return { message: simpleMessage, onSwitchToBranch };
    },
    template: `
      <CopilotChatUserMessage
        :message="message"
        :branch-index="1"
        :number-of-branches="3"
        :on-switch-to-branch="onSwitchToBranch"
      />
    `,
  }),
};

export const WithManyBranches: Story = {
  render: () => ({
    components: { CopilotChatUserMessage },
    setup() {
      const onSwitchToBranch = ({ branchIndex }: { branchIndex: number }) => {
        console.log("[Storybook] Switch branch", branchIndex);
      };
      return { message: simpleMessage, onSwitchToBranch };
    },
    template: `
      <CopilotChatUserMessage
        :message="message"
        :branch-index="4"
        :number-of-branches="8"
        :on-switch-to-branch="onSwitchToBranch"
      />
    `,
  }),
};
