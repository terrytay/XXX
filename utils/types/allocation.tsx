export type allocationColumns = {
  fund?: string;
  jan?: string;
  janPrice?: string;
  feb?: string;
  febPrice?: string;
  mar?: string;
  marPrice?: string;
  apr?: string;
  aprPrice?: string;
  may?: string;
  mayPrice?: string;
  jun?: string;
  junPrice?: string;
  jul?: string;
  julPrice?: string;
  aug?: string;
  augPrice?: string;
  sep?: string;
  sepPrice?: string;
  oct?: string;
  octPrice?: string;
  nov?: string;
  novPrice?: string;
  dec?: string;
  decPrice?: string;
};

export type AgentClientAllocation = {
  _id?: string;
  agentId: string;
  policyNumber: string;
  [x: number]: allocationColumns[];
};
