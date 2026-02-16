<script setup lang="ts">
import type { AssistantMessage, Message, ToolCall, ToolMessage } from "@ag-ui/core";
import { ToolCallStatus } from "@copilotkitnext/core";
import { partialJSONParse } from "@copilotkitnext/shared";
import { useCopilotKit } from "../../providers/useCopilotKit";

interface ToolCallRenderProps {
  name: string;
  args: unknown;
  status: ToolCallStatus;
  result: string | undefined;
  toolCall: ToolCall;
  toolMessage: ToolMessage | undefined;
}

const props = withDefaults(
  defineProps<{
    message: AssistantMessage;
    messages?: Message[];
  }>(),
  {
    messages: () => [],
  },
);

defineSlots<{
  "tool-call"?: (props: ToolCallRenderProps) => unknown;
  [key: `tool-call-${string}`]: (props: ToolCallRenderProps) => unknown;
}>();

const { executingToolCallIds } = useCopilotKit();

function findToolMessage(toolCallId: string): ToolMessage | undefined {
  return props.messages.find(
    (message) => message.role === "tool" && (message as ToolMessage).toolCallId === toolCallId,
  ) as ToolMessage | undefined;
}

function getSlotName(toolName: string): `tool-call-${string}` {
  return `tool-call-${toolName}`;
}

function getRenderProps(toolCall: ToolCall): ToolCallRenderProps {
  const toolMessage = findToolMessage(toolCall.id);
  const parsedArgs = partialJSONParse(toolCall.function.arguments);

  if (toolMessage) {
    return {
      name: toolCall.function.name,
      args: parsedArgs,
      status: ToolCallStatus.Complete,
      result: toolMessage.content,
      toolCall,
      toolMessage,
    };
  }

  const isExecuting = executingToolCallIds.value.has(toolCall.id);
  return {
    name: toolCall.function.name,
    args: parsedArgs,
    status: isExecuting ? ToolCallStatus.Executing : ToolCallStatus.InProgress,
    result: undefined,
    toolCall,
    toolMessage: undefined,
  };
}
</script>

<template>
  <template v-for="toolCall in (message.toolCalls ?? [])" :key="toolCall.id">
    <slot :name="getSlotName(toolCall.function.name)" v-bind="getRenderProps(toolCall)">
      <slot name="tool-call" v-bind="getRenderProps(toolCall)" />
    </slot>
  </template>
</template>
