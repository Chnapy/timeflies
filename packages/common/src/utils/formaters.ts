import { EntitiesVariables, EntitiesVariablesName } from '../entities/common';

const timeFormat = (value: number) => {
    let formattedValue = (value / 1000).toFixed(1);

    if (formattedValue === '0.0') {
        formattedValue = '0';
    }

    return formattedValue + 's';
}

const noopFormat = () => '';

type VariableValue<name extends EntitiesVariablesName> = Required<EntitiesVariables>[ name ];

// TODO
const variableFormatters: {
    [ name in EntitiesVariablesName ]: (value: VariableValue<name>) => string
} = {
    // character
    health: String,
    actionTime: timeFormat,
    position: noopFormat,
    orientation: String,

    // spell
    duration: timeFormat,
    rangeArea: String,
    actionArea: String,
    lineOfSight: noopFormat,
    attack: String
};

type FormatVariableOptions = {
    /**
     * If true consider this is an add/sub (change value)
     */
    relative?: boolean;
};

export const formatVariableValue = <name extends EntitiesVariablesName>(
    variableName: name,
    value: VariableValue<name>,
    { relative }: FormatVariableOptions = {}
) => {

    const valuePrefix = relative && typeof value === 'number' && value >= 0
        ? '+'
        : '';

    const formatter = variableFormatters[ variableName ];

    return valuePrefix + formatter(value as never);
};
