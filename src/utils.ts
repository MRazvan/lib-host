export class PartialModel<T> {
  constructor(data: Partial<T>) {
    Object.assign(this, data);
  }
}
