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
        // <div className="flex flex-row items-center space-x-4">

        //     <div className="date-item flex flex-col items-center">
        //         <span
        //             id="day"
        //             className="font-['Poppins'] text-[#FFFFFF] text-[20px] leading-[28px] font-[700]"
        //         >
        //             {eventTime ? pad(duration.days()) : "00"}
        //         </span>
        //         <span className="font-['Poppins'] text-[#FFFFFF] text-[12px] leading-[16px] font-[400]">
        //             DAYS
        //         </span>
        //     </div>

        //     <div className="date-item flex flex-col items-center">
        //         <span
        //             id="hour"
        //             className="font-['Poppins'] text-[#FFFFFF] text-[20px] leading-[28px] font-[700]"
        //         >
        //             {eventTime ? pad(duration.hours()) : "00"}
        //         </span>
        //         <span className="font-['Poppins'] text-[#FFFFFF] text-[12px] leading-[16px] font-[400]">
        //             HOURS
        //         </span>
        //     </div>

        //     <div className="date-item flex flex-col items-center">
        //         <span
        //             id="minute"
        //             className="font-['Poppins'] text-[#FFFFFF] text-[20px] leading-[28px] font-[700]"
        //         >
        //             {eventTime ? pad(duration.minutes()) : "00"}
        //         </span>
        //         <span className="font-['Poppins'] text-[#FFFFFF] text-[12px] leading-[16px] font-[400]">
        //             MINUTES
        //         </span>
        //     </div>

        //     <div className="date-item flex flex-col items-center">
        //         <span
        //             id="second"
        //             className="font-['Poppins'] text-[#FFFFFF] text-[20px] leading-[28px] font-[700]"
        //         >
        //             {eventTime ? pad(duration.seconds()) : "00"}
        //         </span>
        //         <span className="font-['Poppins'] text-[#FFFFFF] text-[12px] leading-[16px] font-[400]">
        //             SECONDS
        //         </span>
        //     </div>

        // </div>
        <div className="grid-cols-4 gap-4 flex flex-row justify-center">
            <div className="count-down">
                <div className="text-[24px] leading-5"> {eventTime ? pad(duration.days()) : "00"}<p className="text-[12px] pt-2">DAYS</p></div>
            </div>
            <div className="count-down">
                <div className="text-[24px] leading-5"> {eventTime ? pad(duration.hours()) : "00"}<p className="text-[12px] pt-2">HOURS</p></div>
            </div>
            <div className="count-down">
                <div className="text-[24px] leading-5"> {eventTime ? pad(duration.minutes()) : "00"}<p className="text-[12px] pt-2">MINUTES</p></div>
            </div>
            <div className="count-down">
                <div className="text-[24px] leading-5"> {eventTime ? pad(duration.seconds()) : "00"}<p className="text-[12px] pt-2">SECONDS</p></div>
            </div>
        </div>

    )
}

export default CountdownIDO;