import React, {Component, Fragment} from 'react'
import {Tab, Table, Icon, Button, Modal, Header, Input, Menu} from 'semantic-ui-react'
import {getData, putData, removeData} from "../shared/tools";


class WebRTC extends Component {

    state = {
        conf: {},
        sadna: {},
        sound: {},
        trlout: {},
        video: {},
        special: {},
        servers: {},
        open: false,
        source: "",
        new_prop: false,
    };

    componentDidMount() {
        this.getConf();
    };

    getConf = () => {
        getData(`webrtc`, (webrtc) => {
            console.log(":: Got webrtc : ",webrtc);
            const {sadna,sound,trlout,video,special,servers} = webrtc;
            this.setState({sadna,sound,trlout,video,special,servers});
        });
    };

    addNew = (source, new_prop) => {
        let conf
        if(source === "video") {
            conf = {language: "", title: "", proxy_port: "", janus_port: "", janus_id: ""}
        } else if(source === "servers") {
            conf = {language: "", title: "", dns: "", ip: "", enabled: true}
        } else {
            conf = {language: "", proxy_port: "", janus_port: "", janus_id: "", ffmpeg_channel: ""}
        }
        this.setState({open: true, source, new_prop, conf})
    };

    editProp = (source, new_prop, conf) => {
        console.log("Edit: ", conf)
        this.setState({open: true, source, new_prop, conf});
    };

    setValue = (key, value) => {
        const {conf} = this.state;
        conf[key] = value;
        this.setState({conf})
    };

    saveProp = () => {
        const {source,conf} = this.state;
        console.log(":: Save item: ", conf);
        putData(`webrtc/${source}/${conf.language}`, conf, (data) => {
            console.log("saveProp callback: ", data);
            this.getConf();
        });
    };

    removeProp = () => {
        const {source,conf} = this.state;
        console.log(":: Del item: ", conf);
        removeData(`webrtc/${source}/${conf.language}`, (data) => {
            console.log("removeProp callback: ", data);
            this.getConf();
        });
    };

    renderContent = () => {
        const {source,conf} = this.state;
        if(source === "video") {
            let {language, proxy_port, janus_port, janus_id} = conf;
            return (
                <Table compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Proxy Port</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Janus Port</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Janus ID</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row className="monitor_tr">
                            <Table.Cell><Input size='mini' value={language} onChange={(e) => this.setValue("language", e.target.value)} /></Table.Cell>
                            <Table.Cell><Input size='mini' type="number" value={proxy_port} onChange={(e) => this.setValue("proxy_port", Number(e.target.value))} /></Table.Cell>
                            <Table.Cell><Input size='mini' type="number" value={janus_port} onChange={(e) => this.setValue("janus_port", Number(e.target.value))} /></Table.Cell>
                            <Table.Cell><Input size='mini' type="number" value={janus_id} onChange={(e) => this.setValue("janus_id", Number(e.target.value))} /></Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            )
        } else if(source === "servers") {
            let {language, title, dns, ip} = conf;
            return (
                <Table compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                            <Table.HeaderCell width={1}>DNS</Table.HeaderCell>
                            <Table.HeaderCell width={1}>IP</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Enabled</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row className="monitor_tr">
                            <Table.Cell><Input size='mini' value={language} onChange={(e) => this.setValue("language", e.target.value)} /></Table.Cell>
                            <Table.Cell><Input size='mini' value={title} onChange={(e) => this.setValue("title", e.target.value)} /></Table.Cell>
                            <Table.Cell><Input size='mini' value={dns} onChange={(e) => this.setValue("dns", e.target.value)} /></Table.Cell>
                            <Table.Cell><Input size='mini' value={ip} onChange={(e) => this.setValue("ip", e.target.value)} /></Table.Cell>
                            <Table.Cell><Input size='mini' /></Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            )
        } else {
            let {language, proxy_port, janus_port, janus_id, ffmpeg_channel} = conf;
            return (
                <Table compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Proxy Port</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Janus Port</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Janus ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Dante</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row className="monitor_tr">
                            <Table.Cell><Input size='mini' value={language} onChange={(e) => this.setValue("language", e.target.value)} /></Table.Cell>
                            <Table.Cell><Input size='mini' type="number" value={proxy_port} onChange={(e) => this.setValue("proxy_port", Number(e.target.value))} /></Table.Cell>
                            <Table.Cell><Input size='mini' type="number" value={janus_port} onChange={(e) => this.setValue("janus_port", Number(e.target.value))} /></Table.Cell>
                            <Table.Cell><Input size='mini' type="number" value={janus_id} onChange={(e) => this.setValue("janus_id", Number(e.target.value))} /></Table.Cell>
                            <Table.Cell><Input size='mini' type="number" value={ffmpeg_channel + 1} onChange={(e) => this.setValue("ffmpeg_channel", (Number(e.target.value) - 1))} /></Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            )
        }
    };

