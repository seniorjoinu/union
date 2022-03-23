export interface FormData {
  name: string;
  description: string;
  threshold: number;
  type: 'FractionOf' | 'QuantityOf';
  owners: string[];
}

export interface UseSubmitProps {
  create?: boolean;
  setValue(name: string, value: any): void; // FIXME
  getValues(): FormData;
}
