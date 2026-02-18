// Shared types between frontend and backend

export type Message = {
  id: string;
  text: string;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Admissions & test scores (IPEDS via Urban Institute Education Data Portal)

export type AdmissionsInstitution = {
  name: string;
  unitid: number;
  satMath25: number;
  satMath75: number;
  satERW25: number;
  satERW75: number;
  actComposite25: number;
  actComposite75: number;
  acceptanceRate: number;
};

export type AdmissionsCategory = {
  id: string;
  label: string;
  description: string;
  data: AdmissionsInstitution[];
};

export type AdmissionsResponse = {
  categories: AdmissionsCategory[];
};
