import React, { useRef, useEffect } from 'react';
import { connect } from "react-redux";
import { UIState } from '../../../UIState';
import css from './timeText.module.css';
import classNames from 'classnames';

interface TimeTextInnerProps {
    startDateTime: number;
    timeAction?: number;
    disabled: boolean;
}

export const TimeText = connect<TimeTextInnerProps, {}, {}, UIState<'battle'>>(
    ({ data: { battleData: { currentTurn } } }) => {

        return {
            startDateTime: currentTurn?.startTime.dateTime || 0,
            timeAction: currentTurn?.currentCharacter.features.actionTime,
            disabled: !currentTurn || !currentTurn.currentCharacter.isMine
        };
    }
)(({
    startDateTime, timeAction, disabled
}: TimeTextInnerProps) => {

    const total = ((timeAction || 0) / 1000).toFixed(1);

    const valueRef: React.RefObject<HTMLDivElement> = useRef(null);

    useEffect(() => {
        const { current } = valueRef;
        if (!current || !timeAction) {
            return;
        }

        const refreshValue = () => {

            const now = Date.now();

            const elapsed = now - startDateTime;

            const staying = Math.max(timeAction - elapsed, 0) / 1000;

            current.textContent = staying.toFixed(1);

            requestAnimationFrame(refreshValue);
        };

        requestAnimationFrame(refreshValue);

    });

    return <div className={classNames(css.root, {
        [css.disabled]: disabled
    })}>

        {timeAction !== undefined
            ? <>

                <div ref={valueRef}>{total}</div>
                <div>-</div>
                <div>{total}</div>

            </>
            : '-'}

    </div>;
});