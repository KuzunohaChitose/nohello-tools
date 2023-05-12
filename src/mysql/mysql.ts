import { createPool as create, PoolOptions, QueryError } from "mysql2";
import { boolMatch, isPresent } from "../functions";
import * as Ei from "fp-ts/Either";
import * as Tk from "fp-ts/Task";
import * as Arr from "fp-ts/Array";
import * as Op from "fp-ts/Option";
import ErrnoException = NodeJS.ErrnoException;
import { camelCase as toCamelCase } from "lodash";
import { pipe } from "fp-ts/function";

type UpdateInfo = {
    affectedRows: number;
    fieldCount: number;
    info: string;
    insertId: number;
    serverStatus: number;
    warningStatus: number;
};

type CreateOptions = PoolOptions;

type ExecError = ErrnoException | QueryError;

const createPromisePool = (options: CreateOptions, camelCase: boolean = true) => {
    const pool = create(options);

    return {
        sqlQuery<T>(
            sql: `select ${string}` | `show ${string}`,
        ): Tk.Task<Ei.Either<Op.Option<T[]>, ExecError>> {
            return () =>
                new Promise<Ei.Either<Op.Option<T[]>, ExecError>>((resolve) => {
                    pool.getConnection((err, conn) => {
                        if (isPresent(err)) {
                            resolve(Ei.right(err));
                            return;
                        }
                        conn.query(sql, (err, res) => {
                            conn.release();
                            if (isPresent(err)) {
                                resolve(Ei.right(err));
                                return;
                            }
                            if (!camelCase) {
                                pipe(res as T[], Op.fromNullable, Ei.left, resolve);
                            } else {
                                pipe(
                                    res as T[],
                                    Arr.map((e) => {
                                        const out: any = {};
                                        for (const label in e) {
                                            out[toCamelCase(label)] = e[label];
                                        }
                                        return out;
                                    }),
                                    (e) => (Arr.isEmpty(e) ? null : e),
                                    Op.fromNullable,
                                    Ei.left,
                                    resolve,
                                );
                            }
                        });
                    });
                });
        },
        sqlUpdate(
            sql: `update ${string}` | `delete ${string}` | `insert ${string}`,
        ): Tk.Task<Ei.Either<UpdateInfo, ExecError>> {
            return () =>
                new Promise<Ei.Either<UpdateInfo, ExecError>>(() => {
                    return new Promise<Ei.Either<UpdateInfo, any>>((resolve) => {
                        pool.getConnection((err, conn) => {
                            if (isPresent(err)) {
                                resolve(Ei.right(err));
                                return;
                            }
                            conn.execute(sql, (err, info) => {
                                conn.release();
                                pipe(
                                    err,
                                    isPresent,
                                    boolMatch(
                                        () => Ei.left(info as UpdateInfo),
                                        () => Ei.right(err as QueryError),
                                    ),
                                    resolve,
                                );
                            });
                        });
                    });
                });
        },
    };
};

export type { UpdateInfo, CreateOptions, ExecError };
export { createPromisePool };
