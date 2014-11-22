routing = new Object();
storage = window.localStorage;

routing.getPlatform = function(){
    var platformName = "default";

    if(device){
        platformName = device.platform.toLowerCase();
        
        //alert(platformName);
        console.log(platformName);

        if (platformName.indexOf("iphone") > -1 || platformName.indexOf("ipad") > -1){
            platformName = "ios";
        }
    }

    return platformName;
}

routing.login = function(uid,pass){
	$.ajax({
        type: 'POST',
        data: { uid: uid },
        crossDomain: true,
        dataType: 'json',
        url: 'http://173.255.204.104/api/login',
        success: function(data){
            storage.setItem("login", "true");
            storage.setItem("name", data.first_name);
            storage.setItem("lastname", data.last_name);
            storage.setItem("id", data._id);
            storage.setItem("profile_picture", data.profile_picture);
            storage.setItem("fullname", data.first_name + " " + data.last_name);

            if(storage.getItem("return") == "1"){
                routing.getUserFaculties(storage.getItem("id"));
                routing.feed(1, 20);
                $.mobile.navigate("#home", { transition: "none" });
            }
            else{
                storage.setItem("return", "1");
                $.mobile.navigate("#faculties", { transition: "none" });
            }

            routing.registerToken(storage.getItem("id"));
            routing.getNotifications(15);
        },
        error: function(data){
            alert('There was an error in your login');
        }
    });
}

routing.logout = function(){
    routing.unregisterToken(storage.getItem("id"));

    storage.removeItem("name");
    storage.removeItem("lastname");
    storage.removeItem("id");
    storage.removeItem("profile_picture");
    storage.removeItem("fullname");

    storage.setItem("login", "false");

    $("#home .post-container").empty();
    $.mobile.navigate("#login", { transition: "none" });
}

routing.registerToken = function(userId){
    var token = storage.getItem("token");
    var id = userId;
    var type = storage.getItem("platform");

    $.ajax({
        type: 'POST',
        data: { token: token, type: type },
        crossDomain: true,
        dataType: 'json',
        url: 'http://173.255.204.104/api/users/' + id + '/token',
        success: function(data){
            console.log(data);
            //alert('Se ha guardado su token');
        },
        error: function(data){
            alert('Intente hacer login nuevamente');
        }
    });
}

routing.unregisterToken = function(userId){
    var token = storage.getItem("token");
    var id = userId;
    var type = storage.getItem("platform");

    $.ajax({
        type: 'DELETE',
        data: { token: token, type: type },
        crossDomain: true,
        dataType: 'json',
        url: 'http://173.255.204.104/api/users/' + id + '/token',
        success: function(data){
            console.log(data);
            //alert('Se ha eliminado su token');
        },
        error: function(data){
            alert('Intente hacer logout nuevamente');
        }
    });
}

routing.postUserAreas = function(uid,faculties){
    $.ajax({
        type: 'POST',
        data: { faculties: faculties },
        crossDomain: true,
        dataType: 'json',
        url: 'http://173.255.204.104/api/users/' + uid + '/faculties',
        success: function(data){
            console.log(data);
            //alert('Se han guardado sus preferencias');
        },
        error: function(data){
            alert('Intente nuevamente seleccionar las facultades');
        }
    });
}

routing.getUserAreas = function(uid){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        url: 'http://173.255.204.104/api/users/' + uid + '/faculties',
        success: function(data){
            var elem = $('#facuset').find(".faculties-list li div.big-circle");

            $.each(elem, function(index,value){
                if( $.inArray($(value).attr("data-id"), data) != -1 ){
                    $(value).addClass("ss-check check-active");
                }
                else{
                    $(value).removeClass("ss-check check-active");
                }
            });
        },
        error: function(data){
            //alert('Error al cargar las facultades del usuario');
        }
    });
}

routing.getAreas = function(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        url: 'http://173.255.204.104/api/faculties',
        success: function(data){
            $.each(data, function(index,value){
                $('.faculties-tutorial').append("<li><div class='"+ value.color +" big-circle circle-tutorial' data-id='"+ value._id +"'></div><div class='faculty-text'>"+ value.name +"</div></li>");
                $('.faculties-settings').append("<li><div class='"+ value.color +" big-circle circle-settings' data-id='"+ value._id +"'></div><div class='faculty-text'>"+ value.name +"</div></li>");
            })
        },
        error: function(data){
            //alert('Error al cargar las facultades');
        }
    });
}

