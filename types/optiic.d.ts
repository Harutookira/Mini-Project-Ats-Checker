declare module 'optiic' {
  interface OptiicOptions {
    apiKey: string;
  }

  interface OptiicProcessOptions {
    image: string;
    mode: string;
  }

  interface OptiicProcessResult {
    text: string;
  }

  class Optiic {
    constructor(options: OptiicOptions);
    process(options: OptiicProcessOptions): Promise<OptiicProcessResult>;
  }

  export default Optiic;
}