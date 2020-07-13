import React, {Component} from 'react'
import {Divider, Table, Segment, Label, Dropdown, Select, Message, Button, List, Menu} from 'semantic-ui-react'
import {channels_options, vres_options, vrate_options, arate_options, protocol_options, encstr_options, dest_options, encrec_options, streamFetcher} from "../shared/tools";


class Encoders extends Component {

    state = {
        encoder: {},
        id: "",
        ival: null,
        status: "",
        stat: {cpu: "", hdd: "", temp: ""}
    };

    componentDidMount() {
        const {id,encoders} = this.props;
        if(id)
            this.setEncoder(id, encoders[id]);
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    setEncoder = (id, encoder) => {
        console.log(":: Set encoder: ",encoder);
        this.setState({id, encoder});
        let req = {"req":"strstat", "id":"status"};
        streamFetcher(encoder.ip, `encoder`, req,  (data) => {
            let status = data.stdout.replace(/\n/ig, '');
            console.log(":: Got Encoder status: ",status);
            this.setState({status});
            this.runTimer();
        });
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
        let {encoder} = this.state;
        let {jsonst} = encoder;
        jsonst.id = "stream";
        jsonst.req = "start";
        streamFetcher(encoder.ip, `encoder`, jsonst,  (data) => {
            console.log(":: Start Encoder status: ",data);
            //TODO: here we need save state to db
        });
    };

    stopEncoder = () => {
        this.setState({status: "Off"});
        let {encoder} = this.state;
        let {jsonst} = encoder;
        jsonst.id = "stream";
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
        }, 10000);
        this.setState({ival});
    };

    getStat = () => {
        const {encoder} = this.state;
        let req = {"req": "encstat", "id": "stream"};
        streamFetcher(encoder.ip, `encoder`, req, (data) => {
            let stat = data.jsonst ? data.jsonst : {cpu: "", hdd: "", temp: ""};
            //console.log(":: Got Encoder stat: ", stat);
            this.setState({stat});
        });
    };

    render() {

        const {encoders} = this.props;
        const {encoder, id, status, stat} = this.state;

        let enc_options = Object.keys(encoders).map((id, i) => {
            let encoder = encoders[id];
            return (
                <Dropdown.Item
                    key={i}
                    onClick={() => this.setEncoder(id, encoder)}>{encoder.name}
                </Dropdown.Item>
            )
        });

        return(
            <Segment textAlign='center' color={status === "On" ? 'green' : 'red'} raised>
                <Label attached='top' size='big' >
                    <Dropdown item text={id ? encoder.name: "Select:"}>
                        <Dropdown.Menu>{enc_options}</Dropdown.Menu>
                    </Dropdown>
                </Label>
                <Divider />
                <Table basic='very'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell></Table.HeaderCell>
                            <Table.HeaderCell />
                            <Table.HeaderCell></Table.HeaderCell>
                            <Table.HeaderCell />
                            <Table.HeaderCell></Table.HeaderCell>
                            <Table.HeaderCell />
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Bitrate</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={vrate_options}
                                        value={id ? encoders[id].jsonst.vrate : ""}
                                        onChange={(e, {value}) => this.setJsonState("vrate", value)}
                                />
                            </Table.Cell>
                            <Table.Cell>Bitrate</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={arate_options}
                                        value={id ? encoders[id].jsonst.arate : ""}
                                        onChange={(e, {value}) => this.setJsonState("arate", value)}
                                />
                            </Table.Cell>
                            <Table.Cell>Protocol</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={protocol_options}
                                        value={id ? encoders[id].jsonst.protocol : ""}
                                        onChange={(e, {value}) => this.setJsonState("protocol", value)}
                                />
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Size</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={vres_options}
                                        value={id ? encoders[id].jsonst.vres : ""}
                                        onChange={(e, {value}) => this.setJsonState("vres", value)}
                                />
                            </Table.Cell>
                            <Table.Cell>Channels</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={channels_options}
                                        value={id ? encoders[id].jsonst.channels : ""}
                                        onChange={(e, {value}) => this.setJsonState("channels", value)}
                                />
                            </Table.Cell>
                            <Table.Cell>Software</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={encstr_options}
                                        value={id ? encoders[id].jsonst.encstr : ""}
                                        onChange={(e, {value}) => this.setJsonState("encstr", value)}
                                />
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell><b>Target</b></Table.HeaderCell>
                            <Table.HeaderCell colSpan='2'>
                                <Select disabled={!id}
                                        compact options={dest_options}
                                        value={id ? encoders[id].jsonst.dest : ""}
                                        onChange={(e, {value}) => this.setJsonState("dest", value)}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell><b>Record</b></Table.HeaderCell>
                            <Table.HeaderCell>
                                <Select disabled={!id}
                                        compact options={encrec_options}
                                        value={id ? encoders[id].jsonst.encrec : ""}
                                        onChange={(e, {value}) => this.setJsonState("encrec", value)}
                                />
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
                <Message className='or_buttons' >
                    <Menu fluid secondary text>
                        <Menu.Item>
                            <Button.Group >
                                <Button positive disabled={status !== "Off"}
                                        onClick={this.startEncoder}>Start</Button>
                                <Button.Or text='enc' />
                                <Button negative disabled={status !== "On"}
                                        onClick={this.stopEncoder}>Stop</Button>
                            </Button.Group>
                        </Menu.Item>
                        <Menu.Item position='right'>
                            <List className='stat' size='small'>
                                <List.Item>
                                    <List.Icon name='microchip' />
                                    <List.Content
                                        className={parseInt(stat.cpu) > 90 ? "warning" : ""}>
                                        CPU: <b>{stat.cpu}</b></List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Icon name='server' />
                                    <List.Content
                                        className={parseInt(stat.hdd) > 90 ? "warning" : ""}>
                                        HDD: <b>{stat.hdd}</b></List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Icon name='thermometer' />
                                    <List.Content
                                        className={parseInt(stat.temp) > 80 ? "warning" : ""}>
                                        TMP: <b>{stat.temp}</b></List.Content>
                                </List.Item>
                            </List>
                        </Menu.Item>
                    </Menu>
                </Message>
            </Segment>
        );
    }
}

export default Encoders;