import { createTaskPool } from "../src/mysql";
import * as TE from "fp-ts/TaskEither";
import * as Op from "fp-ts/Option";
import { flow, pipe } from "fp-ts/function";
import { assert, describe, it } from "vitest";

const { sqlQuery } = createTaskPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "galgame",
});

describe.concurrent("a", async () => {
    const res = pipe(
        sqlQuery<any>("select * from play_log where log_id = -1"),
        TE.match(
            flow(
                Op.match(
                    () => [],
                    (res) => res,
                ),
            ),
            () => [],
        ),
    );
    it("", async () => {
        assert.deepEqual((await res()).length, 0);
    });
});
