import type { Step } from "../types";
import stepFactory from "./_stepFactory";

const modes = ["input_ready", "tools_ready"];

interface ChatCompletionCompatible {
    chat: {
        completions: {
            create: Function;
        }
    }
}
const createLLMStep = (llm: ChatCompletionCompatible, model: string)  => {
    const llmCall: Step = async l => {          
        const call_tools = l.context.tools.length ? l.context.tools : null;
        console.log('LLM> ', `(Tools: ${call_tools?.length || 0})`);
        
        const response = await llm.chat.completions.create({
            messages: l.context.messages,
            model,
            tools: call_tools,
        });
        
        const content = response.choices[0]?.message?.content;
        const tools_calls = response.choices[0]?.message?.tool_calls;
        
        if (content) {
            l.addMessage({role: "assistant", content: content});
            console.log(content);
            l.mode = "response_ready";
        }
        
        if (tools_calls?.length) {
            console.log('Tools called:', tools_calls.length);
            l.mode = "tools_running";
        }
    }

    return stepFactory({
        fn: llmCall,
        modes
    });
}

export default createLLMStep;