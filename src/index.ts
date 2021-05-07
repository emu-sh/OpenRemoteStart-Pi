const SerialPort = require("serialport");
const Regex = require("@serialport/parser-regex");
const readline = require("readline");
const port = new SerialPort("/dev/ttyUSB0", { baudRate: 9600 });
const parser = port.pipe(
  new SerialPort.parsers.Delimiter({
    delimiter: Buffer.from("0d", "hex"),
    includeDelimiter: true,
  })
);
const rl = readline.createInterface({
  input: process.stdin,
});

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
const remoteAddress = Buffer.from([0xde, 0xad, 0x01, 0x00, 0x33]);
enum Actions {
  lock = 0x30,
  unlock = 0x31,
  start = 0x32,
  stop = 0x33,
  trunk_release = 0x34,
  panic = 0x35,
  unlock2 = 0x38,
  aux1 = 0x39,
  aux2 = 0x3a,
  aux3 = 0x3b,
  aux4 = 0x3c,
  status_request = 0xaa,
  status_request2 = 0xae,
  toggle_valet_mode = 0xa8,
  prog_btn_press = 0xe3,
}
enum HardwareStatus {
  led_on = 0x01,
  led_off = 0x02,
  status_update = 0xb8,
  led_flashing = 0x04,
  remote_pairing = 0xbf,
}
// Read messages like: 0C 03 0E 01 00 12 0D
// 0C is a sync characters
// 03 is an address
// 0E is an address
// 01 is the type of message
// 00 is the length of the payload
// 12 is the checksum of (03 0E 01 00)
// All messages are 7 bytes + whatever the size of the payload is.
// Payload size is in the 5th bytes of any message

// 0c030eb809ffffff01ce4040074b700d
// 0c030e04020100180d
// 0c030eb809ffffff01ce4040074b700d
// 0c030e04020100180d
// 0c030eb809ffffff01ce4040074b700d
// Example payload
//  1  2  3  4  5  6  7  8  9
// FF FF F1 01 84 00 00 01 48

setInterval(() => {
  // let buffer = Buffer.from([0x0C, 0x03, 0x0E, 0xBF, 0x02, 0x01, 0x00, 0xD3, 0x0D]);
  //  port.write(buffer);
  // buffer = Buffer.from([0x0C, 0x03, 0x0E, 0xAA, 0x03, 0xFF,0xFF,0xF1, 0xAD, 0x0D]);
  //  port.write(buffer)
  //0x0C, 0x03, 0x0E, 0xB8, 0x09, 0xFF, 0xFF, 0xFF, 0x01, 0x40, 0x00, 0x40, 0x07, 0x4B, 0xA2, 0x0D]))
  //                      0C030EB809FFFFFF05400040074BA2
  //     0c030e04020120180d
  //     0c030e04020100180d
  //0C030E02020000150D
  //console.log("~~0C0E033203FFFFF1350D");
  // port.write(Buffer.from("0C0E033203FFFFF1350D", "hex"));
  //0c03
  // 0c030eb809ffffff05400040074baa0d
  // 0c030eb809ffffff01400040074ba20d
  // 0c030eb809ffffff01400040074ba20d
  // 0c030eb809ffffff01400048684aadf8
  // 0c030eb809ffffff01400040074ba20d
  // 1c030eb809ffffff01400040074baa8d
  // 0c030eb809ffffff01400040074ba20d
  // 0c030eb809ffffff01400040074ba20d
  // 0c030eb809ffffff01400040074ba20d
  // 0c030eb809ffffff09a08040074ba20d
  // 0c030eb809ffffff01400040074ba20d
  // console.log("ayy" + buf2hex(buffer));
}, 7000);
function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) =>
      ("00" + x.toString(16)).toUpperCase().slice(-2)
    )
    .join(" ");
}
const sendCommand = (cmd: Actions, payload?: Buffer) => {
  const sync = Buffer.from([0x0c]);
  if (!payload) payload = remoteAddress;
  const prefix = Buffer.from([0x0e, 0x03, cmd, payload.byteLength]);
  const content = Buffer.concat([prefix, payload]);
  const checksum = Buffer.from(
    content
      .reduce((a, v) => a + v, 0)
      .toString(16)
      .toUpperCase()
      .slice(-2),
    "hex"
  );
  const delimiter = Buffer.from([0x0d]);
  const message = Buffer.concat([sync, content, checksum, delimiter]);
  console.log(`sending: ${buf2hex(message)}`);
  port.write(message);
};
// 0C0E033103FFFFF1340D
// port.write('000C030E02020000150D','hex');
//     port.write(Buffer.from([0x0C, 0x0E, 0x03, 0x30, 0x03, 0xFF, 0xFF, 0xF1, 0x33, 0x0D]))
// port.write(Buffer.from("0C0E0330058D33310000370D","hex"))
// console.log('sending:',buf2hex(Buffer.from("0C0E033003FFFFF1330D","hex")))
// }, 1000)
function showPortOpen() {
  console.log("port open. Data rate: " + port.baudRate);
}
function parseUpdate(data) {
  console.log(`${buf2hex(data)}`);
}

