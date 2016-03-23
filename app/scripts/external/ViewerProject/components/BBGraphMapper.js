/*

Author: Stanislaw Adaszewski, 2014

*/

if (window.BB === undefined) {
    BB = {};
}

BB.GraphMapper = function(path) {
    BB.Mapper.call(this);

    this.path = path || './graphs/rules_final.gexf';
}

BB.Mapper.subclasses.push(BB.GraphMapper);

BB.GraphMapper.prototype = Object.create(BB.Mapper.prototype);

BB.GraphMapper.prototype.init = function(cb) {
    var path = this.path;
    var that = this;

    var xhr = new BB.XMLHttpRequest();
    xhr.url = path;
    xhr.open('GET', path);
    xhr.addEventListener('load', function(e) {
        that.data = e.target.response;
        if (cb !== undefined) {
            cb();
        }
    });
    setTimeout(function() { xhr.send(null); }, 100);
    return xhr;
}

BB.GraphMapper.prototype.serialize = function() {
    return {path: this.path};
}

BB.GraphMapper.prototype.deserialize = function(obj) {
    this.path = obj.path;
}

BB.GraphMapper.prototype.map = function(obj, el, cb) {
    var doc = $(this.data);

    var idToOfs = {};
    var positions = new Array();
    var colors = new Array();
    var sizes = new Array();
    var labels = new Array();
    var urls = new Array();
    var fixed = new Array();
    var legends = new Array();

    doc.find('node').each(function() {
        var id = $(this).attr('id');
        var label = $(this).attr('label');
        var pos = $(this).children('viz\\:position');
        var x = Math.random() * 500 - 100; // parseFloat(pos.attr('x'));
        var y = Math.random() * 500 - 100; // parseFloat(pos.attr('y'));
        var z = Math.random() * 500 - 100; // parseFloat(pos.attr('z'));
        var col = $(this).children('viz\\:color');
        var r = parseInt(col.attr('r'));
        var g = parseInt(col.attr('g'));
        var b = parseInt(col.attr('b'));
        var legend = col.attr('legend');
        var size = $(this).children('viz\\:size').attr('value');
        col = (r << 16) | (g << 8) | b;

        var url = $(this).find('attvalue[for=url]').attr('value');
        var f = $(this).find('attvalue[for=fixed]').attr('value') || false;

        idToOfs[id] = positions.length;
        positions.push(new THREE.Vector3(x, y, z));
        colors.push(col);
        sizes.push(size);
        labels.push(label);
        urls.push(url);
        fixed.push(f);
        legends.push(legend);
    });

    var weights = new Array();
    var sources = new Array();
    var targets = new Array();
    var edgeColors = new Array();
    var edgeLabels = new Array();

    doc.find('edge').each(function() {
        var weight = $(this).attr('weight');
        var source = parseInt($(this).attr('source'));
        var target = parseInt($(this).attr('target'));
        var col = $(this).children('viz\\:color');
        var label = $(this).attr('label');
        if (col.length == 1) {
            var r = parseInt(col.attr('r'));
            var g = parseInt(col.attr('g'));
            var b = parseInt(col.attr('b'));
            col = new THREE.Color((r << 16) | (g << 8) | b);
        } else {
            col = new THREE.Color(colors[idToOfs[source]]);
        }
        edgeColors.push(col);
        sources.push(source);
        targets.push(target);
        weights.push(weight || 1);
        edgeLabels.push(label);
    });

    this.idToOfs = idToOfs;
    this.positions = positions;
    this.fixed = fixed;
    this.sizes = sizes;
    this.weights = weights;
    this.sources = sources;
    this.targets = targets;
    this.edgeLabels = edgeLabels;

    var active = new Array(positions.length);
    for (var i = 0; i < active.length; i++) {
        active[i] = true;
    }
    this.active = active;

    // this.layout(positions, sizes, sources, targets, weights);

    var sphere = new THREE.SphereGeometry(1, 16, 16);
    var materials = {};
    var graph = new THREE.Object3D();
    graph.position.set(-400,-400,0);

    this.graph = graph;
    this.sphere = this.sphere;
    this.materials = materials;


    var textTexture = new BB.TextTexture();


    var cam = BB.Util.findCamera(obj);

    // var texMat = new THREE.MeshBasicMaterial({color: 0xffffff, map: textTexture.createTexture(), depthTest: false, transparent: true, opacity: 1});

    var nodes = new Array();
    var labelMeshes = new Array();
    for (var i = 0; i < positions.length; i++) {
        var col = colors[i];
        if (!(col in materials)) {
            materials[col] = new THREE.MeshLambertMaterial({color: col});
        }
        var node = new THREE.Mesh(sphere, materials[col]);
        nodes.push(node);
        node.userData.idx = i;
        node.userData.url = urls[i];
        node.userData.label = labels[i];
        node.position = positions[i];
        var size = sizes[i];
        node.scale.set(size, size, size);
        graph.add(node);

        var ret = textTexture.addText(labels[i]);
        var plane = textTexture.createPlane(ret); /* new THREE.PlaneGeometry(1, 1);
        plane.faceVertexUvs[0][0] = [new THREE.Vector2(ret[0], ret[1]), new THREE.Vector2(ret[0], ret[3]), new THREE.Vector2(ret[2], ret[1])];
        plane.faceVertexUvs[0][1] = [new THREE.Vector2(ret[0], ret[3]), new THREE.Vector2(ret[2], ret[3]), new THREE.Vector2(ret[2], ret[1])]; */

        var label = new THREE.Mesh(plane, ret[6]);
        label.quaternion = cam.quaternion;
        label.position = positions[i]; // .set(positions[i].x, positions[i].y, positions[i].z);
        label.scale.set(ret[4] * size / 50, ret[5] * size / 50, 1);
        graph.add(label);
        labelMeshes.push(label);
    }

    // textTexture.finalize();

    var edges = new THREE.Geometry();
    edges.dynamic = true;
    this.edges = edges;

    var that = this;

    var edgeLabelMeshes = new Array();

    for (var i = 0; i < sources.length; i++) {
        var source = idToOfs[sources[i]];
        var target = idToOfs[targets[i]];
        var label = edgeLabels[i];

        var ret = textTexture.addText(edgeLabels[i]);
        var plane = textTexture.createPlane(ret);
        // var plane = new THREE.CubeGeometry(10, 10, 10);
        // var mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({color: 0xff0000}));
        var mesh = new THREE.Mesh(plane, ret[6]);
        var weight = weights[i];
        mesh.quaternion = cam.quaternion;
        mesh.position = new BB.AverageVector(positions[source], positions[target]);
        mesh.scale.set(ret[4] * weight / 2, ret[5] * weight / 2, 1);
        graph.add(mesh);
        edgeLabelMeshes.push(mesh);
    }

    function updateActive() {
        for (var i = 0; i < positions.length; i++) {
            nodes[i].visible = active[i];
            labelMeshes[i].visible = active[i];
        }

        edges.verticesNeedUpdate = true;
        edges.colorsNeedUpdate = true;
        edges.vertices.length = 0;
        edges.colors.length = 0;
        for (var i = 0; i < sources.length; i++) {
            var source = idToOfs[sources[i]];
            var target = idToOfs[targets[i]];
            if (!active[source] || !active[target]) {
                // var col = new THREE.Color(0x000000);
                edges.vertices.push(positions[target]);
                edgeLabelMeshes[i].visible = false;
            } else {
                edges.vertices.push(positions[source]);
                edgeLabelMeshes[i].visible = true;
            }
            var col = edgeColors[i];
            edges.vertices.push(positions[target]);
            edges.colors.push(col);
            edges.colors.push(col);
        }

        that.needsUpdate = true;
    }
    this.updateActive = updateActive;
    updateActive();

    var highlightObject = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({color: 0xffffff, depthTest: false, depthWrite: false, transparent: true, opacity: 0.5}));
    graph.add(highlightObject);
    this.highlightObject = highlightObject;

    var edgeMat = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors, transparent: true, opacity: 0.5});

    var edgesObj = new THREE.Line(edges, edgeMat, THREE.LineSegments);

    graph.add(edgesObj);

    obj.add(graph);

    this.needsUpdate = true;

    this.layoutActive = true;
    $(el).append($('<input type="button" value="Stop" />').click(function() {
        if ($(this).val() == 'Stop') {
            $(this).val('Continue');
            that.layoutActive = false;
        } else {
            $(this).val('Stop');
            that.layoutActive = true;
        }
    }));

    unique = {};
    for (var i in colors) {
        var col = colors[i];
        var hex = '#' + ('000000' + col.toString(16)).substr(-6);
        if (!(col in unique)) {

            var legend = legends[i]; // $(doc).find('meta[name="label",for="' + hex + '"]').attr('value');

            if (legend === undefined) {
                legend = hex;
            }

            $(el).append(
                $('<div />')
                    .append($('<div />').css({display: 'inline-block', width: 16 + 'px', height: 16 + 'px', background: hex}))
                    .append($('<input type="checkbox" checked="checked" />').css({float: 'left'}).data('color', col).change(function() {
                        var col = $(this).data('color');

                        for (var i = 0; i < active.length; i++) {
                            if (colors[i] == col) {
                                active[i] = this.checked;
                            }
                        }

                        updateActive();
                    }))
                    .append($('<div style="display: inline-block;" />').text(legend)));
            unique[col] = true;
        }
    }

    this.activeLabel = $('<div>Active Node:</div>');

    $(el).append(this.activeLabel)
        .append($('<input type="button" value="More" />').click(function() {
            if(that.activeObject.userData === undefined)
            {
                alert("Click on a sphere first...");
            }
            else
            {
                var dataType = legends[that.activeObject.userData.idx];
                var label = that.activeObject.userData.label;
                var url = undefined;
                if(dataType == 'Genetic')
                {
                    url = 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + encodeURIComponent(label.match("\\[(.*)\\]")[1]);
                }
                else if (dataType == 'Brain anatomy')
                {
                    url = 'http://google.com/search?q=' + encodeURIComponent(label);
                }
                else if (dataType == 'Brain metabolism')
                {
                    url = 'http://google.com/search?q=' + encodeURIComponent(label);
                }
                else if (dataType == 'AD')
                {
                    url = 'http://google.com/search?q=' + encodeURIComponent(label);
                }
                else if (dataType == 'Controls')
                {
                    url = 'http://google.com/search?q=' + encodeURIComponent(label);
                }
                else if (dataType == 'CSF proteins')
                {
                    url = 'http://google.com/search?q=' + encodeURIComponent(label);
                }
                else if (dataType == 'Blood proteins')
                {
                    url = 'http://google.com/search?q=' + encodeURIComponent(label);
                }
                else
                {
                    url = 'http://google.com/search?q=' + encodeURIComponent(label);   
                }
                window.open(url, '_blank');
            }
        }))
        .append($('<input type="button" value="Only" />').click(function() {
            var active = that.active;
            var idx = that.activeObject.userData.idx;
            for (var i = 0; i < active.length; i++) {
                active[i] = false;
            }
            active[idx] = true;
            that.updateActive();
        }))
        .append($('<input type="button" value="Outgoing" />').click(function() {
            var active = that.active;
            var idx = that.activeObject.userData.idx;
            for (var i = 0; i < sources.length; i++) {
                var src = idToOfs[sources[i]];
                var tgt = idToOfs[targets[i]];
                if (src == idx) {
                    active[tgt] = true;
                }
            }
            that.updateActive();
        })).append($('<input type="button" value="Incoming" />').click(function() {
           var active = that.active;
           var idx = that.activeObject.userData.idx;
           for (var i = 0; i < sources.length; i++) {
               var src = idToOfs[sources[i]];
               var tgt = idToOfs[targets[i]];
               if (tgt == idx) {
                   active[src] = true;
               }
           }
           that.updateActive();
        })).append($('<input type="button" value="Expand" />').click(function() {
            // var idx = that.activeObject.userData.idx;
            var active = that.active.slice();
            for (var i = 0; i < sources.length; i++) {
                var src = idToOfs[sources[i]];
                var tgt = idToOfs[targets[i]];
                if (active[src] || active[tgt]) {
                    that.active[src] = true;
                    that.active[tgt] = true;
                }
            }
            that.updateActive();
        }))
        .append($('<input type="button" value="All" />').click(function() {
            for (var i = 0; i < active.length; i++) {
                active[i] = true;
            }
            that.updateActive();
        }))
        .append($('<input type="button" value="No islands" />').click(function() {
            var connected = new Array(that.active.length);
            var active = that.active.slice();
            for (var i = 0; i < active.length; i++) {
                that.active[i] = false;
            }
            for (var i = 0; i < sources.length; i++) {
                var src = idToOfs[sources[i]];
                var tgt = idToOfs[targets[i]];
                if (active[src] && active[tgt]) {
                    that.active[src] = that.active[tgt] = true;
                }
            }
            that.updateActive();
        }));

    if (cb !== undefined) {
        cb();
    }

    this.layout();

    this.mapped = true;

    this.mappingObj = graph;

    return graph;
}

