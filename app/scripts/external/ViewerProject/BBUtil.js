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

BB.Util.dispose = function(obj) {
  obj.traverse(function(o) {
    if ("geometry" in o) {
      o.geometry.dispose();
    }
    if ("material" in o) {
      o.material.dispose();
    }
  });
};

BB.Util.findScene = function(obj) {
  var scene = obj;
  while (scene.parent !== undefined) {
    scene = scene.parent;
  }
  if (scene !== undefined && scene instanceof THREE.Scene) {
    return scene;
  }
  return null;
};

BB.Util.findCamera = function(obj) {
  var scene = BB.Util.findScene(obj);
  var cam = null;
  scene.traverse(function(o) {
    if (o instanceof THREE.Camera) {
      cam = o;
    }
  });
  return cam;
};

BB.Util.applyMatrix4 = function(ary, mat) {
  var ret = new Array(ary.length);
  for (var i = 0; i < ary.length; i++) {
    ret[i] = ary[i].clone().applyMatrix4(mat);
  }
  return ret;
};

BB.Util.particleRayCast = function(object, ray, threshold) {
  var vertices = object.geometry.vertices;
  var point, distance, intersect; // , threshold = 5;
  var localMatrix = new THREE.Matrix4();
  var localtempRay = ray.clone();
  var localOrigin = localtempRay.origin;
  var localDirection = localtempRay.direction;

  localMatrix.getInverse(object.matrixWorld);
  //localMatrix.multiplyVector3(localOrigin);
  localOrigin.applyMatrix4(localMatrix);
  //localMatrix.rotateAxis(localDirection).normalize();
  localDirection.transformDirection(localMatrix);

  var intersects = [];

  for (var i = 0; i < vertices.length; i++) {
    point = vertices[i];
    //distance = this.distanceFromIntersection( localOrigin, localDirection, point );
    distance = localtempRay.distanceToPoint(point);
    var distanceOrig = localDirection.dot(point.clone().sub(localOrigin));
    // console.log(distance);

    if (distance > threshold || distanceOrig <= 0) {
      continue;
    }
    intersect = {
      distance: distance,
      distanceOrig: distanceOrig,
      //point: point.clone(),
      //face: null,
      //object: object,
      vertex: i
    };
    intersects.push(intersect);
  }

  intersects.sort(function(a, b) {
    return a.distanceOrig - b.distanceOrig;
  });

  return intersects;
};

BB.Util.dispose = function(obj, disposeGeom, disposeMat, disposeTex) {
  disposeGeom = disposeGeom === undefined ? true : disposeGeom;
  disposeMat = disposeMat === undefined ? true : disposeMat;
  disposeTex = disposeTex === undefined ? false : disposeTex;
  if (disposeGeom && "geometry" in obj) {
    obj.geometry.dispose();
  }
  if (disposeMat && "material" in obj) {
    obj.material.dispose();
    if (disposeTex && "map" in obj.material && obj.material.map != null) {
      obj.material.map.dispose();
    }
  }
  for (var i in obj.children) {
    BB.Util.dispose(obj.children[i], disposeGeom, disposeMat, disposeTex);
  }
};

BB.Util.SpriteBuilder = function(obj, cam, rend, scene) {
  this.obj = obj; //.clone();
  //this.obj.geometry = obj.geometry.clone();

  if (cam === undefined) {
    cam = BB.App.singleton.cam;
  }

  this.cam = cam.clone();

  if (rend === undefined) {
    rend = BB.App.singleton.rend;
  }

  this.rend = rend;

  if (scene === undefined) {
    scene = BB.App.singleton.scene;
  }

  this.scene = scene;
};

