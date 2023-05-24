import { createPool as create, PoolOptions, QueryError } from "mysql2";
import { isPresent } from "../functions";
import ErrnoException = NodeJS.ErrnoException;
import { camelCase as toCamelCase } from "lodash";
import { $Ar, $Bl, $Ei, $Fn, $Op, $Tk } from "../dependencies/fp-ts";

type UpdateInfo = {
    affectedRows: number;
    fieldCount: number;
    info: string;
    insertId: number;
    serverStatus: number;
    warningStatus: number;
};

type ExecError = ErrnoException | QueryError;

/**
 * @since 1.0.4
 */
const createTaskPool = (options: PoolOptions, camelCase: boolean = true) => {
    const pool = create(options);

    return {
        sqlQuery<T>(
            sql: `select ${string}` | `show ${string}`,
        ): $Tk.Task<$Ei.Either<$Op.Option<T[]>, ExecError>> {
            return () =>
                new Promise<$Ei.Either<$Op.Option<T[]>, ExecError>>((resolve) => {
                    pool.getConnection((err, conn) => {
                        if (isPresent(err)) {
                            resolve($Ei.right(err));
                            return;
                        }
                        conn.query(sql, (err, res) => {
                            conn.release();
                            if (isPresent(err)) {
                                resolve($Ei.right(err));
                                return;
                            }
                            if (!camelCase) {
                                $Fn.pipe(res as T[], $Op.fromNullable, $Ei.left, resolve);
                            } else {
                                $Fn.pipe(
                                    res as T[],
                                    $Ar.map((e) => {
                                        const out: any = {};
                                        for (const label in e) {
                                            out[toCamelCase(label)] = e[label];
                                        }
                                        return out;
                                    }),
                                    (e) => ($Ar.isEmpty(e) ? null : e),
                                    $Op.fromNullable,
                                    $Ei.left,
                                    resolve,
                                );
                            }
                        });
                    });
                });
        },
        sqlUpdate(
            sql: `update ${string}` | `delete ${string}` | `insert ${string}`,
        ): $Tk.Task<$Ei.Either<UpdateInfo, ExecError>> {
            return () =>
                new Promise<$Ei.Either<UpdateInfo, ExecError>>(() => {
                    return new Promise<$Ei.Either<UpdateInfo, any>>((resolve) => {
                        pool.getConnection((err, conn) => {
                            if (isPresent(err)) {
                                resolve($Ei.right(err));
                                return;
                            }
                            conn.execute(sql, (err, info) => {
                                conn.release();
                                $Fn.pipe(
                                    err,
                                    isPresent,
                                    $Bl.match(
                                        () => $Ei.right(err as QueryError),
                                        () => $Ei.left(info as UpdateInfo),
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

export type { UpdateInfo, ExecError };
export { createTaskPool };
