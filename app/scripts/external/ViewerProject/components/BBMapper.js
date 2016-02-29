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

BB.Mapper = function() {
    this.needsUpdate = false;
    this.childrenMappers = [];
    this.parentMapper = null;
}

BB.Mapper.prototype.init = function(cb) {
    if (cb !== undefined) {
        cb();
    }
}

BB.Mapper.prototype.map = function(obj, el, cb) {
    if (cb !== undefined) {
        cb();
    }
}

BB.Mapper.prototype.unmap = function(obj, el) {
}

BB.Mapper.prototype.dispose = function() {
}

BB.Mapper.prototype.pick = function(raycaster) {
}

BB.Mapper.prototype.highlight = function(active) {
}

BB.Mapper.prototype.update = function(scene) {
}

BB.Mapper.prototype.lateUpdate = function(scene) {
}

BB.Mapper.prototype.fixedUpdate = function(scene) {
}

BB.Mapper.prototype.camUpdate = function(cam) {
}

BB.Mapper.prototype.onclick = function(e) {
}

BB.Mapper.prototype.ondblclick = function(e) {
}

BB.Mapper.prototype.oncontextmenu = function(e) {
}

BB.Mapper.prototype.onmousemove = function(e) {
}

BB.Mapper.prototype.interactiveCtor = function(cb) {
    if (cb !== undefined) {
        cb();
    }
}

BB.Mapper.prototype.getUserFriendlyName = function() {
    return "Mapper";
}

BB.Mapper.prototype.serialize = function() {
    var obj = {};
    for (var i in this) {
        try {
            JSON.stringify(this[i]);
            obj[i] = this[i];
        } catch (e) {
            // Nothing
        }
    }
    // console.log(this.getClassName() + ': serialize() not Implemented');
    return obj;
}

BB.Mapper.prototype.deserialize = function(obj) {
    // console.log(this.getClassName() + ': deserialize() not Implemented');
    for (var i in obj) {
        this[i] = obj[i];
    }
}

BB.Mapper.prototype.getClassName = function() {
    return "BB.Mapper";
}

BB.Mapper.prototype.setPath = function(p) {
    this.path = p;
}

BB.Mapper.prototype.getPath = function() {
    return this.path || '';
}

var zeroVector = new THREE.Vector3();

BB.Mapper.prototype.getCenter = function() {
    return zeroVector;
}

// var defaultBox = new THREE.Box3(new THREE.Vector3(1, 1, 1).multiplyScalar(-100), new THREE.Vector3(1, 1, 1).multiplyScalar(100));

BB.Mapper.prototype.getBox = function() {
    return null;
}

BB.Mapper.prototype.renderOverlay = function(rend, cam) {
}

BB.Mapper.subclasses = [];

})();
