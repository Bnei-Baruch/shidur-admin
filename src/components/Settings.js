import React, {Component, Fragment} from 'react'
import {Table, Input, Button, Tab, Modal, Header, Menu, Icon} from 'semantic-ui-react'
import {getData, putData, removeData} from "../shared/tools";


class Settings extends Component {

    state = {
        conf: "",
        name: "",
        ip: "",
        id: "",
        open: false,
        props: "",
        new_prop: false,
        streamer: {},
    };

    componentDidMount() {
        this.getConf();
    };

    getConf = () => {
        getData(`streamer`, (streamer) => {
            console.log(":: Got streamer : ",streamer);
            this.setState({streamer});
        });
    };

    addNew = (conf, new_prop) => {
        let props = {name: "", ip: "", description: "", jsonst: {}, services: []};
        this.setState({open: true, new_prop, props, conf, id: ""});
    };

    editProp = (props, new_prop, conf, id) => {
        console.log("Edit: ", props);
        this.setState({open: true, props, new_prop, conf, id});
    };

    setValue = (key, value) => {
        const {props} = this.state;
        props[key] = value;
        this.setState({props});
    };

    setServ = (key, value, i) => {
        const {props} = this.state;
        if(key === "args") {
            value = value.split(" ");
        }
        props.services[i][key] = value
        console.log(props)
        this.setState({props});
    };

    newServ = () => {
        const {props} = this.state;
        if(!props.services) {
            props.services = [];
        }
        props.services.push({id: "", name: "", args: []});
        console.log(props)
        this.setState({props});
    };

    saveProp = () => {
        let {id, conf, props} = this.state;
        console.log(":: Save item: ", conf);
        id = id || props.name.toLowerCase();
        putData(`streamer/${conf}/${id}`, props, (data) => {
            console.log("saveProp callback: ", data);
            this.setState({open: false, conf: "", id: "", props: ""});
            this.getConf();
        });
    };

    removeProp = () => {
        const {id, conf} = this.state;
        console.log(":: Del item: ", conf);
        removeData(`streamer/${conf}/${id}`, (data) => {
            console.log("removeProp callback: ", data);
            this.setState({open: false, conf: "", id: "", props: ""});
            this.getConf();
        });
    };

    renderContent = () => {
        const {props} = this.state;
        let {name, ip, description, services = []} = props;
        return (
            <Table compact='very' basic>
                <Table.Header>
                    <Table.Row className='table_header'>
                        <Table.HeaderCell width={1}>Name</Table.HeaderCell>
                        <Table.HeaderCell width={1}>IP</Table.HeaderCell>
                        <Table.HeaderCell width={1}>Description</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    <Table.Row className="table_header">
                        <Table.Cell><Input value={name} onChange={(e) => this.setValue("name", e.target.value)} /></Table.Cell>
                        <Table.Cell><Input value={ip} onChange={(e) => this.setValue("ip", e.target.value)} /></Table.Cell>
                        <Table.Cell><Input value={description} onChange={(e) => this.setValue("description", e.target.value)} /></Table.Cell>
                    </Table.Row>
                    {services.map((s, i) => {
                        let {id, name , args} = s;
                        args = args.join(" ");
                        return (
                            <Table.Row key={i} >
                                <Table.Cell><Input value={id} onChange={(e) => this.setServ("id", e.target.value, i)} /></Table.Cell>
                                <Table.Cell><Input value={name} onChange={(e) => this.setServ("name", e.target.value, i)} /></Table.Cell>
                                <Table.Cell><Input value={args} onChange={(e) => this.setServ("args", e.target.value, i)} /></Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>

                <Table.Footer>
                    <Table.Row>
                        <Table.HeaderCell colSpan='3'>
                            <Button size="mini" fluid onClick={this.newServ}>Add Service</Button>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        )
    };

    render() {
        const {new_prop, source, streamer, open} = this.state;

        const panes = Object.keys(streamer).map(key => {
            const conf = streamer[key];
            return (
                { menuItem: key[0].toUpperCase() + key.slice(1), render: () =>
                        <Tab.Pane>
                            <Table compact='very' basic>
                                <Table.Header>
                                    <Table.Row className='table_header'>
                                        <Table.HeaderCell width={1}>Name</Table.HeaderCell>
                                        <Table.HeaderCell width={1}>IP</Table.HeaderCell>
                                        <Table.HeaderCell width={2}>Description</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {
                                        Object.keys(conf).map((id, i) => {
                                            let props = conf[id];
                                            return (
                                                <Table.Row key={i} className="monitor_tr" onClick={() => this.editProp(props, false, key, id)}>
                                                    <Table.Cell>{props.name}</Table.Cell>
                                                    <Table.Cell>{props.ip}</Table.Cell>
                                                    <Table.Cell>{props.description}</Table.Cell>
                                                </Table.Row>
                                            )
                                        })
                                    }
                                </Table.Body>
                            </Table>
                            <Button size="mini" fluid onClick={() => this.addNew(key, true)}>Add....</Button>
                        </Tab.Pane> }
            );
        });

        return(
            <Fragment>
                <Tab panes={panes} className='webrtc' />
                <Modal
                    open={open}
                    onClose={() => this.setState({open: false})}
                    size='small'
                    closeIcon >
                    <Header content={source}/>
                    <Modal.Content>
                        {this.renderContent()}
                    </Modal.Content>
                    <Modal.Actions>
                        <Menu fluid secondary text>
                            <Menu.Item>
                                <Button positive onClick={this.saveProp}>
                                    <Icon name='save outline'/> Save
                                </Button>
                            </Menu.Item>
                            <Menu.Item position='right'>
                                {new_prop ? "" :
                                    <Button negative onClick={this.removeProp}>
                                        <Icon name='cancel'/> Remove
                                    </Button>
                                }
                            </Menu.Item>
                        </Menu>
                    </Modal.Actions>
                </Modal>
            </Fragment>
        );
    }
}

export default Settings;