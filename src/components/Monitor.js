import React, {Component, Fragment} from 'react'
import {Table, Icon} from 'semantic-ui-react'
import mqtt from "../shared/mqtt";


class Monitor extends Component {

    state = {
        status: {}
    };

    componentDidMount() {
        this.props.onRef(this);
        const status = 'exec/status/#';
        mqtt.join(status);
    };

    componentWillUnmount() {
        this.props.onRef(undefined)
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
        mqtt.send("status", false, "exec/service/udp-proxy");
    };

    onMqttMessage = (message, topic) => {
        //console.log("[encoders] Message: ", message, topic.split("/")[2]);
        const {status} = this.state;
        const id = topic.split("/")[2]
        status[id] = message === "Online";
        this.setState({status});
    };

    render() {
        const {streamer} = this.props;
        const {status} = this.state;
        const v = (<Icon color='green' name='checkmark' />);
        const x = (<Icon color='red' name='close' />);

        let monitor = Object.keys(streamer).map((key, i) => {
            //console.log(streamer[key])
            return (
                <Table key={key} compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={3}>{key}</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Status</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    {Object.keys(streamer[key]).map((val, i) => {
                        //console.log(val)
                        const n = status[val] ? v : x;
                        return (
                            <Table.Body>
                                <Table.Row key={val} className="monitor_tr">
                                    <Table.Cell>{val}</Table.Cell>
                                    <Table.Cell>{n}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        )
                    })}
                </Table>
            )
        });

        return (
            <Fragment>
                {monitor}
            </Fragment>
        );
    }
}

export default Monitor;