function parseStatus(data) {
  switch (data[3]) {
    case HardwareStatus.led_flashing:
      console.log("LED Flashing");
      break;
    case HardwareStatus.led_off:
      console.log("LED Off");
      break;
    case HardwareStatus.led_on:
      console.log("LED On");
      break;
    case HardwareStatus.remote_pairing:
      console.log("Remote Pairing");
      setTimeout(() => sendCommand(Actions.aux1), 800);
      setTimeout(
        () =>
          sendCommand(
            Actions.lock,
            Buffer.from([0xff, 0xff, 0xff, 0x00, 0x33])
          ),
        1100
      );
      setTimeout(
        () => sendCommand(Actions.lock, Buffer.from([0xff, 0xff, 0xf1])),
        1100
      );
      setTimeout(() => sendCommand(Actions.lock, remoteAddress), 1300);
      break;
    case HardwareStatus.status_update:
      console.log("Status Update");
      parseUpdate(data);
      break;
    default:
      console.log(`unknown message: ${buf2hex(data)}`);
      break;
  }
}
function readSerialData(data) {
  if (data[0] === 0x00) data = Buffer.from(data.slice(1, data.length));
  const direction = data[1] === 0x0e && data[2] === 0x03 ? 1 : 0; // 1 is TX, 0 is RX;
  // console.log(direction);
  if (!direction) {
    parseStatus(data);
    // console.log(`received ${buf2hex(data)}`);
  }
}
function ascii_to_hex(str) {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join("");
}
function readUnparsedSerialData(data) {
  console.log(data.toString("utf8"));
}

function showPortClose() {
  console.log("port closed.");
}

function showError(error) {
  console.log("Serial port error: " + error);
}
port.on("open", showPortOpen);
parser.on("data", readSerialData);
// port.on('data', readUnparsedSerialData);
port.on("close", showPortClose);
port.on("error", showError);

// class FortinStatus {
//      valetMode:boolean = false;
//      remoteStarted:boolean = false;
//      engineTurningOver:boolean = false;
//      accessoryMode:boolean = false;
//      unknownFlag1:boolean = false;
//      trunkOpen:boolean = false;
//      doorOpen:boolean = false;
//      armed:boolean = false;
//      remoteAddress:number= 0x00;
//      address:number = 0x00;
//      counterType:number = 0x00;
//      counter:number = 0;
//      /* the time in ms until the remote starter shuts  off */
//      shutoffCounter: number = 0;
//      constructor(){
//                // todo
//      }
//      update() {
//           // todo
//      }
// }
// When this is true we will try to clone an existing
// address seen on the uart databus. Normally one
// will want to pair with the remote starter. However,
// due to protocol flaws it is relatively easy to just
// repurpose an existing address. There is really no
// downside to repurposing an existing address besides
// that this is not what the protocol designers wanted
// us to do. This will automatically get set to false
// once an address is learned.

/* The time in ms since the last status update. */
const lastStatusUpdate = 0;
/**
 * @param  message - Message to send in hex
 */
// const  write = (number:  msg) => {

// }
console.log("Starting OpenRemoteStart.js");

const help = () => {
  console.log(`
Commands:
 * send [action]
     - lock
     - unlock
     - start
     - stop
     - trunk_release
     - panic
     - unlock2
     - aux1
     - aux2
     - aux3
     - aux4
     - status_request
     - status_request2
     - toggle_valet_mode
     - prog_btn_press
 * status
     `);
};
type Action = keyof typeof Actions;
rl.on("line", (line) => {
  const args = line.split(" ");
  if (Object.keys(Actions).includes(args[0])) {
    sendCommand(Actions[args[0] as keyof typeof Actions]);
  } else {
    switch (args[0]) {
      case "help":
        help();
        break;
      case "send":
        if (typeof Actions[args[1] as keyof typeof Actions] !== "undefined")
          sendCommand(Actions[args[1] as keyof typeof Actions]);
        else console.log("action not found");
        break;
      case "status":
        console.log("Status not yet implemented");
        break;
      default:
        help();
        console.log(
          Object.keys(Actions),
          args[0],
          Object.keys(Actions).includes(args[0])
        );
        console.log(`Unrecognized Command ${args.join(" ")}`);
        break;
    }
  }
});
