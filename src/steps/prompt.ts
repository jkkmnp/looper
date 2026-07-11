import { createInterface } from "readline/promises";
import type { Step } from "../types";
import stepFactory from "./_stepFactory";

const modes = ["", "response_ready"];

interface ReadlineCompatible {
    question: (q:string) => Promise<string>;
}
const createPromptStep = (readline: ReadlineCompatible)  => {
    const prompt: Step = async l => {
        const input = await readline.question('> ');
        const content = input.trim();
        if (content.length) {
            l.addMessage({role: "user", content: input});
            l.mode = "input_ready";
        }
    }
    return stepFactory({
        fn: prompt,
        modes
    });
}

export default createPromptStep;