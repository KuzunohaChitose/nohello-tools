import { constant, pipe } from "fp-ts/function";
import { tailRec } from "fp-ts/ChainRec";
import { either as Ei, identity as Id, map as Mp, option as Op } from "fp-ts";
import { Eq } from "fp-ts/Eq";

const groupBy =
    <K>(eq: Eq<K>) =>
    <V>(arr: [K, V][]): Map<K, V[]> =>
        pipe(
            new Map<K, V[]>(),
            (map) =>
                tailRec([0, map] as [number, Map<K, V[]>], ([i, map]) =>
                    pipe(
                        arr[i],
                        Id.bindTo("kv"),
                        Id.bind("res", ({ kv: [key, value] }) =>
                            pipe(
                                map,
                                Mp.modifyAt(eq)(key, (e) => [...e, value]),
                                Op.getOrElse(pipe(map, Mp.upsertAt(eq)(key, [value]), constant)),
                            ),
                        ),
                        ({ res }) =>
                            i < arr.length - 1
                                ? Ei.left([i + 1, res] as [number, Map<K, V[]>])
                                : Ei.right([i + 1, res] as [number, Map<K, V[]>]),
                    ),
                ),
            ([, map]) => map,
        );

export { groupBy };
