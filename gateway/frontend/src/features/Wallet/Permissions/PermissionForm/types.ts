export interface FormTarget {
  canisterId: string;
  methodName: string;
}

export interface FormData {
  name: string;
  description: string;
  targets: FormTarget[];
}
