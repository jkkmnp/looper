import stepFactory from "./_stepFactory";

const createLogStep = (message: string, modes: string[] = []) => {
    return stepFactory({
        fn:  l => {
            console.log(message);
        },
        modes
    });
}
export default createLogStep;