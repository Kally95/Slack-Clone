import { useEffect, useRef } from "react";

export default function useDebounce(fn, time) {
    const timerRef = useRef(null);
    const fnRef = useRef(fn);

    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        };
    }, []);

    return () => {
        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            fnRef.current();
        }, time);
    };
}