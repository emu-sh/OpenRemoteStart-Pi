var SerialPort = require('serialport');
var readline = require('readline');
//tty.usbserial-AD0K1FF9
///dev/tty.usbserial-AD0K1DTS
var serial = new SerialPort('/dev/tty.usbserial-AD0K1FF9', { BaudRate: 9800 });
serial.BaudRate = 9800;
// Example payload
//  1  2  3  4  5  6  7  8  9
// FF FF F1 01 84 00 00 01 48
var Actions = {
    lock: 0x30,
    unlock: 0x31,
    start: 0x32,
    stop: 0x33,
    trunk_release: 0x34,
    panic: 0x35,
    unlock2: 0x38,
    aux1: 0x39,
    aux2: 0x3A,
    aux3: 0x3B,
    aux4: 0x3C,
    status_request: 0xAA,
    status_request2: 0xAE,
    toggle_valet_mode: 0xA8,
    prog_btn_press: 0xE3
};
var HardwareStatus = {
    led_on: 0x01,
    led_off: 0x02,
    status_update: 0xB8,
    led_flashing: 0x04,
    remote_pairing: 0xBF
};
var FortinStatus = /** @class */ (function () {
    function FortinStatus() {
        this.counter = 0;
    }
    FortinStatus.prototype.update = function () {
    };
    return FortinStatus;
}());
// When this is true we will try to clone an existing
// address seen on the uart databus. Normally one
// will want to pair with the remote starter. However,
// due to protocol flaws it is relatively easy to just
// repurpose an existing address. There is really no
// downside to repurposing an existing address besides
// that this is not what the protocol designers wanted
// us to do. This will automatically get set to false
// once an address is learned.
var remoteAddress = [0xDE, 0xAD, 0x01];
/* The time in ms since the last status update. */
var lastStatusUpdate = 0;
/**
 * @param  message - Message to send in hex
 */
// const  write = (number:  msg) => {
// }
var stream = serial.pipe(new Readline());
serial.on('readable', function () {
    console.log('Data:', serial.read());
});
serial.on('data', function (data) {
    console.log('Data:', data);
});
serial.write(Buffer.from("0xbada55"));
