console.log("Basic Example - loading object");

var camera, scene, renderer;

var FULLSCREEN = false;
var width = 800;
var height = 600;
if (FULLSCREEN) {
    width = window.innerWidth;
    height = window.innerHeight;
}
var loadedObj;
var rotation = 0;
var group;
var cube;
var mouseX = 0, mouseY = 0;
var windowHalfX = width / 2;
var windowHalfY = height / 2;

var controls;
var raycaster;
var mouse = new THREE.Vector2(), INTERSECTED;

var line;
var MAX_POINTS = 5000;
var drawCount;
var splineArray = [];

var lineColor = 0x00ccee;
var active = false;

init();
animate();

$("#slider").roundSlider();

function init() {
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    camera.position.z = 12;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    var ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1).normalize();
    scene.add(directionalLight);

    group = new THREE.Object3D();


    //Shadow
    var shadowtexture = new THREE.TextureLoader().load("tex/shadow.png");
    shadowtexture.wrapS = THREE.ClampToEdgeWrapping;
    shadowtexture.wrapT = THREE.ClampToEdgeWrapping;

    var shadowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, map: shadowtexture, transparent: true, opacity: 0.25 });
    var shadowGeometry = new THREE.PlaneGeometry(2, 2, 1);
    var shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    //shadow.position.y = -3;
    shadow.rotation.x = -Math.PI * 0.5;
    group.add(shadow);
    scene.add(group);

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    //renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);

    //--Orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // remove when using animation loop
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    console.log("scene.children", scene.children);

    var size = 10;
    var divisions = 10;
    var gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);

    CreateBufferGeometry();
    var material2 = new THREE.MeshBasicMaterial({ color: lineColor, transparent: true, opacity: 0.8 });
    var geometry2 = new THREE.SphereGeometry( 0.5, 12, 12 );
    var sphere = new THREE.Mesh( geometry2, material2 );

    sphere.rotation.x = 0.5;
    sphere.position.y = 0.5;
    sphere.position.x = 0;
    scene.add( sphere );

}

function CreateBufferGeometry() {

    // geometry
    var geometry = new THREE.BufferGeometry();

    // attributes
    var positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

    // draw range
    var drawCount = 2; // draw the first 2 points, only
    geometry.setDrawRange(0, drawCount);

    // material
    var material = new THREE.LineBasicMaterial({ color: lineColor, linewidth: 5, transparent: true, opacity: 0.8});

    // line
    line = new THREE.Line(geometry, material);
    
    scene.add(line);

    splineArray.push(new THREE.Vector3(0, 0.5, 0));
    splineArray.push(new THREE.Vector3(0, 5, 0));





}

function randomRange(minimum,maximum){
    var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    return randomnumber;
}
// update positions
function updatePositions() {

    var positions = line.geometry.attributes.position.array;

    var index = 0;

    for (var i = 0; i < splineArray.length; i++) {

        positions[index++] = splineArray[i].x;
        positions[index++] = splineArray[i].y;
        positions[index++] = splineArray[i].z;


    }
}



function render() {
    //Intersect();
    renderer.render(scene, camera);

}

function Intersect() {

    // find intersections
    //camera.updateMatrixWorld();

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(loadedObj.children);

    if (intersects.length > 0) {
        //console.log("intersected", intersects);

        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED)
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0x00FF00);

        }

    } else {
        if (INTERSECTED) {
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        }
        INTERSECTED = null;
    }

}

function ShowHideCube() {

    cube.visible = !cube.visible;

}

//keyboard arrows
document.onkeydown = checkKey;

function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '65') {
        // A key
        var x=randomRange(0,10);
        var y=randomRange(0,10);
        var z=randomRange(0,10);
        splineArray.push(new THREE.Vector3(x,y,z));
        //mainObject.geometry.verticesNeedUpdate = true;
        console.log(splineArray.length);
        //console.log("A", mainObject.geometry);
        active = true;
    }

    if (e.keyCode == '37') {
        // left arrow
        

    }
    else if (e.keyCode == '39') {
        // right arrow

    }

}

function onDocumentMouseMove(event) {

    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

}

function createRandomLine(){

    var x=randomRange(-5,5);
    var y=randomRange(-5,5);
    var z=randomRange(-5,5);
    splineArray.push(new THREE.Vector3(x,10+y,z));

}

function animate() {

    setTimeout(function () {

        requestAnimationFrame(animate);

    }, 1000 / 10); //forcing 30FPS
    if(active)
        createRandomLine();

    //Updating lines
    drawCount = splineArray.length;

    line.geometry.setDrawRange(0, drawCount);

    updatePositions();

    line.geometry.attributes.position.needsUpdate = true;

    controls.update();
    render();

}




