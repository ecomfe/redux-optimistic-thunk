/**
 * redux-optimistic-thunk
 *
 * @file react example
 * @author otakustay
 */

export default (state, action) => {
    switch (action.type) {
        case 'NEW_ITEM':
            return {...state, items: [action.item].concat(state.items)};
        case 'DELETE_ITEM':
            let newItems = state.items.map(item => (item.id === action.id ? {...item, deleted: true} : item));
            return {...state, items: newItems};
        case 'SET_DELAY':
            return {...state, delay: action.delay};
        default:
            return state;
    }
};
