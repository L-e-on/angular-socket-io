
/*
   socket.js - small service to load and handle events from socket.io
   Copyright (C) 2016  Leon Brett
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
   */
(function() {
    angular.module('services.lb.socket').factory('socket', ['$rootScope', function ($rootScope) {
        var scriptTag = document.createElement('script');
        var scripts = document.getElementsByTagName('script');
        var onQueue = [], emitQueue = [];
        var socket = null;
        var on = function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
               callback.apply(socket, args);

            });
        }
        var emit = function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                    if (callback) {
                        callback.apply(socket, args);
                    }
            })
        }

        var socketFactory = {
            available: true,
            on: function (eventName,callback) {
                onQueue.push({eventName:eventName,callback:callback});
            },
            emit: function (eventName,data,callback) {
                emitQueue.push({eventName:eventName,data:data,callback:callback});
            },
            removeListener: function (listener) {
                if (socket) {
                    socket.removeListener(listener);
                }
            }
        };
       
        scripts[scripts.length - 1].parentNode.appendChild(scriptTag);
        scriptTag.onload = function () {
            socket = new io.connect(":8080");
            socketFactory.on = on;
            socketFactory.emit = emit;
            for(var i = 0;i<onQueue.length;i++) {
                var item = onQueue[i];
                socketFactory.on(item.eventName,item.callback);
            }
            onQueue = null;
            for (var i = 0; i < emitQueue.length; i++) {
                var item = emitQueue[i];
                socketFactory.on(item.eventName,item.data,item.callback);
            }
            emitQueue = null;
        }
        scriptTag.onerror = function () {
            socketFactory.available = false;
        }
        scriptTag.src = window.location.protocol + '//' + window.location.hostname + ':8080/socket.io/socket.io.js';
        return socketFactory;
    }]);
})();