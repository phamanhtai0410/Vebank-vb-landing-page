import { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';

const calculateDuration = eventTime => moment.duration(Math.max(eventTime - (Math.floor(Date.now() / 1000)), 0), 'seconds');

const CountdownIDO = ({ eventTime, interval }) => {

    const [duration, setDuration] = useState(calculateDuration(eventTime));

    const timerRef = useRef(0);

    const timerCallback = useCallback(() => {
        setDuration(calculateDuration(eventTime));
    }, [eventTime]);

    useEffect(() => {

        if (eventTime) {
            timerRef.current = setInterval(timerCallback, interval);
            return () => {
                clearInterval(timerRef.current);
            }
        }

    }, [eventTime]);

    const pad = (n) => n < 10 ? `0${n}` : n;

    if (eventTime && duration._milliseconds === 0) {
        window.location.reload();
    }

    return (
        <div className="grid-cols-4 gap-4 flex flex-row justify-center">
            <div className="count-down">
                <div className="text-[24px] leading-5"><p> {eventTime ? pad(Math.floor(duration.asDays())) : "00"}</p><p className="text-[10px] pt-2 leading-[6px]">DAYS</p></div>
            </div>
            <div className="count-down">
                <div className="text-[24px] leading-5"> {eventTime ? pad(duration.hours()) : "00"}<p className="text-[10px] pt-2 leading-[6px] ">HOURS</p></div>
            </div>
            <div className="count-down">
                <div className="text-[24px] leading-5"> {eventTime ? pad(duration.minutes()) : "00"}<p className="text-[10px] pt-2 leading-[6px] ">MINUTES</p></div>
            </div>
            <div className="count-down">
                <div className="text-[24px] leading-5"> {eventTime ? pad(duration.seconds()) : "00"}<p className="text-[10px] pt-2 leading-[6px] ">SECONDS</p></div>
            </div>
        </div>

    )
}

export default CountdownIDO;