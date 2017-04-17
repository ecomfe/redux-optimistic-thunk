/**
 * redux-optimistic-thunk
 *
 * @file react example
 * @author otakustay
 */

import 'babel-polyfill';
import {createStore, applyMiddleware, compose} from 'redux';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {optimisticThunk, createOptimisticReducer} from '../../src/index';
import reducer from './reducer';
import uid from './uid';
import App from './App.jsx';

let initialState = {
    delay: 10 * 1000,
    items: [
        {id: uid(), text: 'Buy a milk', pending: false, deleted: false},
        {id: uid(), text: 'Talk with Berry', pending: false, deleted: false},
        {id: uid(), text: 'Fitness - Run 10km', pending: false, deleted: false},
        {id: uid(), text: 'Read "Node.js for Embedded Systems"', pending: false, deleted: false},
        {id: uid(), text: 'Book next week\'s flight ticket', pending: false, deleted: false}
    ]
};
let store = createStore(
    createOptimisticReducer(reducer),
    initialState,
    compose(
        applyMiddleware(optimisticThunk()),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    )
);

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.body.appendChild(document.createElement('div'))
);
