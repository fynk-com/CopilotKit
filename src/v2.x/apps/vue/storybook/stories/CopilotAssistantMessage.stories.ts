import type { AssistantMessage } from "@ag-ui/core";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { CopilotChatAssistantMessage } from "@copilotkitnext/vue";
import CopilotStoryLayout from "./CopilotStoryLayout.vue";

const simpleMessage: AssistantMessage = {
  id: "simple-message",
  content: "Hello! How can I help you today?",
  timestamp: new Date(),
  role: "assistant",
};

const markdownTestMessage: AssistantMessage = {
  id: "test-message",
  content: `# Markdown Test Message

This message includes bold, inline code, lists, and code blocks.

- Item one
- Item two

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}\`;
}
\`\`\``,
  timestamp: new Date(),
  role: "assistant",
};

const codeBlocksMessage: AssistantMessage = {
  id: "code-message",
  content: `\`\`\`javascript
const value = 42;
console.log(value);
\`\`\`

\`\`\`python
print("hello")
\`\`\``,
  timestamp: new Date(),
  role: "assistant",
};

const meta = {
  title: "UI/CopilotChatAssistantMessage",
  component: CopilotChatAssistantMessage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Vue parity story set for React `CopilotAssistantMessage.stories.tsx`. Markdown rendering remains a known parity gap while slot contracts are aligned.",
      },
    },
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
} satisfies Meta<typeof CopilotChatAssistantMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { CopilotChatAssistantMessage },
    setup() {
      return { message: simpleMessage };
    },
    template: `<CopilotChatAssistantMessage :message="message" :messages="[message]" />`,
  }),
};

export const TestAllMarkdownFeatures: Story = {
  render: () => ({
    components: { CopilotChatAssistantMessage },
    setup() {
      return { message: markdownTestMessage };
    },
    template: `<CopilotChatAssistantMessage :message="message" :messages="[message]" />`,
  }),
};

export const WithToolbarButtons: Story = {
  render: () => ({
    components: { CopilotChatAssistantMessage },
    setup() {
      const onThumbsUp = () => {
        console.log("[Storybook] Thumbs up");
      };
      const onThumbsDown = () => {
        console.log("[Storybook] Thumbs down");
      };
      const onReadAloud = () => {
        console.log("[Storybook] Read aloud");
      };
      const onRegenerate = () => {
        console.log("[Storybook] Regenerate");
      };
      return { message: simpleMessage, onThumbsUp, onThumbsDown, onReadAloud, onRegenerate };
    },
    template: `
      <CopilotChatAssistantMessage
        :message="message"
        :messages="[message]"
        :on-thumbs-up="onThumbsUp"
        :on-thumbs-down="onThumbsDown"
        :on-read-aloud="onReadAloud"
        :on-regenerate="onRegenerate"
      />
    `,
  }),
};

export const WithAdditionalToolbarItems: Story = {
  render: () => ({
    components: { CopilotChatAssistantMessage },
    setup() {
      const onThumbsUp = () => {
        console.log("[Storybook] Thumbs up");
      };
      return { message: simpleMessage, onThumbsUp };
    },
    template: `
      <CopilotChatAssistantMessage :message="message" :messages="[message]" :on-thumbs-up="onThumbsUp">
        <template #toolbar-items>
          <button
            type="button"
            style="height:32px; width:32px; border-radius:6px; border:1px solid #ddd; background:#f8f8f8"
            title="Pin message"
          >
            📌
          </button>
        </template>
      </CopilotChatAssistantMessage>
    `,
  }),
};

export const CodeBlocksWithLanguages: Story = {
  render: () => ({
    components: { CopilotChatAssistantMessage },
    setup() {
      return { message: codeBlocksMessage };
    },
    template: `<CopilotChatAssistantMessage :message="message" :messages="[message]" />`,
  }),
};
