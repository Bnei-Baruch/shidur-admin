import React, {Component} from 'react'
import {
    Divider,
    Table,
    Segment,
    Label,
    Dropdown,
    Select,
    Message,
    Button,
    List,
    Menu,
    Checkbox
} from 'semantic-ui-react'
import {
    channels_options,
    vres_options,
    vrate_options,
    arate_options,
    protocol_options,
    encstr_options,
    dest_options,
    encrec_options,
    streamFetcher,
    getService
} from "../shared/tools";
import Service from "./Service";


class Encoders extends Component {

    state = {
        encoder: {},
        id: "",
        ival: null,
        services: [],
        status: "",
        stat: {cpu: "", hdd: "", temp: ""}
    };

    componentDidMount() {
        const {id,encoders} = this.props;
        if(id) this.setEncoder(id, encoders[id]);
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    setEncoder = (id, encoder) => {
        console.log(":: Set encoder: ",encoder);
        this.setState({id, encoder}, () => {
            this.runTimer();
        });
        let value = id.match(/^mac-trl/) ? "trlstat" : "strstat";
        let req = {"req": value, "id": "status"};
        // streamFetcher(encoder.ip, `encoder`, req,  (data) => {
        //     if(data) {
        //         let status = data.stdout.replace(/\n/ig, '');
        //         console.log(":: Got Encoder status: ",status);
        //         this.setState({status});
        //     }
        // });
        if(id !== this.props.id)
            this.props.idState("encoder_id", id);
    };

    setJsonState = (key, value) => {
        let {encoder, id} = this.state;
        encoder.jsonst[key] = value;
        this.props.jsonState("encoders", {[id]: encoder}, id);
    };

    startEncoder = () => {
        this.setState({status: "On"});
        let {encoder, id} = this.state;
        let {jsonst} = encoder;
        let value = id.match(/^mac-trl/) ? "trlout" : "stream";
        jsonst.id = value;
        jsonst.req = "start";
        streamFetcher(encoder.ip, `encoder`, jsonst,  (data) => {
            console.log(":: Start Encoder status: ",data);
            //TODO: here we need save state to db
        });
    };

    stopEncoder = () => {
        this.setState({status: "Off"});
        let {encoder, id} = this.state;
        let {jsonst} = encoder;
        let value = id.match(/^mac-trl/) ? "trlout" : "stream";
        jsonst.id = value;
        jsonst.req = "stop";
        streamFetcher(encoder.ip, `encoder`, jsonst,  (data) => {
            console.log(":: Stop Encoder status: ",data);
        });
    };

    runTimer = () => {
        this.getStat();
        if(this.state.ival)
            clearInterval(this.state.ival);
        let ival = setInterval(() => {
            this.getStat();
        }, 1000);
        this.setState({ival});
    };

    getStat = () => {
        const {encoder, id} = this.state;
        //if(id.match(/^mac-/)) return;
        let req = {"req": "encstat", "id": "stream"};
        // streamFetcher(encoder.ip, `encoder`, req, (data) => {
        //     let stat = data && data.jsonst ? data.jsonst : {cpu: "", hdd: "", temp: ""};
        //     //console.log(":: Got Encoder stat: ", stat);
        //     this.setState({stat});
        // });
        getService(id + "/status", (services) => {
            for(let i=0; i<services.length; i++) {
                services[i].out_time = services[i].log.split('time=')[1].split('.')[0];
            }
            this.setState({services});
        })
    };

    render() {

        const {encoders} = this.props;
        const {encoder, id, status, stat, services} = this.state;

        let enc_options = Object.keys(encoders).map((id, i) => {
            let encoder = encoders[id];
            const {name , description} = encoder;
            return (
                <Dropdown.Item
                    key={i}
                    onClick={() => this.setEncoder(id, encoder)}>{description || name}
                </Dropdown.Item>
            )
        });

        let services_list = services.map((stream,i) => {
            return (<Service key={i} index={i} service={services[i]} saveData={this.saveData} />);
        });

        return(
            <Segment textAlign='center' basic >
                <Label attached='top' size='big' >
                    <Dropdown item text={id ? encoder.description: "Select:"}>
                        <Dropdown.Menu>{enc_options}</Dropdown.Menu>
                    </Dropdown>
                </Label>
                <Divider />

                {id === "dante-main" || id === "dante-backup" ?
                    <Table basic='very'>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell></Table.HeaderCell>
                                <Table.HeaderCell />
                                <Table.HeaderCell></Table.HeaderCell>
                                <Table.HeaderCell />
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            <Table.Row>
                                <Table.Cell><b>Dante Mode</b></Table.Cell>
                                <Table.Cell>
                                    <Segment compact>
                                    <Checkbox label='IN' toggle disabled={status === "On"}
                                              onChange={() => this.setJsonState("in", !encoders[id].jsonst.in)} checked={encoders[id].jsonst.in} />
                                    </Segment>
                                </Table.Cell>
                                <Table.Cell>
                                    <Segment compact>
                                    <Checkbox label='OUT' toggle disabled={status === "On"}
                                              onChange={() => this.setJsonState("out", !encoders[id].jsonst.out)} checked={encoders[id].jsonst.out} />
                                    </Segment>
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                : null}

                {services_list}

                {!id ? null :
                    <Message className='or_buttons'>
                        <Menu fluid secondary text>
                            <Menu.Item>
                                <Button.Group>
                                    <Button positive disabled={status !== "Off"}
                                            onClick={this.startEncoder}>Start</Button>
                                    <Button.Or text='enc'/>
                                    <Button negative disabled={status !== "On"}
                                            onClick={this.stopEncoder}>Stop</Button>
                                </Button.Group>
                            </Menu.Item>

                            {id.match(/^mac-/) ? null :
                                <Menu.Item position='right'>
                                    <List className='stat' size='small'>
                                        <List.Item>
                                            <List.Icon name='microchip'/>
                                            <List.Content
                                                className={parseInt(stat.cpu) > 90 ? "warning" : ""}>
                                                CPU: <b>{stat.cpu}</b></List.Content>
                                        </List.Item>
                                        <List.Item>
                                            <List.Icon name='server'/>
                                            <List.Content
                                                className={parseInt(stat.hdd) > 90 ? "warning" : ""}>
                                                HDD: <b>{stat.hdd}</b></List.Content>
                                        </List.Item>
                                        <List.Item>
                                            <List.Icon name='thermometer'/>
                                            <List.Content
                                                className={parseInt(stat.temp) > 80 ? "warning" : ""}>
                                                TMP: <b>{stat.temp}</b></List.Content>
                                        </List.Item>
                                    </List>
                                </Menu.Item>
                            }
                        </Menu>
                    </Message>
                }
            </Segment>
        );
    }
}

export default Encoders;