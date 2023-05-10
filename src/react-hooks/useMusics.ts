import { useEffect, useState, useRef } from "react";
import { isPresent, loopNext } from "../functions";
import { isNonEmpty } from "fp-ts/Array";
import { randomInt } from "fp-ts/Random";
import { increment } from "fp-ts/function";

/**
 * 放音乐
 *
 * @since 1.0.1
 */
const useMusics = (urls: string[] | undefined) => {
    const [totalTime, setTotalTime] = useState(NaN);
    const [paused, setPaused] = useState(true);
    const [volume, setVolume] = useState(100);
    const [currentTime, setCurrentTime] = useState(0);
    const index = useRef(-1);
    const audio = useRef(new Audio());

    useEffect(() => {
        if (isPresent(urls) && isNonEmpty(urls)) {
            index.current = randomInt(0, urls.length - 1)();
            audio.current.src = urls[index.current];
            audio.current.oncanplaythrough = () => audio.current.play().then();
            audio.current.onended = () => {
                index.current = loopNext(urls)(increment)(index.current);
                audio.current.src = urls[index.current];
            };
            audio.current.ondurationchange = () => setTotalTime(audio.current.duration);
            audio.current.onplaying = () => setPaused(false);
            audio.current.onpause = () => setPaused(true);
            audio.current.ontimeupdate = () => setCurrentTime(audio.current.currentTime);
            audio.current.onvolumechange = () =>
                setVolume(parseInt((audio.current.volume * 100).toFixed()));
        }

        return () => {
            audio.current.pause();
        };
    }, [urls]);

    return {
        action: {
            /**
             * 设置歌曲当前时间
             *
             * @param currentTime 应在[0, totalTime]之间
             */
            setCurrentTime(currentTime: number) {
                if (index.current >= 0) {
                    if (currentTime > totalTime) audio.current.currentTime = totalTime;
                    else if (currentTime < 0) audio.current.currentTime = 0;
                    else audio.current.currentTime = currentTime;
                }
            },
            /**
             * 设置当前歌曲，为整数时向后切歌，否则向前切歌，为零时从头播放当前歌曲
             *
             * @param next 应为整数，否则自动向下取整
             * @returns {number} 当前播放歌曲在urls中的索引
             */
            setCurrentSong(next?: number) {
                if (index.current >= 0 && next !== undefined) {
                    index.current = loopNext(urls ?? [])((n) => n + Math.floor(next))(
                        index.current,
                    );
                    audio.current.src = (urls ?? [])[index.current];
                }
                return index.current;
            },
            /**
             * 设置音量，合法值为[0, 100]之间的整数<br>
             * 传入浮点数时将自动向下取整
             *
             * @param volume 音量值
             */
            setVolume(volume: number) {
                if (index.current >= 0 && Math.floor(volume) <= 100 && Math.floor(volume) >= 0) {
                    audio.current.volume = Math.floor(volume) / 100;
                }
            },
            /**
             * 设置暂停状态，无入参时自动切换状态
             *
             * @param stopped 暂停
             */
            setPaused(stopped?: boolean) {
                if (index.current >= 0 && stopped === undefined) {
                    if (paused) audio.current.play().then();
                    else audio.current.pause();
                } else if (index.current >= 0 && stopped && !paused) {
                    audio.current.pause();
                } else if (index.current >= 0 && !stopped && paused) {
                    audio.current.play().then();
                }
            },
        },
        attrs: { totalTime, paused, volume, currentTime },
    };
};

export default useMusics;
