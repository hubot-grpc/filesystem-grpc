var fs = require('fs')
var grpc = require('grpc')
var Ansible = require('node-ansible')

var PROTO_PATH = __dirname + '/fs.proto'
var fs_proto = grpc.load(PROTO_PATH).fs;


// HELPER FUNCTIONS

function runExistingPlaybook(playbookName, variables, write) {
  return new Promise((resolve, reject) => {
    var playbook = new Ansible.Playbook().playbook(playbookName).variables(variables);
    playbook.on('stdout', function(data) { write(data.toString()) })
    playbook.on('stderr', function(data) { write(data.toString()) })
    playbook.on('close', function(data) {
      resolve()
    })
    playbook.exec()
  })
}

function runExistingPlaybookSync(playbookName, variables) {
  return new Ansible.Playbook().playbook(playbookName).variables(variables).exec();
}

function abortCall(call){
  return function(err){
    console.log(err)
    call.status.code = grpc.status.INTERNAL
    if(err.message) call.status.details = err.message
    call.end()
  }
}


function createFile(call, callback) {
  runExistingPlaybookSync('createFile',
    {HOST: '127.0.0.1',
     EXECUTE_AS_SUDO: 'false',
     REMOTE_USER: '',
     CONNECTION: 'local',
     PATH: call.request.path
    }).then(result => {
      console.log(result.code);
      console.log(result.output);
      callback(null, {})
    }, err => {
      console.error(err);
      callback(null, {})
    })
}

function createDir(call, callback) {
  runExistingPlaybookSync('createDir',
    {HOST: '127.0.0.1',
     EXECUTE_AS_SUDO: 'false',
     REMOTE_USER: '',
     CONNECTION: 'local',
     PATH: call.request.path
    }).then(result => {
      console.log(result.code);
      console.log(result.output);
      callback(null, {})
    }, err => {
      console.error(err);
      callback(null, {})
    })
}

function copy(call, callback) {
  if (call.request.paths.length != 2) {
    callback(null, {});
    return;
  }
  runExistingPlaybookSync('copy',
    {HOST: '127.0.0.1',
     EXECUTE_AS_SUDO: 'false',
     REMOTE_USER: '',
     CONNECTION: 'local',
     SRC_PATH: call.request.paths[0].path,
     DST_PATH: call.request.paths[1].path
    }).then(result => {
      console.log(result.code);
      console.log(result.output);
      callback(null, {})
    }, err => {
      console.error(err);
      callback(null, {})
    })
}

function move(call, callback) {
  callback(null, {})
}

function delete_path(call, callback) {
  callback(null, {})
}

function exists(call, callback) {
  callback(null, {})
}

function readFile(call) {
  abortCall(call);
}

function writeFile(call, callback) {
  callback(null, {})
}

function readDir(call) {
  abortCall(call);
}

function writeDir(call, callback) {
  callback(null, {})
}

function exec(call, callback) {
  callback(null, {})
}

function execStream(call) {
  abortCall(call);
}

var server = new grpc.Server()
server.addProtoService(fs_proto.FileSystem.service, {
  createDir: createDir,
  createFile: createFile,
  copy: copy,
  move: move,
  delete_path: delete_path,
  exists: exists,
  readFile: readFile,
  writeFile: writeFile,
  readDir: readDir,
  writeDir: writeDir,
  exec: exec,
  execStream: execStream
})
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
server.start()