BB.GraphMapper.prototype.unmap = function(obj, el) {
    this.mapped = false;
    var graph = this.graph;
    obj.remove(this.graph);
    BB.Util.dispose(graph);
    window.clearInterval(this.timerId);
    $(el).children().remove();
    this.needsUpdate = true;

    this.mappingObj = null;
}

BB.GraphMapper.prototype.getUserFriendlyName = function() {
    return "Graph Mapper";
}

BB.GraphMapper.prototype.getNode = function(e, cb) {
    var x = ( e.pageX / window.innerWidth ) * 2 - 1;
    var y = -( e.pageY / window.innerHeight ) * 2 + 1;
    var cam = BB.Util.findCamera(this.graph);
    var dir = new THREE.Vector3(x, y, 0.5);
    var projector = new THREE.Projector();
    projector.unprojectVector(dir, cam);
    dir.sub(cam.position);
    dir.normalize();

    var ray = new THREE.Raycaster(cam.position, dir);
    var isect = ray.intersectObjects(this.graph.children);

    for (var i = 0; i < isect.length; i++) {
        // var url = isect[0].object.userData.url
        if (isect[i].object.visible && isect[i].object.userData.label !== undefined) {
            cb(isect[i].object);
        }
    }
}

BB.GraphMapper.prototype.onmousemove = function(e) {
    if (!this.mapped) {
        return;
    }
    var that = this;
    e.target.style.cursor = '';
    this.getNode(e, function(object) {
        e.target.style.cursor = 'pointer';
        that.highlightObject.position = object.position;
        that.highlightObject.scale = object.scale;
        that.needsUpdate = true;
    });
}

