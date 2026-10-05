import {clsx} from "clsx";
import {twMerge} from "tailwind-merge"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function ukTimeFormatter(time) {
    // If your backend drops the 'Z', append it to ensure dayjs treats it as UTC
    const utcTime = time.endsWith('Z') ? time : `${time}Z`;
    return dayjs.utc(utcTime).local().format('HH:mm');
}