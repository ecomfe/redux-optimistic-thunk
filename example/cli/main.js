/**
 * redux-optimistic-thunk
 *
 * @file cli example
 * @author otakustay
 */

/* eslint-disable no-console */

import {createStore, applyMiddleware} from 'redux';
import {optimisticThunk, createOptimisticReducer} from '../../src/index';
import chalk from 'chalk';

let reducer = (state, action) => (action.type === 'PUSH' ? {...state, items: state.items.concat(action.value)} : state);

let logger = ({getState}) => next => action => {
    if (action.type !== 'PUSH' && !action.type.startsWith('@@optimistic')) {
        return next(action);
    }

    let returnValue = next(action);

    let {optimistic, items} = getState();
    let prints = items.map(value => (value.includes('optimi') ? chalk.gray(value) : chalk.cyan(value)));
    let prefix = ((optimistic, actionType) => {
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

let store = createStore(
    createOptimisticReducer(reducer),
    {items: []},
    applyMiddleware(optimisticThunk(), logger)
);

let delay = time => new Promise(resolve => setTimeout(resolve, time));

let main = async () => {
    let slow = [
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
        }
    ];
    let fast = [
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
        }
    ];

    store.dispatch(slow);
    store.dispatch(fast);
};

main();
