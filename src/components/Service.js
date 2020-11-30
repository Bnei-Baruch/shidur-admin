import React, {Component} from 'react'
import { Message, Menu, Checkbox, Label, Icon, Popup, Modal, Button, Input, Header } from 'semantic-ui-react'
import {getService} from "../shared/tools";

class Service extends Component {

    state = {
        delay: false,
        ival: null,
        url: "",
        online: false,
        open: false,
        status: {
            status: "Off",
            time: "00:00:00",
            progress: "end"
        }
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    removeStream = () => {
        let {index} = this.props;
        this.props.removeRestream(index);
    };

    toggleStream = () => {
        const {service, id} = this.props;
        let online = !this.state.online;
        this.setState({online});
        this.setDelay();
        if(online) getService(id + "/stop/" + service.id, () => {})
        if(!online) getService(id + "/start/" + service.id, () => {})
    };

    addUrl = () => {
        let {index,db} = this.props;
        db.restream[index].url = this.state.url;
        this.props.saveData(db);
        this.setState({ open: false });
    };

    open = () => this.setState({ open: true });
    close = () => this.setState({ open: false });

    setDelay = () => {
        this.setState({delay: true});
        setTimeout(() => {
            this.setState({delay: false});
        }, 5000);
    };

    render() {

        const {index, service} = this.props;
        const {name,id,out_time,alive,description} = service;
        const {online,status,delay} = this.state;

        return (
            <Message className='service' floating >
                <Menu secondary>
                    <Menu.Item>
                        <Checkbox toggle disabled={delay}
                                  checked={alive}
                                  onChange={this.toggleStream} />
                    </Menu.Item>
                    <Menu.Item>
                        <Label size='big' color='grey'>
                            {id}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                    </Menu.Item>
                    <Menu.Item position='right'>
                        <Popup inverted flowing position='top center' content={description} trigger={
                            <Button icon='comment alternate' onClick={this.open}>{}</Button>} />
                        <Modal
                            open={this.state.open}
                            onClose={this.close}
                            basic
                            size='small'
                        >
                            <Header icon='browser' content={id +' : '+ name} />
                            <Modal.Content>
                                <Input type='text' placeholder='Enter URL...'
                                       value={this.state.url} action fluid
                                       onChange={e => this.setState({url: e.target.value})}>
                                    <input />
                                    <Button size='big' color='green' onClick={this.addUrl}>Add</Button>
                                </Input>
                            </Modal.Content>
                        </Modal>
                    </Menu.Item>
                    <Menu.Item position='right'>
                        <Label size='big' color={alive ? 'green' : 'red'}>
                            {out_time}
                        </Label>
                    </Menu.Item>
                    <Menu.Item position='right'>
                        {this.props.id === "live-proxy" ? <Icon link name='close' onClick={this.removeStream} /> : null}
                    </Menu.Item>
                </Menu>
            </Message>
        );
    }
}

export default Service;