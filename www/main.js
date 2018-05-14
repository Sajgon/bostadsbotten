$(function(){

  var lastReadMessageTime = 0;

  // Submit a message when the submit button is clicked
  $('button.submit').click(function(){
    var mess = $('.message-input input').val();
    $.getJSON('/send-message/' + encodeURIComponent(mess));
  });

  // Read messages from the server
  function readMessages(){

    $.getJSON('/read-messages/' + lastReadMessageTime,function(messages){
      // Update the lastReadMessageTime from the read messages
      if(messages.length){
        lastReadMessageTime = messages[messages.length - 1].time;
      }
      messages.forEach(function(message){
        $('body').append(
          '<div class="a-message">' +
            '<p>' + formatTime(message.time)  + '</p>' +
            '<p>' + decodeURIComponent(message.text) + '</p>' +
          '</div>'
        );
      });
      $('body').append($('.spacer'));
      window.scrollTo(0,10000000); // scroll to bottom
      // Read more messages
      readMessages();
    });

  }

  // Initial call to read messages
  readMessages();

  // Format the time a bit
  function formatTime(timestamp){
    var d = new Date(timestamp),
        time = [d.getHours(), d.getMinutes(), d.getSeconds()];

    time = time.map(function(t){
      return t < 10 ? '0' + t : t;
    });
    return time.join(':');
  }

});