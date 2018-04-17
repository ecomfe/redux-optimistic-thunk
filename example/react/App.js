/**
 * redux-optimistic-thunk
 *
 * @file react example
 * @author otakustay
 */

import {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as actions from './action';

const deleteLabelStyle = {
    float: 'right',
    cursor: 'pointer',
    color: '#0076ff',
};

const pendingLabelStyle = {
    float: 'right',
    cursor: 'default',
    color: '#b3b3b3',
};

const DelayRadio = ({delay, value, onSelect}) => {
    return (
        <label style={{marginRight: '12px'}}>
            <input
                type="radio"
                name="delay"
                value={value + '000'}
                onChange={onSelect}
                checked={delay / 1000 === value}
            />
            {value}s
        </label>
    );
};

const ChooseDelay = ({delay, onChange}) => (
    <div>
        <span style={{display: 'inline-block', marginRight: '20px'}}>Set delay to:</span>
        <DelayRadio value={1} delay={delay} onSelect={onChange} />
        <DelayRadio value={2} delay={delay} onSelect={onChange} />
        <DelayRadio value={5} delay={delay} onSelect={onChange} />
        <DelayRadio value={10} delay={delay} onSelect={onChange} />
    </div>
);

const NewItemForm = ({itemText, onChange, onSubmit}) => {
    const inputStyle = {
        boxSizing: 'border-box',
        width: '100%',
        height: '36px',
        lineHeight: '36px',
        padding: '0 10px',
        outline: 'none',
    };
    const buttonStyle = {
        position: 'absolute',
        right: '0',
        top: '1px',
        bottom: '1px',
        cursor: 'pointer',
        border: 'none',
        padding: '0 12px',
        backgroundColor: '#0076ff',
        color: '#fff',
        fontSize: '16px',
    };

    return (
        <div style={{position: 'relative', margin: '20px 0'}}>
            <input
                type="text"
                style={inputStyle}
                value={itemText}
                placeholder="New item"
                onChange={onChange}
            />
            <button type="button" style={buttonStyle} onClick={onSubmit}>Submit</button>
        </div>
    );
};

/* eslint-disable react/jsx-no-bind */
const DeleteLabel = ({id, onDelete}) => <span style={deleteLabelStyle} onClick={() => onDelete(id)}>delete</span>;
/* eslint-enable react/jsx-no-bind */

const PendingLabel = () => <span style={pendingLabelStyle}>pending...</span>;

const Item = ({id, deleted, text, pending, onDelete}) => (
    <li style={{padding: '4px 6px', borderBottom: '1px solid #ccc'}}>
        <span style={{textDecoration: deleted ? 'line-through' : 'none'}}>{text}</span>
        {deleted ? null : (pending ? <PendingLabel /> : <DeleteLabel id={id} onDelete={onDelete} />)}
    </li>
);

const ItemList = ({items, onDelete}) => (
    <ul style={{listStyle: 'none', margin: '0', padding: '0'}}>
        {items.map(item => <Item key={item.id} {...item} onDelete={onDelete} />)}
    </ul>
);

const Introduction = () => (
    <div style={{marginTop: '40px', color: '#4d4d4d'}}>
        <p>Try these steps to see how optimistic UI effects you app:</p>
        <ol>
            <li>Keep delay default to 10s, submit a new item, you will see a pending item in top of list.</li>
            <li>Quickly change delay to 5s, submit another item, another item appears on top.</li>
            <li>Quickly delete some existing items, deleted item will have line-through effect.</li>
            <li>Wait for all item creation to finish, observe the order of items.</li>
        </ol>
        <p>
            Since a 5s-delayed item will response faster than a 10s-delayed one,
            the final order will be different from how you create them (optimistic order).
        </p>
    </div>
);

class App extends PureComponent {

    state = {
        newItemText: '',
    };

    setDelay = ({target}) => {
        if (target.checked) {
            this.props.setDelay(+target.value);
        }
    };

    updateNewItemText = ({target}) => {
        this.setState({newItemText: target.value});
    };

    submitNewItem = () => {
        this.props.saveItem(this.state.newItemText);
        this.setState({newItemText: ''});
    };

    render() {
        const {delay, items, deleteItem} = this.props;
        const {newItemText} = this.state;
        return (
            <div style={{width: '720px', margin: '0 auto'}}>
                <ChooseDelay delay={delay} onChange={this.setDelay} />
                <NewItemForm itemText={newItemText} onChange={this.updateNewItemText} onSubmit={this.submitNewItem} />
                <ItemList items={items} onDelete={deleteItem} />
                <Introduction />
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => Object.entries(actions).reduce(
    (props, [key, fn]) => Object.assign(props, {[key]: (...args) => dispatch(fn(...args))}),
    {}
);
export default connect(state => state, mapDispatchToProps)(App);