BB.Util.SpriteBuilder.prototype.build = function(size) {
  var obj = this.obj;
  var cam = this.cam;
  var rend = this.rend;
  var scene = this.scene;

  var r = 0;
  var center;
  obj.traverse(function(o) {
    var g = o.geometry;
    if (g === undefined) return;
    // g.computeBoundingSphere();
    var boundingSphere = new THREE.Sphere();
    o.updateMatrixWorld(true);
    boundingSphere.setFromPoints(
      BB.Util.applyMatrix4(g.vertices, o.matrixWorld),
      new THREE.Vector3(0, 0, 0)
    );
    if (boundingSphere.radius > r) {
      r = boundingSphere.radius;
      center = boundingSphere.center;
    }
  });
  r *= 2;
  var d = r / Math.sin(cam.fov * Math.PI / 180 / 2);

  var old_parent = obj.parent;
  // var scene = new THREE.Scene();
  //old_parent.remove(obj);
  // scene.add(obj);
  // scene.add(cam);
  var visible = scene.children.map(function(x) {
    return x.visible;
  });
  //for (var i in scene.children) { var ch = scene.children[i]; if (ch != obj) ch.traverse(function(n) { n.visible = false; }); }
  scene.traverse(function(n) {
    n.visible = false;
  });
  obj.traverse(function(n) {
    n.visible = true;
  });
  var p = obj.parent;
  while (p !== undefined) {
    p.visible = true;
    p = p.parent;
  }
  scene.traverse(function(n) {
    if (n instanceof THREE.LOD) {
      n.update(cam);
    }
    if (n.parent) n.visible = n.visible && n.parent.visible;
  });

  var positions = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];
  var tex = new Array(6);
  var _gl = rend.getContext();
  for (var i = 0; i < 6; i++) {
    var target = new THREE.WebGLRenderTarget(size * cam.aspect, size, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter
    });
    var p = positions[i];
    cam.position.set(
      obj.position.x + center.x + p[0] * d,
      obj.position.y + center.y + p[1] * d,
      obj.position.z + center.z + p[2] * d
    );
    cam.lookAt(obj.position.clone().add(center));
    rend.setClearColor(0x000000, 0);
    rend.render(scene, cam, target);
    //rend.setClearColor(0x000000);
    tex[i] = target;
    _gl.deleteFramebuffer(target.__webglFramebuffer);
    _gl.deleteRenderbuffer(target.__webglRenderbuffer);
    // target.removeEventListener('dispose');
  }
  //scene.remove(obj);
  //if (old_parent !== undefined) {
  //        old_parent.add(obj);
  //  }
  //for (var i in scene.children) { var ch = scene.children[i]; if (visible[i]) ch.traverse(function(n) { n.visible = true; })}
  scene.traverse(function(n) {
    n.visible = true;
  });
  scene.traverse(function(n) {
    if (n instanceof THREE.LOD) {
      n.update(cam);
    }
    if (n.parent) n.visible = n.visible && n.parent.visible;
  });

  return { tex: tex, r: r, center: center };
};

BB.Util.Pseudo3D = function(obj, cam, rend) {
  THREE.Object3D.call(this);

  var ret = new BB.Util.SpriteBuilder(obj, cam, rend).build(1024);
  var tex = ret.tex;
  var r = ret.r;
  var center = ret.center;

  this.r = r;
  this.center = center;

  var positions = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];
  for (var i = 0; i < 6; i++) {
    var g = new THREE.PlaneGeometry(
      2 * r * window.innerWidth / window.innerHeight,
      2 * r
    );
    var m = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: tex[i],
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        alphaTest: 0.5
      })
    );
    var p = positions[i];
    m.lookAt(new THREE.Vector3(p[0], p[1], p[2]));
    m.position.copy(center);
    this.add(m);
  }
};

if (window.THREE !== undefined) {
  BB.Util.Pseudo3D.prototype = Object.create(THREE.Object3D.prototype);
}

BB.Util.Pseudo3D.prototype.camUpdate = function(cam) {
  var fwd = new THREE.Vector3(0, 0, 1);
  fwd.applyQuaternion(cam.quaternion);

  var x = Math.abs(fwd.x);
  var y = Math.abs(fwd.y);
  var z = Math.abs(fwd.z);
  var eps = 0.0001;

  var normal = y > x + eps ? y > z + eps ? 1 : 2 : x > z + eps ? 0 : 2;
  var sign = fwd[normal] > 0 ? 0 : 1;

  for (var i in this.children) {
    this.children[i].visible = false;
  }

  this.children[normal * 2 + sign].visible = true;
};

