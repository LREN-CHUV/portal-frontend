/*

Author: Stanislaw Adaszewski, 2014

*/

if (window.BB === undefined) {
    BB = {};
}

BB.App = function(el) {
    var scene = new THREE.Scene();
    var rend = new THREE.WebGLRenderer(); // {antialias: true});
    var mappers = [];

    var viewport = $(el).children('#viewport'); // '<div id="viewport"></div>');
    var ui = $('<div />');
    $(el).append($('<img src="svg/menus.png" title="Toggle Menus" style="position: absolute; left: 10px; top: 100%; margin-top: -34px; z-index: 2;" />').click(function() {
        $('#ui, #components').toggle();
    }));
    $(el).append($('<div id="ui"></div>').append(ui));

    rend.setSize(window.innerWidth, window.innerHeight);
    // rend.autoUpdateObjects = false;
    // rend.sortObjects = false;
    viewport.append(rend.domElement);

    var cam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, 100000);
    cam.position.set(0, 0, -1200);
    cam.lookAt(new THREE.Vector3(0,0,0));
    scene.add(cam);

    var ambient = new THREE.AmbientLight(0x333333);
    scene.add(ambient);

    var light = new THREE.DirectionalLight(0xffffff); //, 0.5);
    light.position.set(1,1,1).normalize();
    scene.add(light);

    light = light.clone();
    light.position.set(-1,-1,-1).normalize();
    scene.add(light);

    var alphaMethod = rend; // new THREE.DepthPeeling(rend); // new THREE.StochasticTransparency(rend);

    var down = false;
    var controls = new THREE.TrackballControls(cam, rend.domElement);
    var redraw = false;
    var downPos;
    controls.staticMoving = true;
    $(rend.domElement).bind('mouseup touchend', function(e) {
        var pageX = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageX : e.pageX;
        var pageY = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageY : e.pageY;

        e.preventDefault();

        e.pageX = pageX;
        e.pageY = pageY;

        controls.update();
        if (pageX != downPos.x || pageY != downPos.y) {
            for (var i in mappers) {
                mappers[i].camUpdate(cam);
            }
            redraw = true;
        }
        // alphaMethod.render(scene, cam);
        down = false;
        if (Math.abs(pageX - downPos.x) <= 4 && Math.abs(pageY - downPos.y) <= 4) {
            if (e.button == 2) {
                $('#components,#ui').toggle();
            } else {
                for (var i in mappers) {
                    mappers[i].onclick(e);
                }
            }
        }
        // alert([pageX, pageY, downPos.x, downPos.y]);
    }).bind('mousedown touchstart', function(e) {
        e.preventDefault();
        controls.update();
        // rend.render(scene, cam);
        redraw = true;
        down = true;
        var pageX = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageX : e.pageX;
        var pageY = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageY : e.pageY;
        downPos = {x: pageX, y: pageY};
        //alert(downPos);
    }).mousemove(function() {
        controls.update();
        if (down) {
            // rend.render(scene, cam);
            redraw = true;
        }
    }).bind('mousewheel', function() {
        controls.update();
        //rend.render(scene, cam);
        redraw = true;
    }).bind('DOMMouseScroll', function() {
        controls.update();
        //rend.render(scene, cam);
        redraw = true;
    }).bind('touchmove', function() {
        controls.update();
        redraw = true;
    }).bind('touchend', function() {
        controls.update();
        redraw = true;
    });

    window.addEventListener('resize', function() {
        cam.aspect = window.innerWidth / window.innerHeight;
        cam.updateProjectionMatrix();
        rend.setSize(window.innerWidth, window.innerHeight);
        if (alphaMethod.handleResize !== undefined) {
            alphaMethod.handleResize();
        }
        alphaMethod.render(scene, cam);
        controls.handleResize();
    })

    this.scene = scene;
    this.rend = rend;
    this.cam = cam;
    this.alphaMethod = alphaMethod;
    this.controls = controls;
    this.viewport = viewport;
    this.ui = ui;
    this.mappers = mappers;
    BB.App.singleton = this;

    function animate() {
        var needsUpdate = false;
        for (var i in mappers) {
            if (mappers[i].needsUpdate) {
                needsUpdate = true;
                mappers[i].needsUpdate = false;
            }
        }
        if (needsUpdate || redraw) {
            alphaMethod.render(scene, cam);
            redraw = false;
        }
        //setTimeout(animate, 50);
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    this.requestRedraw = function() {
        redraw = true;
    }

    this.transformControls = [];

    this.removeGizmos = function() {
        for (var i in this.transformControls) {
            var ctr = this.transformControls[i];
            ctr.detach();

        }
        this.controls.enabled = true;
    }

    this.addGizmos = function() {
        for (var i in this.transformControls) {
            var ctr = this.transformControls[i];
            ctr.attach(ctr.previousObject);
            ctr.update();
        }
        this.controls.enabled = false;
    }

    var that = this;

    window.addEventListener('keydown', function(e) {
        if (e.keyCode == 27) {
            var any = false;
            for (var i in that.transformControls) {
                var ctr = that.transformControls[i];
                if (ctr.object !== undefined) {
                    any = true;
                    break;
                }
            }
            if (any) {
                that.removeGizmos();
            } else {
                that.addGizmos();
            }
            that.requestRedraw();
        }
    });
}

