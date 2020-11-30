import React, {Component} from 'react'
import { Message, Menu, Checkbox, Icon, Label, Popup, Button, Modal, Header, Input } from 'semantic-ui-react'
import {rstrStatus, rstrExec} from "../shared/tools";

class Streams extends Component {

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

    componentDidMount() {
        let {index} = this.props;
        rstrStatus(index , data => {
            if(data) {
                let timer = data.jsonst.out_time ? data.jsonst.out_time.split(".")[0] : "00:00:00";
                let status = {
                    status: data.jsonst.status || "On",
                    time: timer,
                    progress: data.jsonst.progress
                };
                console.log(status);
                let online = data.jsonst.status === "On";
                if(online) this.runTimer();
                this.setState({status,online});
            }

        })
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    runTimer = () => {
        let {index} = this.props;
        let ival = setInterval(() => rstrStatus(index , data => {
            let timer = data.jsonst.out_time ? data.jsonst.out_time.split(".")[0] : "00:00:00";
            let status = {
                status: data.jsonst.status,
                time: timer,
                progress: data.jsonst.progress
            };
            this.setState({status});
        }), 1000 );
        this.setState({ival});
    };

    removeStream = () => {
        let {index,db} = this.props;
        let stream = db.restream[index];
        db.restream.splice(index, 1);
        console.log(stream);
        this.props.saveData(db);
    };

    toggleStream = () => {
        let {index} = this.props;
        let online = !this.state.online;
        this.setState({online});
        console.log(" :: Toggle stream: " + index,online);
        if(online) this.startStream();
        if(!online) this.stopStream();
    };

    startStream = () => {
        let {index,db} = this.props;
        let stream = db.restream[index];
        console.log(stream)
        let req = {"id":index, "req":"start", stream};
        rstrExec(req,  (data) => {
            console.log(":: Stream Stated :: ",data);
            //this.runTimer();
        });
        this.runTimer();
        this.setDelay();
    };

    stopStream = () => {
        let {index} = this.props;
        let req = {"id":index, "req":"stop"};
        rstrExec(req,  (data) => {
            console.log(":: Stream Stopped :: ",data);
            clearInterval(this.state.ival);
            this.setState({online: false})
        });
        this.setDelay();
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
        }, 2000);
    };

    render() {

        const {index} = this.props;
        const {name,language,url} = this.props.db.restream[index];
        const {online,status,delay} = this.state;

        return (
            <Message className='service'>
                <Menu secondary>
                    <Menu.Item>
                        <Checkbox toggle disabled={delay || url === ""}
                                  checked={online}
                                  onChange={this.toggleStream} />
                    </Menu.Item>
                    <Menu.Item>
                        <Label size='big' color={online ? 'green' : 'red'}>
                            {status.time}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Label size='big' color='grey'>
                            {language.toLocaleUpperCase()}
                        </Label>
                    </Menu.Item>
                    <Menu.Item>
                        <Popup inverted flowing position='top center' content={url} trigger={
                            <Button color='blue' onClick={this.open}>{name}</Button>} />
                        <Modal
                            open={this.state.open}
                            onClose={this.close}
                            basic
                            size='small'
                        >
                            <Header icon='browser' content={language.toLocaleUpperCase()+' : '+name} />
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
                        <Icon link name='close' onClick={this.removeStream} />
                    </Menu.Item>
                </Menu>
            </Message>
        );
    }
}

export default Streams;