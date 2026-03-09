import type {
  AssistantMessage,
  Message,
  ToolCall,
  ToolMessage,
  UserMessage,
} from "@ag-ui/core";
import type { ToolCallStatus } from "@copilotkitnext/core";

export type CopilotChatInputMode = "input" | "transcribe" | "processing";

export type ToolsMenuItem = {
  label: string;
} & (
  | {
      action: () => void;
      items?: never;
    }
  | {
      action?: never;
      items: (ToolsMenuItem | "-")[];
    }
);

export interface CopilotChatUserMessageOnEditMessageProps {
  message: UserMessage;
}

export interface CopilotChatUserMessageOnSwitchToBranchProps {
  message: UserMessage;
  branchIndex: number;
  numberOfBranches: number;
}

export interface CopilotChatUserMessageMessageRendererSlotProps {
  message: UserMessage;
  content: string;
  isMultiline: boolean;
}

export interface CopilotChatUserMessageToolbarSlotProps {
  message: UserMessage;
  showBranchNavigation: boolean;
  hasEditAction: boolean;
}

export interface CopilotChatUserMessageCopyButtonSlotProps {
  onCopy: () => Promise<void>;
  copied: boolean;
  label: string;
}

export interface CopilotChatUserMessageEditButtonSlotProps {
  onEdit: () => void;
  label: string;
}

export interface CopilotChatUserMessageBranchNavigationSlotProps {
  branchIndex: number;
  numberOfBranches: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  goPrev: () => void;
  goNext: () => void;
}

export interface CopilotChatUserMessageLayoutSlotProps {
  message: UserMessage;
  content: string;
  isMultiline: boolean;
  showBranchNavigation: boolean;
  hasEditAction: boolean;
  branchIndex: number;
  numberOfBranches: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onCopy: () => Promise<void>;
  onEdit: () => void;
  goPrev: () => void;
  goNext: () => void;
  copied: boolean;
}

export interface CopilotChatAssistantMessageMessageRendererSlotProps {
  message: AssistantMessage;
  content: string;
}

export interface CopilotChatAssistantMessageToolbarSlotProps {
  message: AssistantMessage;
  shouldShowToolbar: boolean;
}

export interface CopilotChatAssistantMessageCopyButtonSlotProps {
  onCopy: () => Promise<void>;
  copied: boolean;
  label: string;
}

export interface CopilotChatAssistantMessageThumbsUpButtonSlotProps {
  onThumbsUp: () => void;
  label: string;
}

export interface CopilotChatAssistantMessageThumbsDownButtonSlotProps {
  onThumbsDown: () => void;
  label: string;
}

export interface CopilotChatAssistantMessageReadAloudButtonSlotProps {
  onReadAloud: () => void;
  label: string;
}

export interface CopilotChatAssistantMessageRegenerateButtonSlotProps {
  onRegenerate: () => void;
  label: string;
}

export interface CopilotChatAssistantMessageToolCallsViewSlotProps {
  message: AssistantMessage;
  messages: Message[];
}

export interface CopilotChatToolCallRenderSlotProps {
  name: string;
  args: unknown;
  status: ToolCallStatus;
  result: string | undefined;
  toolCall: ToolCall;
  toolMessage: ToolMessage | undefined;
}
