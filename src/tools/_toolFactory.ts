import type { ToolDefinition } from "../types";

export type Tool = {
    definition: ToolDefinition,
    execute: (args: any) => Promise<any>
};

export type ToolFactoryProps = {
    name: string,
    description: string,
    parameters: {
        type: string,
        properties: object,
        required: string[],
        additionalProperties: boolean
    },
    execute: (args: any) => Promise<any>
};

export default function toolFactory({ name, description, parameters, execute }: ToolFactoryProps): Tool {
    const definition: ToolDefinition = {
        type: "function",
        function: {
            name,
            strict: true,
            description,
            parameters
        }
    };

    return {
        definition,
        execute
    };
}
