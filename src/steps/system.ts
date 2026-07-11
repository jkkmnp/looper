import stepFactory from "./_stepFactory";

export default function createSystemStep(system: string) {
    return stepFactory({
        fn:  l => {
            console.debug('Adding system prompt:', system);
            l.context.messages.push({ role: "system", content: system });
        },
        modes: ["init"]
    });
}
