import React, {Component} from 'react'
import {Divider, Segment, Label, Button, Select} from 'semantic-ui-react'
import {getService, getStreamUrl, id_options, putData, rstr_options, toHms} from "../shared/tools";
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
        this.saveData(restream[id])
    };

    delRestream = (i) => {
        const {restream} = this.props;
        const {id, services} = this.state;
        if(services[i].alive)
            return;
        restream[id].services.splice(i, 1);
        this.saveData(restream[id])
    };

    addNote = (i, description) => {
        const {restream} = this.props;
        const {id} = this.state;
        restream[id].services[i].description = description;
        getStreamUrl(this.state.language, url => {
            let cmd = `-progress stat_${id}.log -hide_banner -re -i ${url} -c copy -bsf:a aac_adtstoasc -f flv ${description}`
            let arg = cmd.split(" ");
            restream[id].services[i].args = arg;
            this.saveData(restream[id])
        });
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
            if(services) {
                for(let i=0; i<services.length; i++) {
                    //services[i].out_time = services[i].log.split('time=')[1].split('.')[0];
                    services[i].out_time = toHms(services[i].runtime);
                }
                this.setState({services});
            } else {
                this.setState({services: []});
            }
        })
    };

    render() {
        const {rsid, id, services, language} = this.state;

        let services_list = services.map((stream,i) => {
            return (<Service key={i} index={i} service={services[i]} id={id}
                             saveData={this.saveData} removeRestream={this.delRestream} addNote={this.addNote} />);
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