BB.GraphMapper.prototype.onclick = function(e) {
    var that = this;
    this.getNode(e, function(object) {
        that.activeObject = object;
        that.activeLabel.text(object.userData.label + ':');
        /* var label = object.userData.label;

        if (label !== undefined) {
            var url = 'http://google.com/search?q=' + encodeURIComponent(label); // + ' Les Miserables');
            window.open(url, '_blank');
        } */
    })
}

BB.GraphMapper.prototype.layout = function() {
    var idToOfs = this.idToOfs;
    var positions = this.positions;
    var sizes = this.sizes;
    var sources = this.sources;
    var targets = this.targets;
    var weights = this.weights;
    var fixed = this.fixed;
    var edges = this.edges;
    var active = this.active;
    var that = this;

    var forces = new Array(positions.length);
    for (var i = 0; i < positions.length; i++) forces[i] = new THREE.Vector3();

    function step() {
        if (!that.layoutActive) {
            return;
        }

        // Attract to the center
        for (var i = 0; i < positions.length; i++) {
            var p = positions[i];
            var lsq = p.length() * 5;
            forces[i].set(-p.x / lsq, -p.y / lsq, -p.z / lsq);
        }

        for (var i = 0; i < positions.length; i++) {
            if (!active[i]) {
                continue;
            }
            for (var k = i + 1; k < positions.length; k++) {
                if (!active[k]) {
                    continue;
                }

                var pi = positions[i];
                var pk = positions[k];
                var si = sizes[i];
                var sk = sizes[k];

                var diff = pi.clone().sub(pk);
                var l = Math.abs(diff.length() - si - sk);
                if (l < 1) l = 1;
                var lsq = Math.pow(l, 2);
                if (isNaN(pi.x) || isNaN(pk.x) || si === undefined || sk === undefined || lsq == 0) {
                    console.log('error');
                }
                diff.normalize();
                //if (isNaN(diff.x)) continue;
                diff.multiplyScalar(6 * si * sk / lsq); // si * sk / lsq);
                forces[i].add(diff);
                forces[k].sub(diff);
            }
        }

        for (var i = 0; i < sources.length; i++) {
            var src = idToOfs[sources[i]];
            var tgt = idToOfs[targets[i]];
            if (!active[src] || !active[tgt]) {
                continue;
            }
            var w = weights[i] || 1;
            var ps = positions[src];
            var pt = positions[tgt];

            var diff = ps.clone().sub(pt);
            var l = diff.length();
            diff.normalize();
            diff.multiplyScalar(w * l / 1000);

            forces[src].sub(diff);
            forces[tgt].add(diff);
        }

        for (var i = 0; i < positions.length; i++) {
            if (!fixed[i]) {
                positions[i].add(forces[i].multiplyScalar(100/sizes[i]));
            }
        }

        /* for (var i = 0; i < that.graph.children.length; i++) {
            that.graph.children[i].matrixWorldNeedsUpdate = true;
        } */
        edges.verticesNeedUpdate = true;
        that.needsUpdate = true;
    }

    this.timerId = setInterval(step, 20);
}

