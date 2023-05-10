import { useEffect, useState, useRef } from "react";
import { isPresent, loopNext } from "../functions";
import { isNonEmpty } from "fp-ts/Array";
import { randomInt } from "fp-ts/Random";
import { increment } from "fp-ts/function";
import { AnimationScope, useAnimate } from "framer-motion";
import { useInterval } from "ahooks";

/**
 * 放背景
 *
 * @param urls 图片的路径数组
 * @param duration 动画的持续时间(秒)
 * @param delay 切换图片的间隔时间(毫秒)
 * @param color 背景色
 *
 * @since 1.0.1
 */
const useBackgroundImages = <E extends Element = any>({
    urls,
    duration,
    delay,
    color,
}: {
    urls: string[];
    duration: number;
    delay: number;
    color: `${number},${number},${number}`;
}): [AnimationScope<E>, (bool?: boolean) => void] => {
    const [scope, animate] = useAnimate<E>();
    const [paused, setPaused] = useState(true);
    const index = useRef(-1);

    const changeBg = (opacity: number, duration: number) =>
        animate(
            scope.current,
            {
                backgroundImage: `linear-gradient(rgba(${color}, ${opacity}), rgba(${color}, ${opacity})), url(${
                    urls[index.current]
                })`,
            },
            { duration },
        );

    useEffect(() => {
        if (isNonEmpty(urls)) {
            index.current = randomInt(0, urls.length - 1)();
            changeBg(1, duration)
                .then(() => (index.current = loopNext(urls)(increment)(index.current)))
                .then(() => changeBg(1, 0))
                .then(() => changeBg(0, 1))
                .then(() => setPaused(false));
        }
    }, [urls]);

    useInterval(
        () =>
            changeBg(1, duration)
                .then(() => (index.current = loopNext(urls)(increment)(index.current)))
                .then(() => changeBg(1, 0))
                .then(() => changeBg(0, 1)),
        paused ? undefined : delay,
    );

    return [
        scope,
        (bool?: boolean) => {
            if (isPresent(bool)) setPaused(bool);
            else setPaused(!paused);
        },
    ];
};

export default useBackgroundImages;
