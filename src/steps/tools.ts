import type { Looper, Step } from "../types";
import type { Tool } from "../tools/_toolFactory";
import stepFactory from "./_stepFactory";

let registeredTools: Tool[] = [];

const executeTools: Step = async (l: Looper) => {
    const lastMessage = l.getLastMessage();
    const toolCalls = lastMessage?.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
        l.mode = "tools_ready";
        return;
    }

    const toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);
            const toolCallId = toolCall.id;
            // console.log(`- ${toolName} called`);

            const tool = registeredTools.find(t => t.definition.function.name === toolName);

            if (!tool) {
                return {
                    role: "tool",
                    tool_call_id: toolCallId,
                    content: JSON.stringify({ error: true, message: `Tool "${toolName}" not found` })
                };
            }

            try {
                const result = await tool.execute(toolArgs);
                return {
                    role: "tool",
                    tool_call_id: toolCallId,
                    content: JSON.stringify(result)
                };
            } catch (error) {
                return {
                    role: "tool",
                    tool_call_id: toolCallId,
                    content: JSON.stringify({ error: true, message: error instanceof Error ? error.message : String(error) })
                };
            }
        })
    );

    toolResults.forEach(result => l.addMessage(result));
    l.mode = "tools_ready";
};

const initTools: Step = async (l: Looper) => {
    registeredTools.forEach(tool => {
        l.context.tools.push(tool.definition);
    });
};

export function createToolsStep(tools: Tool[]): Step {
    registeredTools = tools;

    const combinedStep: Step = async (l: Looper) => {
        if (l.mode === "init") {
            await initTools(l);
        } else if (l.mode === "tools_running") {
            await executeTools(l);
        }
        await l.next();
    };

    return combinedStep;
}
