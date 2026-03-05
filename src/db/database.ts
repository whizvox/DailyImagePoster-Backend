import path from "node:path";
import Database from "better-sqlite3";
import logger from "../logger";
import { WORKING_DIR } from "../config";

const db = new Database(path.join(WORKING_DIR, "dailyimageposter.db"), {
  verbose: (msg) => logger.debug(msg),
});

const checkParameters = (params: unknown[]): unknown[] => {
  for (let i = 0; i < params.length; i++) {
    if (typeof params[i] === "boolean") {
      params[i] = (params[i] as boolean) ? 1 : 0;
    } else if (params[i] instanceof Date) {
      params[i] = (params[i] as Date).toISOString();
    }
  }
  return params;
};

const execute = (sql: string, ...params: unknown[]): Database.RunResult => {
  const stmt = db.prepare(sql);
  const info = stmt.run(...checkParameters(params));
  return info;
};

const query = <ResultType>(
  sql: string,
  parser: (result: unknown) => ResultType,
  ...params: unknown[]
): ResultType | null => {
  const stmt = db.prepare(sql);
  const result = stmt.get(...checkParameters(params));
  if (result === undefined) {
    return null;
  }
  return parser(result);
};

const iterate = <ResultType>(
  sql: string,
  parser: (result: unknown) => ResultType,
  func: (row: ResultType) => void,
  ...params: unknown[]
) => {
  const stmt = db.prepare(sql);
  for (const result of stmt.iterate(...checkParameters(params))) {
    func(parser(result));
  }
};

const gather = <ResultType>(
  sql: string,
  parser: (result: unknown) => ResultType,
  ...params: unknown[]
): ResultType[] => {
  const rows: ResultType[] = [];
  iterate(sql, parser, (row) => rows.push(row), ...checkParameters(params));
  return rows;
};

export { execute, query, iterate, gather };
