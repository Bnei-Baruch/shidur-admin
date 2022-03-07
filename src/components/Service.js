import React, {Component} from 'react'
import { Message, Menu, Checkbox, Label, Icon, Popup, Modal, Button, Input, Header } from 'semantic-ui-react'
import {getService} from "../shared/tools";
import mqtt from "../shared/mqtt";

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
        let online = service.alive;
        this.setState({online});
        this.setDelay();

        // if(online) mqtt.send("stop", false, "exec/service/"+id+"/"+service.id);
        // if(!online) mqtt.send("start", false, "exec/service/"+id+"/"+service.id);

        if(id.match(/^(galaxy-test)$/)) {
            if(online) getService(id + "/stop/" + service.id, () => {});
        } else {
            if(online) mqtt.send("stop", false, "exec/service/"+id+"/"+service.id);
        }

        if(id.match(/^(galaxy-test)$/)) {
            if(!online) getService(id + "/start/" + service.id, () => {});
        } else {
            if(!online) mqtt.send("start", false, "exec/service/"+id+"/"+service.id);
        }
    };

    addNote = () => {
        let {index} = this.props;
        this.props.addNote(index, this.state.url);
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

        const {service} = this.props;
        const {id,out_time,alive,description} = service;
        const {delay} = this.state;

        return (
            <Message className='service' floating >
                <Menu secondary>
                    <Menu.Item>
                        <Checkbox toggle disabled={delay || (this.props.id === "live-proxy" && !description)}
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
                            <Button basic circular icon='linkify' onClick={this.open}>{}</Button>} />
                        <Modal
                            open={this.state.open}
                            onClose={this.close}
                            basic
                            size='small'
                        >
                            <Header icon='browser' content={id} />
                            <Modal.Content>
                                <Input type='text' placeholder='Type here...'
                                       value={this.state.url} action fluid
                                       onChange={e => this.setState({url: e.target.value})}>
                                    <input />
                                    <Button size='big' color='green' onClick={this.addNote}>Add</Button>
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
                        {this.props.id.match(/^(live-proxy|galaxy-test)$/) ? <Icon link name='close' onClick={this.removeStream} /> : null}
                    </Menu.Item>
                </Menu>
            </Message>
        );
    }
}

export default Service;
