export interface FormTarget {
  canisterId: string;
  methodName: string;
}

export interface FormData {
  name: string;
  scope: 'Blacklist' | 'Whitelist';
  targets: FormTarget[];
}

export interface UseSubmitProps {
  create?: boolean;
  setValue(name: string, value: any): void; // FIXME
  getValues(): FormData;
}