BB.Util.mobileCheck = function() {
  var check = false;
  (function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

BB.Util.getScrollBarWidth = function() {
  var inner = document.createElement("p");
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement("div");
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);

  document.body.appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = "scroll";
  var w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild(outer);

  return w1 - w2;
};

BB.Util.trimText = function(t, front, back) {
  if (t.length > front + back) {
    t = t.substr(0, front) + " ... " + t.substr(t.length - back);
  }
  return t;
};

BB.Util.makePathWrappable = function(t) {
  return t.split("/").join(" /");
};

BB.Util.invertBgImage = function(el) {
  var style = el.currentStyle || window.getComputedStyle(el, false);

  var url = style.backgroundImage;
  url = url.substr(4, url.length - 5);
  var img = $("<img />");
  img.load(function() {
    var canvas = $("<canvas />").get(0);
    var w = this.width;
    var h = this.height;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    var data = ctx.getImageData(0, 0, w, h);
    var buf = data.data;
    for (var i = 0; i < w * h * 4; i += 4) {
      buf[i] = 255 - buf[i];
      buf[i + 1] = 255 - buf[i + 1];
      buf[i + 2] = 255 - buf[i + 2];
    }
    ctx.putImageData(data, 0, 0);
    var url = URL.createObjectURL(canvas.toBlob());
    el.style.backgroundImage = "url(" + url + ")";
  });
  img.get(0).src = url;
};

BB.Util.moveClass = function(cls, scope) {
  scope = scope || "body";
  return {
    to: function(target) {
      $(scope).find("." + cls).removeClass(cls);
      $(target).addClass(cls);
    }
  };
};

BB.Util.toggleFullScreen = function() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen =
    docEl.requestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.webkitRequestFullScreen ||
    docEl.msRequestFullscreen;
  var cancelFullScreen =
    doc.exitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen ||
    doc.msExitFullscreen;

  if (
    !doc.fullscreenElement &&
    !doc.mozFullScreenElement &&
    !doc.webkitFullscreenElement &&
    !doc.msFullscreenElement
  ) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
};

BB.Util.indexOfNthTrue = function(ary, n) {
  var cnt = 0;
  for (var i = 0; i < ary.length; i++) {
    if (ary[i]) cnt++;
    if (cnt == n + 1) return i;
  }
  return -1;
};

BB.Util.toggle = function(obj, method, val1, val2) {
  obj = $(obj);

  if (!(method instanceof Function)) method = obj[method];

  if (method.call(obj) == val1) {
    method.call(obj, val2);
  } else {
    method.call(obj, val1);
  }
};

BB.Util.inHierarchy = function(obj, field, relative) {
  while (obj && obj !== relative) {
    obj = obj[field];
  }
  if (obj && obj === relative) {
    return true;
  }
  return false;
};

BB.Util.with_ = function(obj, fields, fun) {
  if (!(fields instanceof Array)) {
    fields = [fields];
  }
  for (var i in fields) {
    if (fields[i] in obj) {
      if (typeof fun === "function") {
        fun(obj[fields[i]]);
      } else {
        obj[fields[i]][fun]();
      }
    }
  }
};

BB.Util.countTrueUpTo = function(limit, ary) {
  var cnt = 0;
  for (var i = 0; i < ary.length && i < limit; i++) {
    cnt += ary[i] == true;
  }
  return cnt;
};

String.prototype.startsWith = function(a) {
  return this.indexOf(a) == 0;
};

BB.Util.pageXY = function(e) {
  var pageX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
  var pageY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;

  e.pageX = pageX;
  e.pageY = pageY;
};

BB.Util.toggleMenu = function(menu, elem) {
  $(menu).toggle();
  var top = $(elem).offset().top + $(elem).height() + 4;
  if (top + $(menu).height() > window.innerHeight) {
    top = $(elem).offset().top - $(menu).height() - 4;
  }
  $(menu).css({
    left: $(elem).offset().left + $(elem).width() - $(menu).width() + "px",
    top: top + "px"
  });
};

BB.Util.array_to_mat = function(m) {
  var mat = new THREE.Matrix4(
    m[0][0],
    m[0][1],
    m[0][2],
    m[0][3],
    m[1][0],
    m[1][1],
    m[1][2],
    m[1][3],
    m[2][0],
    m[2][1],
    m[2][2],
    m[2][3],
    m[3][0],
    m[3][1],
    m[3][2],
    m[3][3]
  );
  return mat;
};

BB.ImageUtils = {};

BB.ImageUtils.loadTexture = function(url, mapping, onLoad, onError) {
  var tex = new THREE.Texture(undefined, mapping);
  tex.sourceFile = url;

  var xhr = new BB.XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";

  var that = this;

  xhr.addEventListener("load", function(e) {
    var img = window.document.createElement("img");
    img.crossOrigin = that.crossOrigin;
    img.src = window.URL.createObjectURL(e.target.response);
    img.addEventListener("load", function() {
      tex.image = img;
      tex.needsUpdate = true;

      if (onLoad) {
        onLoad(tex);
      }
    });
  });

  if (onError !== undefined) {
    xhr.addEventListener("error", function(e) {
      onError(e);
    });
  }

  xhr.send(null);

  return tex;
};

BB.Util.round = function(obj) {
  var keys = Object.keys(obj);
  for (var i in keys) {
    if (obj.hasOwnProperty(keys[i])) {
      obj[keys[i]] = Math.round(obj[keys[i]]);
    }
  }
};