BB.GraphMapper.prototype.getClassName = function() {
    return "BB.GraphMapper";
}

BB.TextTexture = function(width, height, font, fontHeight) {
    this.w = width || 2048;
    this.h = height || 2048;
    var canvas = $('<canvas width="' + this.w + '" height="' + this.h + '" />').get(0);
    $('body').append(canvas);
    this.canvas = canvas;
    var ctx = canvas.getContext('2d');
    this.ctx = ctx;
    this.fillStyles = ['#f00', '#0f0', '#00f'];
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.rect(0, 0, this.w, this.h);
    ctx.fill();
    fontHeight = fontHeight || 32;
    this.ctx.font = font ? fontHeight + ' px' + font : 'bold 32px sans-serif';
    this.ofs = [0, 0, 0];
    this.fontHeight = fontHeight;

    this.texture = this.createTexture();

    this.materials = new Array(3);
    this.materials[0] = new THREE.ShaderMaterial({'defines': {'COMPONENT': '0'}, 'uniforms': {'map': {'type': 't', value: this.texture}}, 'vertexShader': BB.TextTexture.vertexShader, 'fragmentShader': BB.TextTexture.fragmentShader, 'depthTest': false, 'depthWrite': false, transparent: true});
    this.materials[1] = new THREE.ShaderMaterial({'defines': {'COMPONENT': '1'}, 'uniforms': {'map': {'type': 't', value: this.texture}}, 'vertexShader': BB.TextTexture.vertexShader, 'fragmentShader': BB.TextTexture.fragmentShader, 'depthTest': false, 'depthWrite': false, transparent: true});
    this.materials[2] = new THREE.ShaderMaterial({'defines': {'COMPONENT': '2'}, 'uniforms': {'map': {'type': 't', value: this.texture}}, 'vertexShader': BB.TextTexture.vertexShader, 'fragmentShader': BB.TextTexture.fragmentShader, 'depthTest': false, 'depthWrite': false, transparent: true});
}

