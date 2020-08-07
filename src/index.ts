import SerialPort from 'serialport'
import readline from 'readline'
// tty.usbserial-AD0K1FF9
/// dev/tty.usbserial-AD0K1DTS
const serial = new SerialPort('/dev/tty.usbserial-AD0K1FF9', {baudRate: 9800})
// Example payload
//  1  2  3  4  5  6  7  8  9
// FF FF F1 01 84 00 00 01 48
const Actions =  {
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
     prog_btn_press: 0xE3,
}
const HardwareStatus  = {
     led_on: 0x01,
     led_off: 0x02,
     status_update: 0xB8,
     led_flashing: 0x04,
     remote_pairing: 0xBF
}

class FortinStatus {
     valetMode:boolean = false;
     remoteStarted:boolean = false;
     engineTurningOver:boolean = false;
     accessoryMode:boolean = false;
     unknownFlag1:boolean = false;
     trunkOpen:boolean = false;
     doorOpen:boolean = false;
     armed:boolean = false;
     remoteAddress:number= 0x00;
     address:number = 0x00;
     counterType:number = 0x00;
     counter:number = 0;
     /* the time in ms until the remote starter shuts  off */
     shutoffCounter: number = 0;
     constructor(){
               // todo
     }
     update() {
          // todo
     }
}
// When this is true we will try to clone an existing
// address seen on the uart databus. Normally one
// will want to pair with the remote starter. However,
// due to protocol flaws it is relatively easy to just
// repurpose an existing address. There is really no
// downside to repurposing an existing address besides
// that this is not what the protocol designers wanted
// us to do. This will automatically get set to false
// once an address is learned.
const remoteAddress = [0xDE, 0xAD, 0x01];



/* The time in ms since the last status update. */
const lastStatusUpdate = 0;
/**
 * @param  message - Message to send in hex
 */
// const  write = (number:  msg) => {

// }

const stream = serial.pipe(process.stdout);
serial.on('readable', () => console.log('Data:', serial.read()))

serial.on('data',  (data) => console.log('Data:', data))
serial.write(Buffer.from("0xbada55"))
