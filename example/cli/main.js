/**
 * redux-optimistic-thunk
 *
 * @file cli example
 * @author otakustay
 */

/* eslint-disable no-console */

import {createStore, applyMiddleware} from 'redux';
import optimisticThunk, {createOptimisticReducer} from '../../src/index';
import chalk from 'chalk';

let reducer = (state, action) => (action.type === 'PUSH' ? state.concat(action.value) : state);
let store = createStore(createOptimisticReducer(reducer), [], applyMiddleware(optimisticThunk()));
let delay = time => new Promise(resolve => setTimeout(resolve, time));
let log = () => {
    let state = store.getState();
    let prints = state.map(value => (value.includes('optimi') ? chalk.gray(value) : chalk.cyan(value)));
    console.log(prints.join(' -> '));
};

let main = async () => {
    let slow = [
        async dispatch => {
            dispatch({type: 'PUSH', value: 'slow actual 1'});
            log();
            dispatch({type: 'PUSH', value: 'slow actual 2'});
            log();

            await delay(500);

            dispatch({type: 'PUSH', value: 'slow actual 3'});
            log();
            dispatch({type: 'PUSH', value: 'slow actual 4'});
            log();
        },
        dispatch => {
            dispatch({type: 'PUSH', value: 'slow optimi 1'});
            log();
            dispatch({type: 'PUSH', value: 'slow optimi 2'});
            log();
        }
    ];
    let fast = [
        async dispatch => {
            dispatch({type: 'PUSH', value: 'fast actual 1'});
            log();
            dispatch({type: 'PUSH', value: 'fast actual 2'});
            log();

            await delay(200);

            dispatch({type: 'PUSH', value: 'fast actual 3'});
            log();
            dispatch({type: 'PUSH', value: 'fast actual 4'});
            log();
        },
        dispatch => {
            dispatch({type: 'PUSH', value: 'fast optimi 1'});
            log();
            dispatch({type: 'PUSH', value: 'fast optimi 2'});
            log();
        }
    ];

    store.dispatch(slow);
    store.dispatch(fast);
};

main();
