import { z } from "zod";
import type { VNodeChild } from "vue";
import type { VueToolCallRenderer } from "./vue-tool-call-renderer";
import type { VueToolCallRendererRenderProps } from "./vue-tool-call-renderer";

export function defineToolCallRenderer(def: {
  name: "*";
  render: (props: VueToolCallRendererRenderProps<unknown>) => VNodeChild;
  agentId?: string;
}): VueToolCallRenderer<unknown>;

export function defineToolCallRenderer<S extends z.ZodTypeAny>(def: {
  name: string;
  args: S;
  render: (props: VueToolCallRendererRenderProps<z.infer<S>>) => VNodeChild;
  agentId?: string;
}): VueToolCallRenderer<z.infer<S>>;

export function defineToolCallRenderer<S extends z.ZodTypeAny>(def: {
  name: string;
  args?: S;
  render: (props: VueToolCallRendererRenderProps<unknown>) => VNodeChild;
  agentId?: string;
}): VueToolCallRenderer<unknown> {
  const argsSchema = def.name === "*" && !def.args ? z.any() : def.args;
  return {
    name: def.name,
    args: argsSchema as z.ZodSchema<unknown>,
    render: def.render as VueToolCallRenderer<unknown>["render"],
    ...(def.agentId ? { agentId: def.agentId } : {}),
  };
}
