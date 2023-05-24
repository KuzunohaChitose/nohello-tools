import { $Ei, $Eq, $Fn, $Id, $Mp, $Op, $Rec } from "../dependencies/fp-ts";

const groupBy =
    <K>(eq: $Eq.Eq<K>) =>
    <V>(arr: [K, V][]): Map<K, V[]> =>
        $Fn.pipe(
            new Map<K, V[]>(),
            (map) =>
                $Rec.tailRec([0, map] as [number, Map<K, V[]>], ([i, map]) =>
                    $Fn.pipe(
                        arr[i],
                        $Id.bindTo("kv"),
                        $Id.bind("res", ({ kv: [key, value] }) =>
                            $Fn.pipe(
                                map,
                                $Mp.modifyAt(eq)(key, (e) => [...e, value]),
                                $Op.getOrElse(
                                    $Fn.pipe(map, $Mp.upsertAt(eq)(key, [value]), $Fn.constant),
                                ),
                            ),
                        ),
                        ({ res }) =>
                            i < arr.length - 1
                                ? $Ei.left([i + 1, res] as [number, Map<K, V[]>])
                                : $Ei.right([i + 1, res] as [number, Map<K, V[]>]),
                    ),
                ),
            ([, map]) => map,
        );

export { groupBy };
