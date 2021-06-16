// This is how you can add a webworker in typescript, under a module and then you have the ability to import it.
// For more information: https://www.jameslmilner.com/post/workers-with-webpack-and-typescript/
declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}