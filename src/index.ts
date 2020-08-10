import SerialPort from 'serialport';
const port = new SerialPort('COM13', { baudRate: 9600 })
const parser = port.pipe(new SerialPort.parsers.Delimiter({delimiter:"0D",includeDelimiter:true}))

// https://emu.bz/Kzf

// tty.usbserial-AD0K1FF9
/// dev/tty.usbserial-AD0K1DTS

const protocol = `
Start Sentinel
 | Direction
 |  |\  Command   Payload
 |  | \   | Length /|\   Checksum
 |  |  \  |   |   / | \    |  End Sentinel
0C 0E 03 32 03  FF FF F1  35  0D
`;

// Read messages like: 0C 03 0E 01 00 12 0D
// 0C is a sync characters
// 03 is an address
// 0E is an address
// 01 is the type of message
// 00 is the length of the payload
// 12 is the checksum of (03 0E 01 00)
// All messages are 7 bytes + whatever the size of the payload is.
// Payload size is in the 5th bytes of any message


// Example payload
//  1  2  3  4  5  6  7  8  9
// FF FF F1 01 84 00 00 01 48
port.write("t")
setInterval(() => {
     port.write("w");
     console.log("sent w")
}, 2000)
setInterval(() => {
     port.write("t");
     console.log("sent t")
}, 2500)
function buf2hex(buffer: Buffer) { // buffer is an ArrayBuffer
     return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).toUpperCase().slice(-2)).join(' ');
   }
function showPortOpen() {
     console.log('port open. Data rate: ' + port.baudRate);
     port.write(Buffer.from("0x0C030E0100120D","hex"))
     port.write("o")
}

   function readSerialData(data: Buffer) {
        console.log(buf2hex(data) + ' ' + data.toString());
   }

   function showPortClose() {
     console.log('port closed.');
   }

   function showError(error:string) {
     console.log('Serial port error: ' + error);
   }
port.on('open', showPortOpen);
parser.on('data', readSerialData);
port.on('close', showPortClose);
port.on('error', showError);
port.write("henlo")
port.write("henlo")
port.write("henlo")
port.write("henlo")

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
console.log("hi");