BB.TextTexture.vertexShader = [
    'varying vec2 vUv;',
    'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
].join('\n');

BB.TextTexture.fragmentShader = [
    'varying vec2 vUv;',
    'uniform sampler2D map;',
    'void main() {',
    'float d=texture2D(map, vUv)[COMPONENT];',
    'gl_FragColor = vec4(d,d,d,d);',
    '}'
].join('\n');

//BB.TextTexture.prototype.material =

BB.TextTexture.prototype.addText = function(txt) {
    var ctx = this.ctx;
    var ofs = this.ofs;


    // ctx.textAlign = 'left';

    var metrics = ctx.measureText(txt);
    var w = metrics.width;
    var h = this.fontHeight;

    /* if (ofs[1] == -1) {
        ofs[1] = 2*16;
    } */

    if (ofs[0] + w >= this.w) {
        ofs[0] = 0;
        ofs[1] += this.fontHeight + 10;
        if (ofs[1] + this.fontHeight + 10 >= this.h) {
            ofs[1] = 0;
            ofs[2]++;
            if (ofs[2] > 2) {
                return null;
            }
        }
    }



    var imgData = ctx.getImageData(ofs[0], ofs[1], w, h + 10);
    var imgData3 = ctx.getImageData(ofs[0], ofs[1], w, h + 10);

    var data = imgData.data;
    var data3 = imgData3.data;
    for (var i = 0; i < data.length; i++) {
        data[i] = 0;
    }
    ctx.putImageData(imgData, ofs[0], ofs[1]);

    // ctx.fillStyle = 'rgba(0,0,0,0);';
    //ctx.globalCompositeOperation = 'source-over';
    // ctx.fillRect(ofs[0], ofs[1], w, h + 10);

    ctx.fillStyle = this.fillStyles[ofs[2]] || 'rgba(0,0,0,0)';
    //ctx.globalCompositeOperation = 'lighter';

    ctx.fillText(txt, ofs[0], ofs[1] + this.fontHeight);

    var imgData2 = ctx.getImageData(ofs[0], ofs[1], w, h + 10);

    // premultiply alpha

    var data2 = imgData2.data;
    for (var i = 0; i < data.length; i += 4) {
        data2[i] = data3[i];
        data2[i+1] = data3[i+1];
        data2[i+2] = data3[i+2];
        data2[i + ofs[2]] = data2[i + 3];
        data2[i + 3] = 255;
    }
    ctx.putImageData(imgData2, ofs[0], ofs[1]);

    //var ret = [0,1,0.2,0.95,w,h];

    var ret = [ofs[0] / this.w,
        1 - ofs[1] / this.h,
        (ofs[0] + w) / this.w,
        1 - (ofs[1] + h + 10) / this.h,
        w,
        h + 10,
        this.materials[ofs[2]]];

    ofs[0] += w + 10;

    return ret;
}

