import type { Looper, Message, Step } from "./types";

export const createLooper = (): Looper => {
  const looper: Looper = {
    steps: [],
    currentIndex: 0,
    cycleSteps: 0,
    cleanUp: [],
    context: {
      messages: [],
      tools: []
    },
    metadata: {},
    mode: "init", // create in init mode
    add: function(step: Step) {
      this.steps.push(step);
    },
    next: async function() {
      if (this.currentIndex < this.steps.length) {
        const step = this.steps[this.currentIndex];
        this.currentIndex++;
        if (step) {
          step(this);
        } else {
          console.error('Next step expected but not found!');
          this.stopLoop();
        }
      } else {
        this.rewind();
      }
    },
    // repeat: async function() {
    //   this.currentIndex--; // watch out for negative
    //   await this.next();
    // },
    rewind: async function() {
      // reset modes where needed
      if (this.mode === "init") {
        this.mode = "";
      }
      else if (this.mode === "exit") {
        return this.stopLoop();
      }
      this.currentIndex = 0;
      await this.next();
    },
    stopLoop: function() {
      console.log('Exiting looper (with clean-up).');
      this.cleanUp.forEach(fn => fn());
      return;
    },
    getLastMessage: function() { return this.context.messages[this.context.messages.length-1] },
    addMessage: function(m: Message) { this.context.messages.push(m); }
  };
  
  return looper;
};