    render() {
        const {sadna,sound,trlout,video,special,servers,open,source,new_prop} = this.state;
        const v = (<Icon color='green' name='checkmark' />);
        const x = (<Icon color='red' name='close' />);

        let sadna_options = Object.keys(sadna).map((id, i) => {
            let conf = sadna[id];
            return (
                <Table.Row key={i} className="monitor_tr" onClick={() => this.editProp('sadna', false, conf)}>
                    <Table.Cell>{conf.language}</Table.Cell>
                    <Table.Cell>{conf.proxy_port}</Table.Cell>
                    <Table.Cell>{conf.janus_port}</Table.Cell>
                    <Table.Cell>{conf.janus_id}</Table.Cell>
                    <Table.Cell>{conf.ffmpeg_channel + 1}</Table.Cell>
                </Table.Row>
            )
        });

        let sound_options = Object.keys(sound).map((id, i) => {
            let conf = sound[id];
            return (
                <Table.Row key={i} className="monitor_tr" onClick={() => this.editProp('sound', false, conf)}>
                    <Table.Cell>{conf.language}</Table.Cell>
                    <Table.Cell>{conf.proxy_port}</Table.Cell>
                    <Table.Cell>{conf.janus_port}</Table.Cell>
                    <Table.Cell>{conf.janus_id}</Table.Cell>
                    <Table.Cell>{conf.ffmpeg_channel + 1}</Table.Cell>
                </Table.Row>
            )
        });

        let trlout_options = Object.keys(trlout).map((id, i) => {
            let conf = trlout[id];
            return (
                <Table.Row key={i} className="monitor_tr" onClick={() => this.editProp('trlout', false, conf)}>
                    <Table.Cell>{conf.language}</Table.Cell>
                    <Table.Cell>{conf.proxy_port}</Table.Cell>
                    <Table.Cell>{conf.janus_port}</Table.Cell>
                    <Table.Cell>{conf.janus_id}</Table.Cell>
                    <Table.Cell>{conf.ffmpeg_channel + 1}</Table.Cell>
                </Table.Row>
            )
        });

        let special_options = Object.keys(special).map((id, i) => {
            let conf = special[id];
            return (
                <Table.Row key={i} className="monitor_tr" onClick={() => this.editProp('special', false, conf)}>
                    <Table.Cell>{conf.language}</Table.Cell>
                    <Table.Cell>{conf.proxy_port}</Table.Cell>
                    <Table.Cell>{conf.janus_port}</Table.Cell>
                    <Table.Cell>{conf.janus_id}</Table.Cell>
                    <Table.Cell>{conf.ffmpeg_channel + 1}</Table.Cell>
                </Table.Row>
            )
        });

        let video_options = Object.keys(video).map((id, i) => {
            let conf = video[id];
            return (
                <Table.Row key={i} className="monitor_tr" onClick={() => this.editProp('video', false, conf)}>
                    <Table.Cell>{conf.language}</Table.Cell>
                    <Table.Cell>{conf.proxy_port}</Table.Cell>
                    <Table.Cell>{conf.janus_port}</Table.Cell>
                    <Table.Cell>{conf.janus_id}</Table.Cell>
                </Table.Row>
            )
        });

        let servers_options = Object.keys(servers).map((id, i) => {
            let conf = servers[id];
            return (
                <Table.Row key={i} className="monitor_tr" onClick={() => this.editProp('servers', false, conf)}>
                    <Table.Cell>{conf.language}</Table.Cell>
                    <Table.Cell>{conf.title}</Table.Cell>
                    <Table.Cell>{conf.dns}</Table.Cell>
                    <Table.Cell>{conf.ip}</Table.Cell>
                    <Table.Cell>{conf.enabled ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        const panes = [
            { menuItem: 'Video', render: () =>
                 <Tab.Pane>
                    <Table compact='very' basic size='small'>
                        <Table.Header>
                            <Table.Row className='table_header'>
                                <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                                <Table.HeaderCell width={1}>Proxy Port</Table.HeaderCell>
                                <Table.HeaderCell width={1}>Janus Port</Table.HeaderCell>
                                <Table.HeaderCell width={1}>Janus ID</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {video_options}
                        </Table.Body>
                    </Table>
                     <Button size="mini" fluid onClick={() => this.addNew('video', true)}>Add....</Button>
                </Tab.Pane> },
            { menuItem: 'Sound', render: () =>
                    <Tab.Pane>
                        <Table compact='very' basic size='small'>
                            <Table.Header>
                                <Table.Row className='table_header'>
                                    <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Proxy Port</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Janus Port</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Janus ID</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Dante</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {sound_options}
                            </Table.Body>
                        </Table>
                        <Button size="mini" fluid onClick={() => this.addNew('sound', true)}>Add....</Button>
                    </Tab.Pane> },
            { menuItem: 'Sadna', render: () =>
                    <Tab.Pane>
                        <Table compact='very' basic size='small'>
                            <Table.Header>
                                <Table.Row className='table_header'>
                                    <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Proxy Port</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Janus Port</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Janus ID</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Dante</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {sadna_options}
                            </Table.Body>
                        </Table>
                        <Button size="mini" fluid onClick={() => this.addNew('sadna', true)}>Add....</Button>
                    </Tab.Pane> },
            { menuItem: 'Trlout', render: () =>
                    <Tab.Pane>
                        <Table compact='very' basic size='small'>
                            <Table.Header>
                                <Table.Row className='table_header'>
                                    <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Proxy Port</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Janus Port</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Janus ID</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Dante</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {trlout_options}
                            </Table.Body>
                        </Table>
                        <Button size="mini" fluid onClick={() => this.addNew('trlout', true)}>Add....</Button>
                    </Tab.Pane> },
            { menuItem: 'Special', render: () =>
                    <Tab.Pane>
                        <Table compact='very' basic size='small'>
                            <Table.Header>
                                <Table.Row className='table_header'>
                                    <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Proxy Port</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Janus Port</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Janus ID</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Dante</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {special_options}
                            </Table.Body>
                        </Table>
                        <Button size="mini" fluid onClick={() => this.addNew('special', true)}>Add....</Button>
                    </Tab.Pane> },
            { menuItem: 'Servers', render: () =>
                    <Tab.Pane>
                        <Table compact='very' basic size='small'>
                            <Table.Header>
                                <Table.Row className='table_header'>
                                    <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Title</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>DNS</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>IP</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Enabled</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {servers_options}
                            </Table.Body>
                        </Table>
                        <Button size="mini" fluid onClick={() => this.addNew('servers', true)}>Add....</Button>
                    </Tab.Pane> },
        ]

        return (
            <Fragment>
                <Tab panes={panes} className='webrtc' />
            <Modal
                open={open}
                onClose={() => this.setState({open: false})}
                size='small'
                closeIcon
            >
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

export default WebRTC;