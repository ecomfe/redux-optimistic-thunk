/**
 * redux-optimistic-thunk
 *
 * @file react example
 * @author otakustay
 */

import uid from './uid';

const delay = time => new Promise(resolve => setTimeout(resolve, time));

export const newItem = item => ({type: 'NEW_ITEM', item: item});

export const saveItem = text => [
    async (dispatch, getState) => {
        await delay(getState().delay);

        dispatch(newItem({text: text, id: uid(), pending: false, deleted: false}));
    },
    dispatch => dispatch(newItem({text: text, id: uid(), pending: true, deleted: false})),
];

export const deleteItem = id => ({type: 'DELETE_ITEM', id: id});

export const setDelay = delay => ({type: 'SET_DELAY', delay: delay});
