import { LinearClient } from "@linear/sdk";

let _linearClient: LinearClient | null = null;

export const getLinearClient = (): LinearClient => {
  if (!_linearClient) {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      throw new Error("LINEAR_API_KEY environment variable is not set");
    }
    _linearClient = new LinearClient({ apiKey });
  }
  return _linearClient;
};

// For backwards compatibility
export const linearClient = {
  get viewer() { return getLinearClient().viewer; },
  get issues() { return getLinearClient().issues; },
  get teams() { return getLinearClient().teams; },
  issue: (id: string) => getLinearClient().issue(id),
};
