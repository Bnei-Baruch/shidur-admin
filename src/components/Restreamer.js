import React, {Component} from 'react'
import {Divider, Segment, Label, Button, Select} from 'semantic-ui-react'
import {getService, id_options, putData, rstr_options, toHms} from "../shared/tools";
import Service from "./Service";

class Restreamer extends Component {

    state = {
        restream: {},
        id: "live-proxy",
        ival: null,
        services: [],
        status: "",

        description: "",
        name: "",
        language: "heb",
        rsid: "fb",
        url: "",
        db: {
            restream: []
        }
    };

    componentDidMount() {
        this.runTimer();
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    addRestream = () => {
        const {restream} = this.props;
        const {rsid, language, description, id} = this.state;
        if(!restream[id].services) {
            restream[id].services = [];
        }
        restream[id].services.push({description, id: language + "-" + rsid, name: "ffmpeg", args: []});
        console.log(restream[id]);
        this.saveData(restream[id])
    };

    delRestream = (i) => {
        const {restream} = this.props;
        const {id} = this.state;
        restream[id].services.splice(i, 1);
        console.log(restream[id], i);
        this.saveData(restream[id])
    };

    saveData = (props) => {
        putData(`streamer/restream/live-proxy`, props, (data) => {
            console.log("saveProp callback: ", data);
        });
    };

    startEncoder = () => {
        let {id} = this.state;
        getService(id + "/start", () => {})
    };

    stopEncoder = () => {
        let {id} = this.state;
        getService(id + "/stop", () => {})
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
        const {id} = this.state;
        getService(id + "/status", (services) => {
            for(let i=0; i<services.length; i++) {
                //services[i].out_time = services[i].log.split('time=')[1].split('.')[0];
                services[i].out_time = toHms(services[i].runtime);
            }
            this.setState({services});
        })
    };

    render() {

        const {restream} = this.props;
        const {rsid, id, status, stat, services, language} = this.state;

        let services_list = services.map((stream,i) => {
            return (<Service key={i} index={i} service={services[i]} id={id} saveData={this.saveData} removeRestream={this.delRestream} />);
        });

        return(
            <Segment padded textAlign='center' color='brown'>
                <Divider />

                <Label size='big' >
                    <Select compact options={rstr_options} value={language} size='big'
                            onChange={(e, {value}) => this.setState({language: value})} />
                    <Select compact options={id_options} value={rsid} size='big'
                            onChange={(e, {value}) => this.setState({rsid: value})} />
                    <Button size='big' color='green' onClick={this.addRestream}>Add</Button>
                </Label>
                <Divider />

                {services_list}

            </Segment>
        );
    }
}

export default Restreamer;