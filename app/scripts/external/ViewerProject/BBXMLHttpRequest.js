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

(function() {
if (window.BB === undefined) {
    BB = {};
}

// BB.XMLHttpRequest
BB.XMLHttpRequest = function() {
    this.xhr = new XMLHttpRequest();
    this.url = '';
}

var static = BB.XMLHttpRequest;
var proto = static.prototype; // = Object.create(XMLHttpRequest.prototype);

// Copy methods & properties
var parent = new XMLHttpRequest();
for (var p in parent) {
    if (typeof(parent[p]) == 'function') { // method
        proto[p] = (function(p) { return function() {
            // console.log(p);
            this.xhr[p].apply(this.xhr, arguments);
        }; })(p);
    } else { // property
        Object.defineProperty(proto, p, { get: (function(p) { return function() {
            return this.xhr[p];
        }})(p), set: (function(p) { return function(val) {
            // console.log(p + '=' + val);
            this.xhr[p] = val;
        }})(p) });
    }
}

// Overload open()
var orig_open = proto.open;
proto.open = function(meth, url, sync) {
    this.url = url;
    orig_open.call(this, meth, url, sync);
}

// Overload send()
var orig_send = proto.send;
proto.send = function(data) {
    if (static.token) {
        this.setRequestHeader('Authorization', 'Bearer ' + static.token);
    }
    orig_send.call(this, data);
}

// Add static setToken()
static.setToken = function(token) {
    static.token = token;
}

})();
