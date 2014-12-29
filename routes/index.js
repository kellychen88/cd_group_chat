module.exports = function Route(io, app, cookieParser){
  var users = {};
  var messages = [];

  app.get('/', function (req, res){
    res.render('index', { title: 'Group Chat' });
  });

  app.post('/chat/new', function (req, res){
    console.log(req.body);
    res.redirect('/');
  });

  // all socket code(s) go here
  io.sockets.on('connection', function (socket){
    console.log('sockets are now operational');
    if(socket.handshake.headers.cookie){
      // get cookie
      var this_cookie = cookieParser.signedCookie(socket.handshake.headers.cookie, 'codingDojo');
      // console.log('\nthis_cookie\n', this_cookie);
      // console.log('\nthis_cookie.indexof()\n', this_cookie.indexOf('connect.sid'));
      // find start of connect.sid in cookie string
      var pos = this_cookie.indexOf('connect.sid') + 12;
      // console.log('\npos\n',pos);
      // get just the connect.sid portion of this socket connection
      var connect_sid = this_cookie.substr(pos);
      // console.log('\nconnect_sid\n', connect_sid);
    }
    console.log('prompt for user name', connect_sid);
    // emit a request for user name
    socket.emit('prompt_for_name', { id: connect_sid });
    
    // listen for new user to emit name
    socket.on('new_user_name', function (data){
      // console.log('\ngot_a_new_user data\n', data);
      // put user name into users array with connect_sid as key
      users[data.id] = data.name;
      // console.log('\ngot_a_new_user users\n', users);
      // emit back to new user the current messages
      socket.emit('user_messages', { messages: messages });
      // broadcast to all other users the new user
      socket.broadcast.emit('new_user', data.name);
    });

    // listen for new chat message
    socket.on('new_chat_message', function (data){
      console.log('new chat: ', data);
      var msg = { message: data.message, user: data.name };
      messages.push(msg);
      // broadcast to all clients
      io.emit('new_message', msg);
    });

    socket.on('disconnect', function (data){
      var name = users[connect_sid];
      // console.log('\nname\n', name);
      // broadcast to all other users the user that has left the chat
      socket.broadcast.emit('user_departed', name);
      // remove user who disconnected from array
      delete users[connect_sid];
      // console.log('\ndisconnect data', connect_sid, '\nxxx');
    });

  }); 
  // end socket 'connection'
}