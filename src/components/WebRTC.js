import React, {Component} from 'react'
import {Tab, Table, Icon} from 'semantic-ui-react'
import {getData} from "../shared/tools";


class WebRTC extends Component {

    state = {
        sadna: {},
        sound: {},
        trlout: {},
        video: {},
        special: {},
        servers: {},
    };

    componentDidMount() {
        getData(`webrtc`, (webrtc) => {
            console.log(":: Got webrtc : ",webrtc);
            const {sadna,sound,trlout,video,special,servers} = webrtc;
            this.setState({sadna,sound,trlout,video,special,servers});
        });
    };

    render() {
        const {sadna,sound,trlout,video,special,servers} = this.state;
        const v = (<Icon color='green' name='checkmark' />);
        const x = (<Icon color='red' name='close' />);

        let sadna_options = Object.keys(sadna).map((id, i) => {
            let conf = sadna[id];
            return (
                <Table.Row key={i} className="monitor_tr">
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
                <Table.Row key={i} className="monitor_tr">
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
                <Table.Row key={i} className="monitor_tr">
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
                <Table.Row key={i} className="monitor_tr">
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
                <Table.Row key={i} className="monitor_tr">
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
                <Table.Row key={i} className="monitor_tr">
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
                    </Tab.Pane> },
            { menuItem: 'Servers', render: () =>
                    <Tab.Pane>
                        <Table compact='very' basic size='small'>
                            <Table.Header>
                                <Table.Row className='table_header'>
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
                    </Tab.Pane> },
        ]

        return (
            <Tab panes={panes} />
        );
    }
}

export default WebRTC;