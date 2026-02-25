import type { AssistantMessage, Message, ToolMessage } from "@ag-ui/core";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { CopilotChatMessageView } from "@copilotkitnext/vue";
import CopilotStoryLayout from "./CopilotStoryLayout.vue";

const defaultMessages: Message[] = [
  {
    id: "user-1",
    role: "user",
    content: "Hello! Can you help me understand how React hooks work?",
    timestamp: new Date(),
  },
  {
    id: "assistant-1",
    role: "assistant",
    content: `React hooks are functions that let you use state and other React features in functional components.

- useState manages local state
- useEffect handles side effects
- useContext accesses context values`,
    timestamp: new Date(),
  },
  {
    id: "user-2",
    role: "user",
    content: "Yes, could you explain useState with a simple example?",
    timestamp: new Date(),
  },
  {
    id: "assistant-2",
    role: "assistant",
    content: `Absolutely. Here's a simple example:

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
    timestamp: new Date(),
  },
];

const toolCallMessages: Message[] = [
  {
    id: "user-1",
    role: "user",
    content: "Search docs for Vue slots and summarize results.",
    timestamp: new Date(),
  },
  {
    id: "assistant-1",
    role: "assistant",
    content: "I'll search and summarize.",
    timestamp: new Date(),
    toolCalls: [
      {
        id: "tc-1",
        type: "function",
        function: {
          name: "search_docs",
          arguments: JSON.stringify({
            query: "Vue slot rendering parity",
            filters: ["official", "latest"],
          }),
        },
      },
      {
        id: "tc-2",
        type: "function",
        function: {
          name: "summarize",
          arguments: JSON.stringify({
            format: "bullet-points",
          }),
        },
      },
    ],
  } as AssistantMessage,
  {
    id: "tool-1",
    role: "tool",
    toolCallId: "tc-1",
    content: "Found 8 relevant documents.",
  } as ToolMessage,
];

const meta = {
  title: "UI/CopilotChatMessageView",
  component: CopilotChatMessageView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (story) => ({
      components: { story, CopilotStoryLayout },
      template: `
        <CopilotStoryLayout>
          <section style="height: calc(100vh - 120px); overflow: auto; padding: 24px 24px 40px">
            <story />
          </section>
        </CopilotStoryLayout>
      `,
    }),
  ],
} satisfies Meta<typeof CopilotChatMessageView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { CopilotChatMessageView },
    setup() {
      return { messages: defaultMessages };
    },
    template: `
      <CopilotChatMessageView :messages="messages" />
    `,
  }),
};

export const ShowCursor: Story = {
  render: () => ({
    components: { CopilotChatMessageView },
    setup() {
      return { messages: [defaultMessages[0]], isRunning: true };
    },
    template: `
      <CopilotChatMessageView :messages="messages" :is-running="isRunning" />
    `,
  }),
};

export const WithToolCalls: Story = {
  render: () => ({
    components: { CopilotChatMessageView },
    setup() {
      return { messages: toolCallMessages };
    },
    template: `
      <CopilotChatMessageView :messages="messages">
        <template #tool-call-search_docs="{ args, status, result }">
          <div
            style="margin: 8px 0; border: 1px solid #cce0ff; border-radius: 8px; padding: 10px 12px; background: #f0f4f8"
          >
            <div style="font-weight: 600">🔍 Search Tool</div>
            <div style="font-size: 14px; color: #4a5565">Query: {{ args.query }}</div>
            <div style="margin-top: 4px; font-size: 14px; color: #2563eb">Status: {{ status }}</div>
            <div v-if="result" style="margin-top: 4px; font-size: 14px; color: #166534">Result: {{ result }}</div>
          </div>
        </template>

        <template #tool-call="{ name, status }">
          <div
            style="margin: 8px 0; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; background: #f8f8f8"
          >
            <div style="font-weight: 600">🔧 {{ name }}</div>
            <div style="margin-top: 4px; font-size: 14px; color: #4a5565">Status: {{ status }}</div>
          </div>
        </template>
      </CopilotChatMessageView>
    `,
  }),
};
