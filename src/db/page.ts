class Page<Type> {
  page: number;
  total: number;
  limit: number;
  items: Type[];

  constructor(page: number, total: number, limit: number, items: Type[]) {
    this.page = page;
    this.total = total;
    this.limit = limit;
    this.items = items;
  }
}

export default Page;