/* BB.TextTexture.prototype.finalize = function() {
    var ctx = this.ctx;
    var canvas = this.canvas;
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
} */

BB.TextTexture.prototype.createTexture = function() {
    var tex = new THREE.Texture(this.canvas);
    /* tex.width = this.canvas.width;
    tex.height = this.canvas.height;*/
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
}

BB.TextTexture.prototype.createPlane = function(ret) {
    var plane = new THREE.PlaneGeometry(1, 1);
    plane.faceVertexUvs[0][0] = [new THREE.Vector2(ret[0], ret[1]), new THREE.Vector2(ret[0], ret[3]), new THREE.Vector2(ret[2], ret[1])];
    plane.faceVertexUvs[0][1] = [new THREE.Vector2(ret[0], ret[3]), new THREE.Vector2(ret[2], ret[3]), new THREE.Vector2(ret[2], ret[1])];
    return plane;
}

BB.AverageVector = function(v1, v2) {
    THREE.Vector3.call(this);

    Object.defineProperty(this, 'x', {
        get: function() { return (v1.x + v2.x) / 2; }
    });
    Object.defineProperty(this, 'y', {
        get: function() { return (v1.y + v2.y) / 2; }
    });
    Object.defineProperty(this, 'z', {
        get: function() { return (v1.z + v2.z) / 2; }
    });
}

BB.AverageVector.prototype = Object.create(THREE.Vector3.prototype);

