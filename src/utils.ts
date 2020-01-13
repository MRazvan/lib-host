import { isNil } from 'lodash';

export class PartialModel<T> {
  constructor(data: Partial<T>) {
    Object.assign(this, data);
  }
}

export function getErrorMessage(err: any): string {
  if (isNil(err)) return '';
  if (err instanceof Error) {
    return err.message + '. STACK: ' + err.stack;
  }
  return err.toString();
}
