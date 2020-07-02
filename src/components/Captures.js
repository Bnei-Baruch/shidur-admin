import React, {Component} from 'react'
import {Checkbox, Divider, Segment, Label, Dropdown, Message, Button, List} from 'semantic-ui-react'
import {streamFetcher} from "../shared/tools";


class Captures extends Component {

    state = {
        auto: false,
        capture: {},
        id: "",
        ival: null,
        sval: null,
        status: "",
        captimer: "00:00:00",
        stat: {cpu: "", hdd: "", temp: ""}

    };

    componentDidMount() {
        const {id,captures} = this.props;
        if(id)
            this.setCapture(id, captures[id]);
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
        clearInterval(this.state.sval);
    };

    setCapture = (id, capture) => {
        console.log(":: Set capture: ",capture);
        if(capture.jsonst) {
            this.setState({id, capture, auto: capture.jsonst.auto});
        } else {
            this.setState({id, capture });
        }
        this.checkStatus(capture);
        this.statTimer(capture);
        if(id !== this.props.id)
            this.props.idState("capture_id", id);
    };

    setJsonState = (key, value) => {
        let {capture, id} = this.state;
        capture.jsonst[key] = value;
        this.props.jsonState("captures", {[id]: capture}, id);
    };

    checkStatus = (capture) => {
        let req = {"req":"strstat", "id":"status"};
        streamFetcher(capture.ip, `capture`, req,  (data) => {
            let status = data.jsonst.capture;
            console.log(":: Got Capture status: ",status);
            this.setState({status});
            status === "On" ? this.runTimer() : clearInterval(this.state.ival);
        });
    };

    startCapture = () => {
        this.setState({status: "On"});
        let {capture, auto} = this.state;
        let {jsonst} = capture;
        jsonst.id = "stream";
        jsonst.req = "start";
        jsonst.auto = auto;
        streamFetcher(capture.ip, `capture`, jsonst);
        this.runTimer();
    };

    stopCapture = () => {
        this.setState({status: "Off"});
        let {capture, auto} = this.state;
        let {jsonst} = capture;
        jsonst.id = "stream";
        jsonst.req = "stop";
        jsonst.auto = auto;
        streamFetcher(capture.ip, `capture`, jsonst);
        if(auto) setTimeout(() => this.checkStatus(capture), 2000);
        clearInterval(this.state.ival);
    };

    toggleAuto = () => {
        const {auto} = this.state;
        this.setState({auto: !auto});
        this.setJsonState("auto", !auto);
    };

    runTimer = () => {
        if(this.state.ival)
            clearInterval(this.state.ival);
        let ival = setInterval(() => {
            const {capture} = this.state;
            let req = {"req": "progress", "id": "stream"};
            streamFetcher(capture.ip, `capture`, req, (data) => {
                let progress = data.jsonst;
                let captimer = progress.out_time ? progress.out_time.split(".")[0] : "";
                //console.log(":: Got Capture progress: ", progress);
                this.setState({captimer});
            });
        }, 1000);
        this.setState({ival});
    };

    statTimer = (capture) => {
        this.getStat(capture);
        if(this.state.sval)
            clearInterval(this.state.sval);
        let sval = setInterval(() => {
            this.getStat(capture);
        }, 10000);
        this.setState({sval});
    };

    getStat = (capture) => {
        let req = {"req": "encstat", "id": "stream"};
        streamFetcher(capture.ip, `capture`, req, (data) => {
            let stat = data.jsonst ? data.jsonst : {cpu: "", hdd: "", temp: ""};
            //console.log(":: Got Encoder stat: ", stat);
            this.setState({stat});
        });
    };

    render() {

        const {captures} = this.props;
        const {capture, status, auto, captimer, id, stat} = this.state;

        let cap_options = Object.keys(captures).map((id, i) => {
            let capture = captures[id];
            return (
                <Dropdown.Item
                    key={i}
                    onClick={() => this.setCapture(id, capture)}>{capture.name}
                </Dropdown.Item>
            )
        });

        return(
            <Segment textAlign='center' color={status === "On" ? 'green' : 'red'} raised>
                <Label attached='top' size='big' >
                    <Dropdown item text={id ? capture.name: "Select:"}>
                        <Dropdown.Menu>{cap_options}</Dropdown.Menu>
                    </Dropdown>
                </Label>
                <Divider />
                <Message compact
                         negative={status === "Off"}
                         positive={status === "On"}
                         className='timer' >{captimer}</Message>
                <Message className='or_buttons'>
                    <Button.Group >
                        <Button positive disabled={status !== "Off"}
                                onClick={this.startCapture}>Start</Button>
                        <Button.Or text='cap' />
                        <Button negative disabled={status !== "On"}
                                onClick={this.stopCapture}>Stop</Button>
                    </Button.Group>
                    <Segment className='auto_button' compact>
                        <Checkbox toggle label='AutoRec'
                                  disabled={status === "" && !auto}
                                  checked={auto}
                                  onChange={this.toggleAuto}/>
                    </Segment>
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
                </Message>

            </Segment>
        );
    }
}

export default Captures;