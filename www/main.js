

var SHOW_MAX_PROPERTIES = 5;



function numberToPrice(number){

    return Number(number).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")

}

function btnClick(button) {
    var index = button.getAttribute("data-option-index");
    var value = button.innerText;
    $.getJSON('/send-message/' + encodeURIComponent(value));
    console.log(index, value)
}
function generateButtons(options) {
    let html = "";
    if (!options) {return html;}

    for(i in options) {
        let btnValue = options[i];
        html += '<button onclick="btnClick(this)" data-option-index="'+i+'" class="btn btn-clickable">'+btnValue+'</button>';
    }

    return html;
}

function generateProperties(properties) {
    let html = "";
    if (!properties) {return html;}

    for(i in properties) {
        let property = properties[i];

        html += '<div class="property">' +
            '<img src="http://via.placeholder.com/150x150">' +
            '<h3>'+property.streetname+ " " + property.streetnumber + ", " + property.city+'</h3>' +
            '<p>'+numberToPrice(property.price)+' kronor ('+property.sqm+' kvm) </p>' +
        '</div>';

        if (i >= SHOW_MAX_PROPERTIES) { break; }
    }

    return html;
}


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
            '<p>' + message.name + ': ' +  formatTime(message.time)  + '</p>' +
            '<p>' + decodeURIComponent(message.text) + '</p>' +
            '<span>' + generateButtons(message.options) + '</span>' +
            '<span>' + generateProperties(message.properties) + '</span>' +
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

