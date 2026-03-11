class Parameter<Type> {
  parser: (value: string, name: string) => Type;
  defaultValue: (() => Type) | null;
  required: boolean;

  constructor(
    parser: (value: string, name: string) => Type,
    defaultValue?: Type | (() => Type),
    required?: boolean,
  ) {
    this.parser = parser;
    if (typeof defaultValue === "function") {
      this.defaultValue = defaultValue as () => Type;
    } else if (defaultValue !== undefined) {
      this.defaultValue = () => defaultValue;
    } else {
      this.defaultValue = null;
    }
    this.required = required ?? false;
  }
}

export default Parameter;