routing.getNotifications = function(entries){
    var url = '';

    if(storage.getItem("id"))
        url = 'http://173.255.204.104/api/notifications/user/' + storage.getItem("id") + '?items=' + entries + '';
    else
        url = 'http://173.255.204.104/api/notifications?items=' + entries + '';


    $.ajax({
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        url: url,
        success: function(data){
            $('#notifications .post-container').empty();
            $.each(data, function(index,value){
                var picture = value.picture == null ? 'img/noticias/news10.jpg' : value.picture;

                $('#notifications .post-container').append("<div class='post post-notification' data-id='"+ value._id +"'><div class='post-top'><div class='post-time'><div class='orange circle'></div><div class='time-content'>Hace segundos</div></div></div><div class='post-bottom'><div class='post-image'><img src='"+ value.picture +"'></div><div class='post-desc'><div class='post-title'>"+ value.title +"</div><div class='post-date'>"+ truncate(value.text, 60) +"</div></div></div></div>");
            });
        },
        error: function(data){
            alert('Error al cargar las notificaciones');            
        }
    });
}

routing.notification = function(notif_id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        url: "http://173.255.204.104/api/notifications/" + notif_id + "",
        success: function(data){
            var picture = data.picture == null ? 'img/noticias/news10.jpg' : data.picture;

            $('#notifnews .post-image img').attr("src", picture);
            $('#notifnews .news-title').text(data.title);
            $('#notifnews .news-body').text(data.text);

            $.mobile.navigate("#notifnews", { transition: "none" });
        },
        error: function(data){
            alert("Retrying to load notification...");
            $.ajax(this);
        }
    });
}

routing.feed = function(page, entries){
    var url = '';

    if(storage.getItem("id"))
        url = 'http://173.255.204.104/api/pub_pag/' + storage.getItem("id") + '?page=' + page + '&items=' + entries + '';
    else
        url = 'http://173.255.204.104/api/pub_pag?page=' + page + '&items=' + entries + '';


    $.ajax({
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        url: url,
        success: function(data){
            $.each(data, function(index,value){
                var color = value.color == null ? 'orange' : value.color;
                var picture = value.picture == null ? 'img/noticias/news10.jpg' : value.picture;

                $('#home .post-container').append("<div class='post post-link-news' data-id='"+ value._id +"'><div class='post-top'><div class='post-time'><div class='"+ value.color +" circle'></div><div class='time-content'>Hace 10 minutos</div> </div></div><div class='post-bottom'><div class='post-image'><img src='"+ picture +"'></div><div class='post-desc'><div class='post-title'>"+ value.title +"</div><div class='post-date'>"+ truncate(value.text, 60) +"</div></div></div></div>");
            });
            $("#home .feed-scroll-container").data("mobileIscrollview").resizeWrapper();
            $("#home .feed-scroll-container").data("mobileIscrollview").refresh();
        },
        error: function(data){
            alert('Error al cargar el feed');
        }
    });
}

routing.postFeed = function(post_id, element){

    $('#news .likes-link').removeClass('red2 liked');
    $('#news .post-news').attr('data-id', post_id);

    var color = $(element).find('.circle').attr('class').split(' ')[0] + ' circle';
    $('#news .circle').attr('class', color);
    $('#news .news-title').text($(element).find('.post-title').text());
    $('#news .post-image img').attr('src', $(element).find('.post-image img').attr('src'));
    
    $.ajax({
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        url: "http://173.255.204.104/api/publications/" + post_id + "",
        success: function(data){
            // var color = data.color + ' circle';
            // $('#news .circle').attr('class', color);
            // $('#news .news-title').text(data.text);
            // $('#news .post-image img').attr('src', data.picture);
            
            $('#news .news-body').html(data.text);
            
            //$('#news .facebook-number').text(data.text);

            if(storage.getItem('id') && data.likers.indexOf(storage.getItem('id')) != -1){
                $('#news .likes-link').addClass('red2 liked');
            }

            $('#news .likes-number').text(data.likes);
            $('#news .comments-number').text(data.comments.length);

            $.mobile.navigate("#news", { transition: "none" });
        },
        error: function(data){
            alert("Retrying to load post...");
            $.ajax(this);
        }
    });
}

/* Helper Routes */
function truncate(sentence, charLength){
    var trimmedString = sentence.substr(0, charLength);
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))

    return trimmedString + '...';
}


