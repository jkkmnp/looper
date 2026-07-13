export type ToolDefinition = {
    type: string,
    function: {
        name: string,
        strict: boolean,
        description: string,
        parameters: {
            type: string,
            properties: object,
            required: string[],
            additionalProperties: boolean
        }
    }
};

export type Message = {
  type?: string,
  role: string,
  content?: string,
  name?: string,
  tool_calls?: Array<any>,
  tool_call_id?: any
}
export interface Step {
    (looper: Looper): void;
}

export interface Context {
  messages: Array<Message>;
  tools: Array<ToolDefinition>;
  // system: string;
}

export interface Looper {
  steps: Array<Step>;
  currentIndex: number;
  cycleSteps: number;
  cleanUp: Function[];
  context: Context;
  metadata: any;
  mode: string;
  add: (step: Step) => void;
  next: () => void;
  // repeat?: () => void;
  rewind: () => void;
  stopLoop: () => void;
  getLastMessage: () => Message | undefined;
  addMessage: (m: Message) => void;
}