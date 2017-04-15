/**
 * redux-optimistic-thunk
 *
 * @file react example
 * @author otakustay
 */

import {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as actions from './action';

let itemLabelStyle = {
    float: 'right',
    cursor: 'pointer',
    color: '#0076ff'
};

let deleteLabel = props => <span style={itemLabelStyle} onClick={() => props.onDelete(props.id)}>delete</span>;

let pendingLabel = props => <span style={itemLabelStyle}>pending...</span>;

let item = props => (
    <li key={props.id} style={{padding: '4px 6px', borderBottom: '1px solid #ccc'}}>
        <span style={{textDecoration: props.deleted ? 'line-through' : 'none'}}>{props.text}</span>
        {props.deleted ? null : (props.pending ? pendingLabel(props) : deleteLabel(props))}
    </li>
);

let delayRadio = props => {
    let value = props.value + '000';
    return (
        <label style={{marginRight: '12px'}}>
            <input
                type="radio"
                name="delay"
                value={value}
                onChange={props.setDelay}
                checked={props.delay / 1000 === props.value}
            />
            {props.value}s
        </label>
    );
};

class App extends PureComponent {

    state = {
        newItemText: ''
    };

    setDelay({target}) {
        if (target.checked) {
            this.props.setDelay(+target.value);
        }
    }

    updateNewItemText({target}) {
        this.setState({newItemText: target.value});
    }

    submitNewItem() {
        this.props.saveItem(this.state.newItemText);
        this.setState({newItemText: ''});
    }

    render() {
        let inputStyle = {
            boxSizing: 'border-box',
            width: '100%',
            height: '36px',
            lineHeight: '36px',
            padding: '0 10px',
            outline: 'none'
        };
        let buttonStyle = {
            position: 'absolute',
            right: '0',
            top: '1px',
            bottom: '1px',
            cursor: 'pointer',
            border: 'none',
            padding: '0 12px',
            backgroundColor: '#0076ff',
            color: '#fff',
            fontSize: '16px'
        };
        return (
            <div style={{width: '680px', margin: '0 auto'}}>
                <div>
                    <span style={{display: 'inline-block', marginRight: '20px'}}>Set delay to:</span>
                    {delayRadio({value: 1, delay: this.props.delay, setDelay: ::this.setDelay})}
                    {delayRadio({value: 2, delay: this.props.delay, setDelay: ::this.setDelay})}
                    {delayRadio({value: 5, delay: this.props.delay, setDelay: ::this.setDelay})}
                </div>
                <div style={{position: 'relative', margin: '20px 0'}}>
                    <input
                        type="text"
                        style={inputStyle}
                        value={this.state.newItemText}
                        placeholder="New item"
                        onChange={::this.updateNewItemText}
                    />
                    <button type="button" style={buttonStyle} onClick={::this.submitNewItem}>Submit</button>
                </div>
                <ul style={{listStyle: 'none', margin: '0', padding: '0'}}>
                    {this.props.items.map(item => ({...item, onDelete: this.props.deleteItem})).map(item)}
                </ul>
                <div style={{marginTop: '40px', color: '#4d4d4d'}}>
                    <p>Try these steps to see how optimistic UI effects you app:</p>
                    <ol>
                        <li>Keep delay default to 5s, submit a new item, you will see a pending item in top of list</li>
                        <li>Quickly change delay to 2s, submit another item, another item appears on top</li>
                        <li>Quickly delete some existing items, deleted item will have line-through effect</li>
                        <li>Waiting for all item creation to finish, observe the order of items</li>
                    </ol>
                    <p>
                        Since a 2s-delayed item will response faster than a 5s-delayed one,
                        the final order will be different from how you create them (optimistic order)
                    </p>
                </div>
            </div>
        );
    }
}

let mapDispatchToProps = dispatch => Object.entries(actions).reduce(
    (props, [key, fn]) => Object.assign(props, {[key]: (...args) => dispatch(fn(...args))}),
    {}
);
export default connect(state => state, mapDispatchToProps)(App);