BB.App.prototype.addMapper = function(mapper, cb) {
    // mapper.serialize();
    this.mappers.push(mapper);
    var that = this;
    var ui = this.ui;

    var outer = $('<div />');
    ui.append(outer);
    var div = $('<div />');
    outer.append(div);
    div.append($('<span />').text(mapper.getUserFriendlyName() + ' '));
    div.append('<img src="images/throbber.gif" />');

    var xhr = mapper.init(function() {
        div.children('img').remove();
        var hide = $('<input class="hide" type="button" value="Hide" title="Hide" />');
        div.append(hide);
        var hideOthers = $('<input class="hideOthers" type="button" value="Hide Others" title="Hide Others" />');
        div.append(hideOthers);
        var transform = $('<input class="transform" type="button" value="Transform" title="Transform (W/E/R to translate/rotate/scale, 2x to switch local/global)" />');
        div.append(transform);
        var remove = $('<input class="remove" type="button" value="Remove" title="Remove" />');
        div.append(remove);

        var client = $('<div class="client" />');
        outer.append(client);

        hide.click(function() {
            if ($(this).val() == 'Show') {
                $(this).removeClass('show');
                $(this).addClass('hide');
                $(this).val('Hide');
                mapper.map(that.scene, client, cb);
            } else {
                $(this).removeClass('hide');
                $(this).addClass('show');
                $(this).val('Show');

                mapper.unmap(that.scene, client);
            }

        });

        hideOthers.click(function() {
            for (var i = 0; i < that.mappers.length; i++) {
                var child = $(ui.children()[i]);
                var showHide = child.find('.show,.hide');
                var client = child.children('.client').get(0);
                if (that.mappers[i] != mapper) {
                    showHide.val('Show').removeClass('hide').addClass('show');
                    that.mappers[i].unmap(that.scene, client);
                } else if (showHide.val() == 'Show') {
                    showHide.val('Hide').removeClass('show').addClass('hide');
                    that.mappers[i].map(that.scene, client, cb);
                }
            }
            that.requestRedraw();
        });

        remove.click(function() {
            mapper.unmap(that.scene, client);
            mapper.dispose();
            var idx = that.mappers.indexOf(mapper);
            that.mappers.splice(idx, 1);
            outer.remove();
            that.requestRedraw();
            if (controls !== undefined) {
                if (controls.object !== undefined) {
                    that.removeGizmos();
                }
                that.scene.remove(controls.gizmo);
                that.transformControls.splice(that.transformControls.indexOf(controls), 1);
                BB.Util.dispose(controls.gizmo);
            }
        });

        var controls;

        transform.click(function() {
            if (controls === undefined) {
                controls = new THREE.TransformControls(that.cam, that.rend.domElement);
                controls.setMode('translate');
                controls.addEventListener('change', function() { that.requestRedraw(); });
                controls.scale = 0.65;
                that.scene.add(controls.gizmo);
                that.transformControls.push(controls);
            }

            if (controls.object !== undefined) {
                that.removeGizmos();
            } else {
                controls.attach(obj);
                that.controls.enabled = false;
                controls.update();
            }

            that.requestRedraw();
        });


        var obj = mapper.map(that.scene, client, cb);
    });

    if (xhr !== undefined) {
        div.children('img').remove();
        new BB.Util.ProgressIndicator(xhr, div);
    }
}

BB.App.prototype.removeMapper = function(mapper) {
    mapper.unmap(this.scene, this.ui);
    this.mappers.remove(mapper);
}

BB.App.prototype.saveSession = function(cb) {
    var str = '[[';
    var mappers = this.mappers;
    for (var i = 0; i < mappers.length; i++) {
        (i > 0) && (str += ',');
        str += '["' + mappers[i].getClassName() + '",' + JSON.stringify(mappers[i].serialize()) + ']';
    }
    str += '],';
    var controls = this.controls;
    var rot = this.cam.rotation;
    str += JSON.stringify({cam: {position: this.cam.position, rotation: {x: rot.x, y: rot.y, z: rot.z, order: rot.order || 'XYZ'}},
        target: controls.target, object: {position: controls.object.position, up: controls.object.up}}) + ']';

    //str += JSON.stringify({cam: ) + ']]';
    alert(str);
    $.post('./save_session', str, function(data) {
        // alert('Session id: ' + data);
        if (cb !== undefined) {
            cb(data);
        }
    }, 'text');
}

BB.App.prototype.loadSession = function(id) {
    var mappers = this.mappers;
    for (var i = 0; i < mappers.length; i++) {
        mappers[i].unmap(this.scene, this.ui);
        mappers[i].dispose();
    }
    mappers.splice(0, mappers.length);
    var that = this;
    DataFormats.getPSON('./load_session?id=' + encodeURIComponent(id), function(data) {
        var mappers = data[0];
        var view = data[1];
        for (var i = 0; i < mappers.length; i++) {
            var s = mappers[i];
            var c = eval("new " + s[0] + "()");
            var d = s[1]; // JSON.parse(s[1]);
            c.deserialize(d);
            /*for (k in d) {
                c[k] = d[k];
            }*/
            that.addMapper(c);
        }

        var controls = that.controls;
        that.cam.position.copy(view.cam.position);
        that.cam.rotation.copy(view.cam.rotation);
        controls.target0.copy(view.target);
        controls.position0.copy(view.object.position);
        controls.up0.copy(view.object.up);
        controls.reset();
        //that.cam.rotation.copy(cam[1]);
        // that.controls.lastPosition.copy(cam[0]); // reset();
        // that.controls._eye.copy( cam[0] ).sub( that.controls.target );
        // that.controls.enabled = false;
        // that.controls = new THREE.TrackballControls(that.camera, that.rend.domElement);
        // that.controls.staticMoving = true;
        // THREE.TrackballControls.call(that.controls, that.cam, that.rend.domElement);
        // that.controls.myReset();
    });
}
