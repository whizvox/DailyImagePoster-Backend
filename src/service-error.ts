class ServiceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default ServiceError;
