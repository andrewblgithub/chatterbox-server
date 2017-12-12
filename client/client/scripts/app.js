const app = {
  friends: {},
  rooms: {},
  latestMessageTime: null
};

app.init = () => {
  app.fetch();
  setInterval(()=> {
    let foundRoom = $('.subtitle').html();
    if (foundRoom !== undefined) {
      app.fetch(foundRoom);
    } else {
      app.fetch();
    }
  }, 3000);
};

app.handleUsernameClick = (div) => {
  const className = div.innerHTML;
  if (app.friends[className]) {
    delete app.friends[className];
    $('.' + className).css('font-weight', 'normal');
  } else {
    app.friends[className] = className;
    $('.' + className).css('font-weight', 'Bold');
  }
};

app.handleSubmit = () => {
  let foundRoom = $('.subtitle').html();
  let message = {
    username: location.search.slice(10),
    text: document.getElementById('comment').value,
    roomname: foundRoom
  };
  $('#comment').val('');
  app.send(message);
  if (foundRoom !== undefined) {
    app.fetch(foundRoom);
  } else {
    app.fetch();
  }
};

app.createRoom = () => {
  let room = document.getElementById('createroom').value;
  $('#createroom').val('');
  if (!app.rooms[room]) {
    app.renderRoom(room);
    app.rooms[room] = room;
  }
  app.selectRoom(room);
};

app.server = 'http://localhost:3000/classes/messages';

app.send = (message) => {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = (currentRoom) => {
  $.ajax({
    url: app.server,
    type: 'GET',
    data: { 'order': '-createdAt' },
    success: function (data) {
      console.log('chatterbox: Messages recieved');
      let messages = data.results;
      messages.reverse();
      messages.forEach((message) => {
        if (!app.latestMessageTime || message.createdAt > app.latestMessageTime) {
          app.latestMessageTime = message.createdAt;
          if (currentRoom && message.roomname === currentRoom) {
            app.renderMessage(message);
          } else {
            app.renderMessage(message);
          }
          if (message.roomname && !app.rooms[message.roomname]) {
            let room = message.roomname;
            app.rooms[room] = room;
            app.renderRoom(room);
          }
        }
      });
      for (let friend in app.friends) {
        $('.' + friend).css('font-weight', 'Bold');
      }
    },
    error: function (data) {
      console.error('chatterbox: Failed to recieve messages', data);
    }
  });
};

app.clearMessages = () => {
  $('#chats').empty();
};

app.renderMessage = (message) => {
  let username = _.escape(message.username);
  let text = _.escape(message.text);
  let createdAt = message.createdAt;
  
  $('#chats').prepend('<div class=\'panel panel-default\'><div class=\'panel-body\'>' +
  '<div class=\'username ' + 
   username + 
   ' btn btn-link\' onclick=app.handleUsernameClick(this) id=' +
   username + 
   '>' + 
  username + 
  '</div><div class=\'usermessage\'>' + 
  text +
  '</div><div class=\'usermessagedate\'>' + 
  createdAt +
  '</div></div></div>');
};

app.renderRoom = (room) => {
  $('.dropdown-menu').append($('<li><a id=' + room + ' href="#" onclick=app.selectRoom(this.innerHTML)>' + room + '</a></li>'));
};

app.selectRoom = (room) => {
  app.clearMessages();
  $('.subtitle').remove();
  app.latestMessageTime = null;
  if (room === 'allrooms') {
    app.fetch();
  } else {
    $('#title').append('<h3 class=\'subtitle\' >' + room + '<h3>');
    app.fetch(room);
  }
};

app.init();
