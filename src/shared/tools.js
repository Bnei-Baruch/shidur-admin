export const JSDB_STATE = process.env.REACT_APP_JSDB_STATE;
export const JSRP_BACKEND = process.env.REACT_APP_JSRP_BACKEND;
export const WFSRV_BACKEND = process.env.REACT_APP_WFSRV_BACKEND;

export const PIRATI = process.env.REACT_APP_PIRATI;
export const TEST = process.env.REACT_APP_TEST;
export const MERKAZ_MAIN = process.env.REACT_APP_MERKAZ_MAIN;
export const MERKAZ_BACKUP = process.env.REACT_APP_MERKAZ_BACKUP;
export const VPN_MAIN = process.env.REACT_APP_VPN_MAIN;
export const VPN_BACKUP = process.env.REACT_APP_VPN_BACKUP;
export const DECODER_MAIN = process.env.REACT_APP_DECODER_MAIN;
export const DECODER_BACKUP = process.env.REACT_APP_DECODER_BACKUP;
export const DECODER_TEST = process.env.REACT_APP_DECODER_TEST;

export const streamFetcher = (ip, path, data, cb) => fetch(`http://${ip}:8081/${path}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body:  JSON.stringify(data)
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Put Data error:", ex));

export const getData = (path, cb) => fetch(`${JSDB_STATE}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const getWorkflowData = (path, cb) => fetch(`${JSRP_BACKEND}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const putData = (path, data, cb) => fetch(`${JSDB_STATE}/${path}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body:  JSON.stringify(data)
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Put Data error:", ex));

export const removeData = (path, cb) => fetch(`${JSDB_STATE}/${path}`, {
    method: 'DELETE',
    headers: {'Content-Type': 'application/json'},
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Remove Data error:", ex));

export const vrate_options = [
    { key: '24000', text: '24000k', value: '24000' },
    { key: '12000', text: '12000k', value: '12000' },
    { key: '8000', text: '8000k', value: '8000' },
    { key: '4000', text: '4000k', value: '4000' },
    { key: '2500', text: '2500k', value: '2500' },
    { key: '2000', text: '2000k', value: '2000' },
    { key: '1000', text: '1000k', value: '1000' },
    { key: '600', text: '600k', value: '600' },
    { key: '300', text: '300k', value: '300' },
];

export const vres_options = [
    { key: 'Hi50', text: 'HD 50i', value: 'Hi50' },
    { key: 'Hp25', text: 'HD 25p', value: 'Hp25' },
    { key: 'pal', text: 'SD 50i', value: 'pal' },
];

export const arate_options = [
    { key: '2048', text: '2048k', value: '2048' },
    { key: '1024', text: '1024k', value: '1024' },
    { key: '512', text: '512k', value: '512' },
    { key: '256', text: '256k', value: '256' },
    { key: '128', text: '128k', value: '128' },
    { key: '64', text: '64k', value: '64' },
];

export const channels_options = [
    { key: 'da', text: 'Da', value: 'da' },
    { key: '16', text: '16', value: '16' },
    { key: '8', text: '8', value: '8' },
    { key: '2', text: '2', value: '2' },
];

export const langch_options = [
    { key: '27', text: '27', value: '27' },
    { key: '24', text: '24', value: '24' },
    { key: '8', text: '8', value: '8' },
    { key: '2', text: '2', value: '2' },
];

export const encstr_options = [
    { key: 'ffmpeg', text: 'FFMPEG', value: 'ffmpeg' },
    { key: 'gstreamer', text: 'GST', value: 'gstreamer' },
];

export const encrec_options = [
    { key: 'yes', text: 'Yes', value: 'yes' },
    { key: 'no', text: 'No', value: 'no' },
];

export const protocol_options = [
    { key: 'rtp', text: 'RTP', value: 'rtp' },
    { key: 'rtmp', text: 'RTMP', value: 'rtmp' },
    { key: 'mpegts', text: 'MPEG-TS', value: 'mpegts' },
    { key: 'webrtc', text: 'WebRTC', value: 'webrtc' },
];

export const rtcpip_options = [
    { key: 'pirati', text: 'Pirati', value: `${PIRATI}` },
    { key: 'test', text: 'Test', value: `${TEST}` },
    { key: 'main', text: 'Merkaz-Main', value: `${MERKAZ_MAIN}` },
    { key: 'backup', text: 'Merkaz-Backup', value: `${MERKAZ_BACKUP}` },
    { key: 'backup_vpn', text: 'VPN-Backup', value: `${VPN_BACKUP}` },
    { key: 'main_vpn', text: 'VPN-Main', value: `${VPN_MAIN}` },
];

export const dest_options = [
    { key: 'test', text: 'Decoder Test', value: `${DECODER_TEST}` },
    { key: 'decoder_main', text: 'Decoder Main', value: `${DECODER_MAIN}` },
    { key: 'decoder_backup', text: 'Decoder Backup', value: `${DECODER_BACKUP}` },
];

export const buffer_options = [
    { key: '2000', text: '2000ms', value: '2000' },
    { key: '1000', text: '1000ms', value: '1000' },
    { key: '900', text: '900ms', value: '900' },
    { key: '800', text: '800ms', value: '800' },
    { key: '700', text: '700ms', value: '700' },
    { key: '600', text: '600ms', value: '600' },
    { key: '500', text: '500ms', value: '500' },
    { key: '400', text: '400ms', value: '400' },
    { key: '300', text: '300ms', value: '300' },
    { key: '200', text: '200ms', value: '200' },
    { key: '100', text: '100ms', value: '100' },
];
