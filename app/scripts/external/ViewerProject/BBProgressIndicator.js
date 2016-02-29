/*

Author: Stanislaw Adaszewski, 2014-2015
Copyright (c) 2014-2015, BBP/EPFL
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies,
either expressed or implied, of the Blue Brain Project.

*/

if (window.BB === undefined) {
    BB = {};
}

if (BB.Util === undefined) {
    BB.Util = {};
}

BB.Util.ProgressIndicator = function(urlOrXhr, target, onRemove) {
    var tail;
    if (urlOrXhr instanceof Array) {
        tail = urlOrXhr.slice(1);
        urlOrXhr = urlOrXhr[0];
    }

    var removed = function() {
        if (onRemove !== undefined) {
            onRemove(that);
        }
    }

    if (urlOrXhr.cancelled) {
        removed();
        return;
    }

    var xhr;
    var that = this;

    var ind;

    that.removed = removed;

    var el = $('<div />').css({width: '100px', height: '8px', padding: '1px', margin: '0', background: 'black', border: 'solid 1px white', clear: 'both'})
        .append(ind = $('<div />').css({height: '100%', width: '0', margin: '0', background: 'white'}));

    var total;
    var helper;
    var pingPongId;
    var start;

    var pingPong = function() {
        var t = start - new Date();
        that.completedPercentage = Math.round((Math.sin(t / 500.0 -  Math.PI / 2) + 1) * 50);
        ind.css({width: that.completedPercentage + 'px'});
        pingPongId = window.requestAnimationFrame(pingPong);
    }

    var common = function() {
        if (xhr.slowRequest) {
            start = new Date();
            pingPongId = window.requestAnimationFrame(pingPong);
        } else {
            xhr.addEventListener('progress', function (e) {
                if (total !== undefined) {
                    that.completedPercentage = Math.round(e.loaded * 100 / total);
                } else /*if (e.lengthComputable) {
                    that.completedPercentage = Math.round(e.loaded * 100 / e.total);
                }  else */ {
                    /*if (xhr.url !== undefined && helper === undefined) {

                        //return;
                    }*/

                    var mega = 1024 * 1024;
                    that.completedPercentage = Math.round((Math.sin((e.loaded % mega) / mega * Math.PI - Math.PI/2) + 1) * 50);
                }
                ind.css({width: that.completedPercentage + 'px'});
            });
        }
        xhr.addEventListener('load', function (ev) {
            window.cancelAnimationFrame(pingPongId);
            if (ev.target.status == 200) {
                el.remove();
                if (tail !== undefined && tail.length > 0) {
                    new BB.Util.ProgressIndicator(tail, target, onRemove);
                } else {
                    removed();
                }
            } else {
                function ab2str(buf) {
                    return String.fromCharCode.apply(null, new Uint8Array(buf));
                }
                var response = ev.target.response;
                if (response instanceof ArrayBuffer) response = ab2str(ev.target.response);
                // ind.parent().parent().append($('<div class="error" />').text(response));
                if (ind.width() < 10) ind.css({width: '10px'});
                ind.css({background: 'red'});
                removed();
                el.click(function() { el.remove(); });
                BB.Util.alert(response);
            }
        });
        xhr.addEventListener('abort', function() {
            window.cancelAnimationFrame(pingPongId);
            ind.css({background: 'yellow'});
            removed();
            el.click(function() { el.remove(); });
        });
        xhr.addEventListener('error', function() {
            window.cancelAnimationFrame(pingPongId);
            ind.css({background: 'red'});
            removed();
            el.click(function() { el.remove(); });
        });
    };

    if (typeof(urlOrXhr) == 'object') {
        xhr = urlOrXhr;
        common();
        $(target).append(el);
    } else {
        var cookieName = 'BB.Util.ProgressIndicator';
        var prev = $(target).data(cookieName);
        if (prev !== undefined) {
            prev.abort();
        }
        $(target).data(cookieName, this);

        xhr = new BB.XMLHttpRequest();
        xhr.url = urlOrXhr;
        xhr.open('GET', urlOrXhr);
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('load', function(e) {
            var blob = new Blob([e.target.response]);
            target.src = URL.createObjectURL(blob);
        });
        common();
        el.css({position: 'absolute', 'z-index': 100});
        var onResize = function() {
            var pos = $(target).parent().offset();
            el.css({left: pos.left + 'px', top: pos.top + 'px'});
        }
        onResize();
        window.addEventListener('resize', onResize);
        setTimeout(function() { xhr.send(null); }, 100);
        $('body').append(el);
    }

    that.xhr = xhr;
    that.el = el;

    /* if (xhr.state > 1) {
        xhr.abort();
    }*/

    if (xhr.slowRequest) {
        xhr.send = function(a) {
            BB.XMLHttpRequest.prototype.send.call(xhr, a);
        }
    } else {
        xhr.send = function(a) {
            total = Number('Infinity');
            helper = new BB.XMLHttpRequest();
            helper.addEventListener('load', function(e) {
                total = e.target.getResponseHeader('X-Original-Content-Length');
                if (total == null) {
                    total = e.target.getResponseHeader('Content-Length');
                }
                // alert(total);
                BB.XMLHttpRequest.prototype.send.call(xhr, a);
            });
            helper.open('HEAD', xhr.url);
            helper.send(null);
        }
    }
}

BB.Util.ProgressIndicator.prototype.abort = function() {
    this.xhr.abort();
    this.el.remove();
    this.removed();
}
