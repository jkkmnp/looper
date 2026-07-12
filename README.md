# Looper - the loop composer

Looper is a minimalistic framework for building interactive loops that execute a series of steps.

A step is a small, reusable piece of logic that is invoked when the loop is in one of its designated modes.

The loop can change mode between steps, allowing you to write very concise, event‑driven programs.

## Features
- Modal step execution – steps run only when the loop is in a certain mode.
- Step factory – easily create new steps in one place (src/steps/_stepFactory.ts).
- Extensible – add custom steps, e.g. logging, file I/O, or arbitrary calculations.
- TypeScript first – the whole codebase is typed, making it straightforward to reason about data flow.

## Mini roadmap
- v0.2 - Support for tool calls
- v0.3 - Defined standard modes
...
- v1.0 - Convert looper to a class

## Quick start

The example creates a looper that takes user input and calls an LLM:

```typescript
// ... imports from looper's src/
import OpenAI from 'openai';
import { createInterface } from 'readline/promises';

const prompt = createPromptStep(createInterface({
  input: process.stdin,
  output: process.stdout
}));
const llm = createLLMStep(new OpenAI({...}), "<model>");

const looper = createLooper();
looper.add(prompt); // expects readline/promises compatible interface
looper.add(llm); // expects openai compatible interface
// start the loop
await looper.next();
```

Save the file as `myloop.ts` and run the script to start the interactive loop.

### Adding more steps

Logging a welcome message and setting a system prompt:

```typescript
// ...continued from "Quick start"

const looper = createLooper();

// Add welcome message
looper.add(createLogStep("=== WELCOME TO LOOPER ===", ["init"]));
// Add system prompt
looper.add(createSystemStep('Only reply with terse, short answers.'));

looper.add(prompt);
looper.add(llm);
await looper.next();
```

Now freely modify the steps and their modes to adapt to your own flow.

## Creating a custom step

Steps should always follow the `Step` signature and should call the loop's next step.
The best way to create a new Step is to use the factory building function. The factory function helps create steps that run in designated modes and always call the next step.

Example of creating a step that logs the length of the last message from the LLM assistant:

```typescript
import type { Step } from '../types';
import stepFactory from './_stepFactory';

const responseLengthLogger = stepFactory({
  fn: l => {
    const last = l.getLastMessage();
    if (last?.role === 'assistant') {
      const len = last.content.length;
      console.log(`LLM response length: ${len}`);
    }
  },
  modes: ['response_ready']
});

export default reponseLengthLogger;
```

In your looper setup, you would add this step after the LLM step:

```typescript
looper.add(llm);
looper.add(reponseLengthLogger);
```

## Get creative with use cases

Loopy is slightly opinionated and intended towards user promopt + llm call use cases. But, with custom steps and freedom to switch things up, the looper bends to completely different uses.

Here's FizzBuzz implemented with the looper:

```typescript
const looper = createLooper();

looper.add(async l => {
    if (l.mode === "init") {
        l.metadata.counter = 0;
    } else {
        l.metadata.counter++;

        var output = "";
        if (l.metadata.counter % 3 == 0) {
            output += "Fizz";
        }
        if (l.metadata.counter % 5 == 0) {
            output += "Buzz";
        }
        console.log(output.length ? output : l.metadata.counter);
    }
    await l.next();
});
// stop after 100
looper.add(async l => {
    if (l.metadata.counter >= 100) {
        l.mode = "exit";
    }
    await l.next();
});

await looper.next();
```

Here's a basic task list for the LLM to process:

```typescript
const looper = createLooper();

const tasks = [
    "Calculate 500 times two",
    "Estimate the flight time from Paris to New York",
    "Rank these names from most common to least: Robert, John, Steven"
];
const taskPrompter = stepFactory({
    fn: async l => {
        const task = tasks.shift();
        if (task) {
            l.addMessage({role:"user", content:task});
            l.mode = "input_ready";
        } else {
            l.mode = "exit";
        }
    },
    modes: ["", "response_ready"]
});

looper.add(taskPrompter);
looper.add(llm); // see "Quick start" for llm step definition example
await looper.next();
```

## Folder layout

```
src/
├─ steps/
│   ├─ _stepFactory.ts   – helper to create modal steps
│   ├─ log.ts            – simple console log step
│   ├─ system.ts         – inject system prompt
│   ├─ prompt.ts         – interactive prompt
│   └─ llm.ts            – LLM reply step
├─ looper.ts             – core loop logic
└─ types.ts              – shared types
```