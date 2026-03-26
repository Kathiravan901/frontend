export interface ResolutionActionDTO {
  actionId: number;
  exceptionId: number;
  ownerUserId: number;
  ownerUserName?: string;
  actionDescription: string;
  dueDate?: string; // DateOnly
  status: string;
}

export interface ResolutionActionUpsertDTO {
  exceptionId: number;
  ownerUserId: number;
  actionDescription: string;
  dueDate?: string;
  status: string;
}
