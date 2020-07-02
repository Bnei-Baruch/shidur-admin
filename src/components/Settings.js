import React, {Component} from 'react'
import { Divider, Table, Segment, Label, Dropdown, Input, Button } from 'semantic-ui-react'
import {getData, putData, removeData} from "../shared/tools";


class Settings extends Component {

    state = {
        name: "",
        ip: "",
        id: "",
        status: null,
        streamer: {}
    };

    componentDidMount() {
        getData(`streamer`, (streamer) => {
            console.log(":: Got streamer: ",streamer);
            this.setState({streamer});
        });
    };

    newStreamerItem = () => {
        let {id,streamer,name,ip} = this.state;
        let itemid = id.toLowerCase();
        let prop = name.toLowerCase();
        streamer[itemid][prop] = {name, ip , jsonst: {}};
        console.log(streamer);
        this.setState({streamer, name: "", ip: ""});
        putData(`streamer/${itemid}/${prop}`, {name, ip , jsonst: {}}, (data) => {
            console.log("newStreamerItem callback: ", data);
            this.props.getState();
        });
    };

    setStreamerItem = (id) => {
        console.log(":: Set streamer item: ",id);
        this.setState({id});
    };

    saveStreamer = () => {
        let {streamer,itemid,item} = this.state;
        let json = streamer[itemid][item];
        putData(`streamer/${itemid}/${item}`, json, (data) => {
            console.log("saveStreamerItem callback: ", data);
            this.props.getState();
        });
    };

    delStreamerItem = (name) => {
        let {id,streamer} = this.state;
        let itemid = id.toLowerCase();
        let prop = name.toLowerCase();
        delete streamer[itemid][prop];
        console.log(":: Del streamer item: ",name);
        this.setState({streamer});
        removeData(`streamer/${itemid}/${prop}`, (data) => {
            console.log("delStreamerItem callback: ", data);
            this.props.getState();
        });
    };

    setValue = (item, value, prop) => {
        let {id,streamer} = this.state;
        let itemid = id.toLowerCase();
        //console.log(":: Set streamer id: " + itemid + " item: " + item + " value: " + value);
        streamer[itemid][item][prop] = value;
        this.setState({streamer,itemid,item});
        //fetch(`${JSDB_STATE}/streamer/${itemid}/${item}?status=${value}`, { method: 'POST',})
    };

    render() {

        const {name, ip, id, streamer} = this.state;
        const item = streamer[id.toLowerCase()];

        let set_options = Object.keys(item || []).map((itemid, i) => {
            let pname = this.props[id.toLowerCase()][itemid] ? this.props[id.toLowerCase()][itemid].name : "";
            let pip = this.props[id.toLowerCase()][itemid] ? this.props[id.toLowerCase()][itemid].ip : "";
            let d = pname === item[itemid].name & pip === item[itemid].ip;
            return (
                <Table.Row key={i}>
                    <Table.Cell>Name</Table.Cell>
                    <Table.Cell>
                        <Input disabled size='mini' value={item[itemid].name}
                               onChange={(e) => this.setValue(itemid, e.target.value,"name")} />
                    </Table.Cell>
                    <Table.Cell>IP</Table.Cell>
                    <Table.Cell>
                        <Input size='mini' value={item[itemid].ip}
                               onChange={(e) => this.setValue(itemid, e.target.value,"ip")} />
                    </Table.Cell>
                    <Table.Cell>
                        <Button size='mini' positive disabled={d}
                                onClick={this.saveStreamer}>Save</Button>
                    </Table.Cell>
                    <Table.Cell>
                        <Button size='mini' negative
                                onClick={() => this.delStreamerItem(item[itemid].name)}>Del</Button>
                    </Table.Cell>
                </Table.Row>
            )
        });

        return(
            <Segment textAlign='center' color='brown' raised>
                <Label attached='top' size='big' >
                    <Dropdown item text={id || "Select:"}>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => this.setStreamerItem("Encoders")}>Encoders</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.setStreamerItem("Decoders")}>Decoders</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.setStreamerItem("Captures")}>Captures</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.setStreamerItem("Playouts")}>Playouts</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.setStreamerItem("Workflows")}>Workflows</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Label>
                <Divider />

                <Table basic='very' compact='very' collapsing>
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
                        {set_options}
                        <Table.Row disabled={id === ""}>
                            <Table.Cell>Name</Table.Cell>
                            <Table.Cell>
                                <Input size='mini' placeholder='Name...' value={name}
                                       onChange={(e) => this.setState({name: e.target.value})}/>
                            </Table.Cell>
                            <Table.Cell>IP</Table.Cell>
                            <Table.Cell>
                                <Input size='mini' placeholder='IP...' value={ip}
                                       onChange={(e) => this.setState({ip: e.target.value})}/>
                            </Table.Cell>
                            <Table.Cell>
                                <Button size='mini' positive disabled={name === "" & ip === ""}
                                        onClick={this.newStreamerItem}>New</Button>
                            </Table.Cell>
                            <Table.Cell></Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default Settings;