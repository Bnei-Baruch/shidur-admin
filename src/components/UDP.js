import React, {Component} from 'react'
import { Divider, Segment, Label, Message, Button } from 'semantic-ui-react'
import {getData} from "../shared/tools";


class UDP extends Component {

    state = {

        webrtc: {},
        json: {},
    };

    componentDidMount() {
        getData(`webrtc`, (webrtc) => {
            console.log(":: Got webrtc : ",webrtc);
            //const {encoders,decoders,captures} = streamer;
            this.setState({webrtc});
        });
    };

    setJson = (json) => {

        const {video,shidur,sadna,transout,servers} = this.state.webrtc;

        let json_rp = { listen : [], transmit : [{id : 99, address : "*", port : "*"}], target : [], map : []};
        console.log(":: JSON_RP : ",json_rp);

        let listen_id = 1;
        let target_id = 100;

        // for (let l in video) {
        //     let o = video[l];
        //     json_rp.listen.push({id: listen_id, title: o.language, address: "*", port: o.proxy_port.toString()});
        //     json_rp.map.push({source: listen_id, address: "*", port: "*", target: []});
        //     for (let s in servers) {
        //         let i = servers[s];
        //         if(i.enabled || s === "eur1") {
        //             let dup_port = (s === "lcl") ? o.local_port.toString() : o.janus_port.toString();
        //             json_rp.target.push({id: target_id, title: i.title, address: i.ip, port: dup_port, transmitter : 99});
        //             json_rp.map[listen_id - 1].target.push(target_id);
        //             target_id++;
        //         }
        //     }
        //     listen_id++;
        // }

        for (let l in sadna) {
            let o = sadna[l];
            json_rp.listen.push({id: listen_id, title: o.language, address: "*", port: o.proxy_port.toString()});
            json_rp.map.push({source: listen_id, address: "*", port: "*", target: []});
            for (let s in servers) {
                let i = servers[s];
                if(i.enabled) {
                    let dup_port = (s === "lcl") ? o.local_port.toString() : o.janus_port.toString();
                    json_rp.target.push({id: target_id, title: i.title, address: i.ip, port: dup_port, transmitter : 99});
                    json_rp.map[listen_id - 1].target.push(target_id);
                    target_id++;
                }
            }
            listen_id++;
        }

        for (let l in shidur) {
            let o = shidur[l];
            json_rp.listen.push({id: listen_id, title: o.language, address: "*", port: o.proxy_port.toString()});
            json_rp.map.push({source: listen_id, address: "*", port: "*", target: []});
            for (let s in servers) {
                let i = servers[s];
                if(i.enabled) {
                    let dup_port = (s === "lcl") ? o.local_port.toString() : o.janus_port.toString();
                    json_rp.target.push({id: target_id, title: i.title, address: i.ip, port: dup_port, transmitter : 99});
                    json_rp.map[listen_id - 1].target.push(target_id);
                    target_id++;
                }
            }
            listen_id++;
        }

        for (let l in transout) {
            let o = transout[l];
            json_rp.listen.push({id: listen_id, title: o.language, address: "*", port: o.proxy_port.toString()});
            json_rp.map.push({source: listen_id, address: "*", port: "*", target: []});
            for (let s in servers) {
                let i = servers[s];
                if(i.enabled) {
                    let dup_port = (s === "lcl") ? o.local_port.toString() : o.janus_port.toString();
                    json_rp.target.push({id: target_id, title: i.title, address: i.ip, port: dup_port, transmitter : 99});
                    json_rp.map[listen_id - 1].target.push(target_id);
                    target_id++;
                }
            }
            listen_id++;
        }

        //console.log(":: Set JSON : ",json);
    };

    render() {

        // const {captures} = this.props;
        // const {capture, status, auto, captimer, id} = this.state;
        //
        // let cap_options = Object.keys(captures).map((id, i) => {
        //     let capture = captures[id];
        //     return (
        //         <Dropdown.Item
        //             key={i}
        //             onClick={() => this.setCapture(id, capture)}>{capture.name}
        //         </Dropdown.Item>
        //     )
        // });

        return(
            <Segment textAlign='center' raised>
                <Label attached='top' size='big' >
                    UDP
                </Label>
                <Divider />
                <Message compact
                         className='timer' >UDP</Message>
                <Message className='or_buttons' >
                    <Button positive onClick={this.setJson}>Start</Button>
                </Message>

            </Segment>
        );
    }
}

export default UDP;