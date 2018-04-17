/**
 * redux-optimistic-thunk
 *
 * @file cli example
 * @author otakustay
 */

/* eslint-disable no-console */
import chalk from 'chalk';
import {createStore, applyMiddleware} from 'redux';
import {optimisticThunk, createOptimisticReducer} from '../../src/index';

const reducer = (state, action) => {
    if (action.type === 'PUSH') {
        return {...state, items: state.items.concat(action.value)};
    }

    return state;
};

const logger = ({getState}) => next => action => {
    if (action.type !== 'PUSH' && !action.type.startsWith('@@optimistic')) {
        return next(action);
    }

    const returnValue = next(action);

    const {optimistic, items} = getState();
    const prints = items.map(value => (value.includes('optimi') ? chalk.gray(value) : chalk.cyan(value)));
    const prefix = ((optimistic, actionType) => {
        switch (actionType) {
            case '@@optimistic/ROLLBACK':
                return '  (rollback)';
            case '@@optimistic/MARK':
                return '      (mark)';
            default:
                return optimistic ? '(optimistic)' : '    (actual)';
        }
    })(optimistic, action.type);
    console.log(prefix + ' ' + prints.join(' -> '));

    return returnValue;
};

const store = createStore(
    createOptimisticReducer(reducer),
    {items: []},
    applyMiddleware(optimisticThunk(), logger)
);

const delay = time => new Promise(resolve => setTimeout(resolve, time));

const main = () => {
    const slow = [
        async dispatch => {
            dispatch({type: 'PUSH', value: 'slow actual 1'});
            dispatch({type: 'PUSH', value: 'slow actual 2'});

            await delay(500);

            dispatch({type: 'PUSH', value: 'slow actual 3'});
            dispatch({type: 'PUSH', value: 'slow actual 4'});
        },
        dispatch => {
            dispatch({type: 'PUSH', value: 'slow optimi 1'});
            dispatch({type: 'PUSH', value: 'slow optimi 2'});
        },
    ];
    const fast = [
        async dispatch => {
            dispatch({type: 'PUSH', value: 'fast actual 1'});
            dispatch({type: 'PUSH', value: 'fast actual 2'});

            await delay(200);

            dispatch({type: 'PUSH', value: 'fast actual 3'});
            dispatch({type: 'PUSH', value: 'fast actual 4'});
        },
        dispatch => {
            dispatch({type: 'PUSH', value: 'fast optimi 1'});
            dispatch({type: 'PUSH', value: 'fast optimi 2'});
        },
    ];

    store.dispatch(slow);
    store.dispatch(fast);
};

main();
