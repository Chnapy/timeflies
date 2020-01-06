import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import { UIState } from "../../../UIState";
import css from './timeGauge.module.css';

interface TimeGaugeInnerProps {
    startDateTime: number;
    turnDuration: number;
}

export const TimeGauge = connect<TimeGaugeInnerProps, {}, {}, UIState<'battle'>>(
    ({ data: { battleData: { currentTurn } } }) => {

        return {
            startDateTime: currentTurn?.startTime.dateTime || 0,
            turnDuration: currentTurn?.turnDuration || 0,
        };
    }
)(({
    startDateTime,
    turnDuration
}: TimeGaugeInnerProps) => {

    const now = Date.now();

    const delta = now - startDateTime;

    const timeToEmpty = Math.max(turnDuration - delta, 0);

    const heightPercent = timeToEmpty
        ? timeToEmpty * 100 / turnDuration
        : 0;

    const frontRef: React.RefObject<HTMLDivElement> = useRef(null);

    useEffect(() => {
        const { current } = frontRef;
        if (!current || !heightPercent) {
            return;
        }

        const keyFrames: Keyframe[] = [
            { height: `${heightPercent}%` },
            { height: 0 }
        ]

        current.animate(keyFrames, {
            duration: timeToEmpty
        });

    });

    return <div className={css.root}>
            <div ref={frontRef} className={css.gauge_front} />
    </div>;
});
