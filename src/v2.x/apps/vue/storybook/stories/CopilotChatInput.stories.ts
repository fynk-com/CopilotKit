import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { CopilotChatConfigurationProvider, CopilotChatInput } from "@copilotkitnext/vue";

const meta = {
  title: "UI/CopilotChatInput",
  component: CopilotChatInput,
  tags: ["autodocs"],
  decorators: [
    (story) => ({
      components: { story, CopilotChatConfigurationProvider },
      template: `
        <div
          style="
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            padding: 16px;
          "
        >
          <div style="width: 100%; max-width: 640px">
            <CopilotChatConfigurationProvider thread-id="storybook-thread">
              <story />
            </CopilotChatConfigurationProvider>
          </div>
        </div>
      `,
    }),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Vue parity story set for React `CopilotChatInput.stories.tsx`. WP1-supported scenarios render the real component; unsupported scenarios stay explicit placeholders until feature APIs are available.",
      },
    },
  },
} satisfies Meta<typeof CopilotChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function createUnsupportedPlaceholderStory(featureLabel: string): Story {
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
          <h3 style="margin: 0 0 8px; font-size: 16px; line-height: 1.2">UI/CopilotChatInput</h3>
          <p style="margin: 0; color: #475569">
            Placeholder for React parity: <strong>{{ featureLabel }}</strong>.
          </p>
          <p style="margin: 8px 0 0; color: #64748b">
            This scenario depends on feature APIs not yet available in the Vue port.
          </p>
        </section>
      `,
    }),
  };
}

export const Default: Story = {
  render: () => ({
    components: { CopilotChatInput },
    setup() {
      const value = ref("");
      const handleSubmitMessage = (submitted: string) => {
        console.log(`[Storybook] Submitted: ${submitted}`);
      };
      const handleAddFile = () => {
        console.log("[Storybook] Add file clicked");
      };
      const handleStartTranscribe = () => {
        console.log("[Storybook] Transcribe started");
      };
      return { value, handleSubmitMessage, handleAddFile, handleStartTranscribe };
    },
    template: `
      <CopilotChatInput
        v-model="value"
        :show-disclaimer="false"
        @submit-message="handleSubmitMessage"
        @add-file="handleAddFile"
        @start-transcribe="handleStartTranscribe"
      />
    `,
  }),
};

export const WithMenuItems: Story = createUnsupportedPlaceholderStory(
  "tools menu configuration",
);

export const TranscribeMode: Story = createUnsupportedPlaceholderStory(
  "transcription mode",
);

export const CustomButtons: Story = createUnsupportedPlaceholderStory(
  "button slot customization",
);

export const PrefilledText: Story = {
  render: () => ({
    components: { CopilotChatInput },
    setup() {
      const value = ref("Hello, this is a prefilled message!");
      const handleSubmitMessage = (submitted: string) => {
        console.log(`[Storybook] Submitted: ${submitted}`);
      };
      const handleAddFile = () => {
        console.log("[Storybook] Add file clicked");
      };
      const handleStartTranscribe = () => {
        console.log("[Storybook] Transcribe started");
      };
      return { value, handleSubmitMessage, handleAddFile, handleStartTranscribe };
    },
    template: `
      <CopilotChatInput
        v-model="value"
        :show-disclaimer="false"
        @submit-message="handleSubmitMessage"
        @add-file="handleAddFile"
        @start-transcribe="handleStartTranscribe"
      />
    `,
  }),
};

export const ExpandedTextarea: Story = createUnsupportedPlaceholderStory(
  "multiline auto-resize controls",
);

export const CustomStyling: Story = createUnsupportedPlaceholderStory(
  "slot/class style override API",
);

export const CustomLayout: Story = createUnsupportedPlaceholderStory(
  "render-prop custom layout composition",
);

export const ControlledInputExample: Story = {
  render: () => ({
    components: { CopilotChatInput },
    setup() {
      const value = ref("Draft message ready to send.");
      const handleSubmitMessage = (submitted: string) => {
        if (typeof window !== "undefined") {
          window.alert(`Submitted: ${submitted}`);
        }
        value.value = "";
      };
      const handleAddFile = () => {
        console.log("[Storybook] Add file clicked");
      };
      const handleStartTranscribe = () => {
        console.log("[Storybook] Transcribe started");
      };
      return { value, handleSubmitMessage, handleAddFile, handleStartTranscribe };
    },
    template: `
      <CopilotChatInput
        v-model="value"
        :clear-on-submit="false"
        :show-disclaimer="false"
        @submit-message="handleSubmitMessage"
        @add-file="handleAddFile"
        @start-transcribe="handleStartTranscribe"
      />
    `,
  }),
};
