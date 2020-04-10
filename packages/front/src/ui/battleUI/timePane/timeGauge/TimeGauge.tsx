import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import { UIState } from "../../../UIState";
import css from './timeGauge.module.css';
import classNames from "classnames";

interface TimeGaugeInnerProps {
    startDateTime: number;
    turnDuration: number;
    animate: boolean;
    disabled: boolean;
}

export const TimeGauge = connect<TimeGaugeInnerProps, {}, {}, UIState<'battle'>>(
    ({ data: { battleData: { cycle: { globalTurn } } } }) => {
        if (!globalTurn) {
            return {
                startDateTime: 0,
                turnDuration: 0,
                animate: false,
                disabled: true
            };
        }
        const { startTime, turnDuration, state, character: currentCharacter } = globalTurn.currentTurn;

        return {
            startDateTime: startTime,
            turnDuration,
            animate: state === 'running',
            disabled: state !== 'running' || !currentCharacter.isMine
        };
    }
)(({
    startDateTime,
    turnDuration,
    animate,
    disabled
}: TimeGaugeInnerProps) => {
    const now = Date.now();

    const delta = Math.max(now - startDateTime, 0);

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

        const update = () => {
            const now = Date.now();

            const delta = Math.max(now - startDateTime, 0);

            const timeToEmpty = Math.max(turnDuration - delta, 0);

            const heightPercent = timeToEmpty
                ? timeToEmpty * 100 / turnDuration
                : 0;

            current.style.height = `${heightPercent}%`;

            if (heightPercent > 0) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);

    });

    return <div className={classNames(css.root, {
        [ css.disabled ]: disabled
    })}>
        <div ref={frontRef} className={css.gauge_front} />
    </div>;
});
