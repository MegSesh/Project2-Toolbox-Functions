
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

//==================================================================================================================
var featherGeo;
var featherList = [];
var bezierGeometryForOnUpdate = [];
var bezierCurveObjectOnUpdate;

var guiVars = {
    //The curvature of the wing's basic shape
    wingCurvatureX : 0.0,
    //Feather distribution
    //changing distribution = changing bias
    wingCurvatureY : 0.0,
    //Feather size
    featherSize : 1.0,
    //Feather color
    featherColor : 0.1,
    //Feather orientation
    featherOrientation : 0.0,
    //Flapping speed
    flappingSpeed : 10.0,
    //Flapping motion
    flappingMotion : 0.1,
    //num of feathers
    numFeathers : 10.0,
    //wind direction
    windDirection: 1000
}//end guiVars

//defining toon shader
function toonShader(colorOffset) {
    var toonGreenMaterial;
    var stepSize = 1.0/5.0;

    for ( var alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex ++ ) {
          var specularShininess = Math.pow(2.0 , alpha * 10.0 );

          for ( var beta = 0; beta <= 1.0; beta += stepSize ) {
              var specularColor = new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 );

              for ( var gamma = 0; gamma <= 1.0; gamma += stepSize ) {
                  var offset = colorOffset;
                  var diffuseColor = new THREE.Color().setHSL( alpha * offset, 0.5, gamma * 0.5 ).multiplyScalar( 1.0 - beta * 0.2 );

                  toonGreenMaterial = new THREE.MeshToonMaterial( {
                        color: diffuseColor,
                        specular: specularColor,
                        reflectivity: beta,
                        shininess: specularShininess,
                        shading: THREE.SmoothShading
                  } );//end var toon material
              }//end for gamma
          }//end for beta
    }//end for alpha

    return toonGreenMaterial;
}


function createFeatherCurve(numCurvePoints, featherGeometry, sceneVar, feathercolor, featherorientation, curvatureoffsetX, curvatureoffsetY) {
    var bezierCurve = new THREE.CubicBezierCurve(
      new THREE.Vector2( -10, 0, 0 ),
      new THREE.Vector2( -5, 15, 0 ),
      new THREE.Vector2( 20 + curvatureoffsetX, 15 + curvatureoffsetY, 0 ),
      new THREE.Vector2( 30 + curvatureoffsetX, 15 + curvatureoffsetY, 0 )
    );
    var bezierPath = new THREE.Path( bezierCurve.getPoints( numCurvePoints ) );
    var bezierGeometry = bezierPath.createPointsGeometry( numCurvePoints );

    //SAVING THE VAR FOR ON UPDATE
    bezierGeometryForOnUpdate = bezierGeometry.vertices;

    var bezierMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    // Create the final object to add to the scene
    var bezierCurveObject = new THREE.Line(bezierGeometry, bezierMaterial );

    //SAVING VAR FOR ON UPDATE
    bezierCurveObjectOnUpdate = bezierCurveObject;

    //remove the feathers every time you change the number in the gui
    for(var j = 0; j < featherList.length; j++)
    {
      sceneVar.remove(featherList[j]);
    }

    //add the feather obj at every point along the curve
    for(var i = 0; i < numCurvePoints; i++)
    {
        var featherMesh = new THREE.Mesh(featherGeometry, feathercolor);//toonShader(feathercolor));
        featherMesh.name = "onCurveFeather" + i.toString();
        //set position of every feather to be the point at i
        featherMesh.position.set(bezierGeometry.vertices[i].x, bezierGeometry.vertices[i].y, bezierGeometry.vertices[i].z);
        featherMesh.scale.set(5.0, 5.0, 5.0);

        //if i set orientation here, i'd have to call createfeathers in the onchange function
        featherMesh.rotateY(Math.sin(featherorientation));//180));

        sceneVar.add(featherMesh);

        featherList.push(featherMesh);
    }//end for loop adding feathers for every point along the curve

  //sceneVar.add(bezierCurveObject);
}//end of create feather function



// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // Basic Lambert white
    var lambertWhite = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

    // Set light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = 'images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    scene.background = skymap;


    // load a simple obj mesh
    var objLoader = new THREE.OBJLoader();
    objLoader.load('geo/feather.obj', function(obj) {

        // LOOK: This function runs after the obj has finished loading
        //var featherGeo = obj.children[0].geometry; //the actual mesh could have more than 1 part. hence the array
        featherGeo = obj.children[0].geometry;

        var featherMesh = new THREE.Mesh(featherGeo, lambertWhite);
        featherMesh.name = "feather";
        scene.add(featherMesh);


        //CALL FEATHER CURVE FUNCTION HERE SO THAT WE CAN PASS IN FEATHER OBJ GEOMETRY
        createFeatherCurve(guiVars.numFeathers, featherGeo, scene, toonShader(guiVars.featherColor), guiVars.featherOrientation, guiVars.wingCurvatureX, guiVars.wingCurvatureY);

    });

    // set camera position
    camera.position.set(0, 1, 5);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // scene.add(lambertCube);
    scene.add(directionalLight);


    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });


    //==================================================================================================================
    gui.add(guiVars, 'wingCurvatureX', 0, 5).onChange(function(newVal) {
      guiVars.wingCurvatureX = newVal;
      createFeatherCurve(guiVars.numFeathers, featherGeo, scene, toonShader(guiVars.featherColor), guiVars.featherOrientation, guiVars.wingCurvatureX, guiVars.wingCurvatureY);
    });

    gui.add(guiVars, 'wingCurvatureY', 0, 5).onChange(function(newVal) {
      guiVars.wingCurvatureY = newVal;
      createFeatherCurve(guiVars.numFeathers, featherGeo, scene, toonShader(guiVars.featherColor), guiVars.featherOrientation, guiVars.wingCurvatureX, guiVars.wingCurvatureY);
    });

    gui.add(guiVars, 'featherSize', 1, 20).onChange(function(newVal) {
      guiVars.featherSize = newVal;
    });

    gui.add(guiVars, 'featherColor', 0, 1).onChange(function(newVal) {
      guiVars.featherColor = newVal;
      //call toon shader
      //call createFeatherCurve with new toon shader and the gui var num feathers and feather geo
      createFeatherCurve(guiVars.numFeathers, featherGeo, scene, toonShader(guiVars.featherColor), guiVars.featherOrientation, guiVars.wingCurvatureX, guiVars.wingCurvatureY);
    });

    gui.add(guiVars, 'featherOrientation', 0, 180).onChange(function(newVal) {
      guiVars.featherOrientation = newVal;
      createFeatherCurve(guiVars.numFeathers, featherGeo, scene, toonShader(guiVars.featherColor), guiVars.featherOrientation, guiVars.wingCurvatureX, guiVars.wingCurvatureY);

    });

    gui.add(guiVars, 'flappingSpeed', 10, 1000).onChange(function(newVal) {
      guiVars.flappingSpeed = newVal;
    });

    gui.add(guiVars, 'flappingMotion', 0.1, 0.9).onChange(function(newVal) {
      guiVars.flappingMotion = newVal;
    });

    gui.add(guiVars, 'numFeathers', 5, 50).onChange(function(newVal) {
      guiVars.numFeathers = newVal;
      createFeatherCurve(guiVars.numFeathers, featherGeo, scene, toonShader(guiVars.featherColor), guiVars.featherOrientation, guiVars.wingCurvatureX, guiVars.wingCurvatureY);
    });

    gui.add(guiVars, 'windDirection', 1000, 5000).onChange(function(newVal) {
      guiVars.windDirection = newVal;
    });

}//end on load

// called on frame updates
function onUpdate(framework) {
    var feather = framework.scene.getObjectByName("feather");
    if (feather !== undefined) {
        // Simply flap wing
        var date = new Date();
        feather.rotateZ(Math.sin(date.getTime() / 100) * 2 * Math.PI / 180);

        //var output = (Math.sin(date.getTime() / 100) * 2 * Math.PI / 180);
        //console.log(output);
    }//end if


    // var bezierGeometryForOnUpdate = [];

    //FLAPPING CHANGES CONTROL POINTS OF CURVE
    var len = bezierGeometryForOnUpdate.length;
    for(var j = 0; j < len; j++)
    {
        // var featherMesh = new THREE.Mesh(featherGeo2, lambertWhite);
        // featherMesh.name = "onCurveFeather2_" + i.toString();
        // //set position of every feather to be the point at i
        // featherMesh.position.set(bezierGeometry2.vertices[i].x, bezierGeometry2.vertices[i].y, bezierGeometry2.vertices[i].z);
        // featherMesh.scale.set(5.0, 5.0, 5.0);
        // scene.add(featherMesh);
        //
        // featherList2.push(featherMesh);
        var time = new Date();
        var original_y = bezierGeometryForOnUpdate[j].y;

        //bezierGeometry.vertices[j].x;
        //bezierGeometryForOnUpdate[j].y  = original_y * Math.sin(time.getTime());
        //bezierGeometry.vertices[j].z;

        //instead of just j, divide by some value of a sin curve with varying amplitude
        //put in the value of some toolbox function that is really slow and then shoots up in the end
        var flapping_value = (len - (j * guiVars.flappingMotion));//0.8));
        bezierCurveObjectOnUpdate.geometry.vertices[j].y = original_y + (Math.sin(time.getTime() / guiVars.flappingSpeed) / flapping_value);//50) / flapping_value);
    }

    if(bezierCurveObjectOnUpdate !== undefined)
    {
        bezierCurveObjectOnUpdate.geometry.verticesNeedUpdate = true;
    }


    // var bezierCurveObjectOnUpdate;
    //create array of feathers that im creating in loadobj
    //loop through those feathers here and do the same rotation call as above
    for(var i = 0; i < featherList.length; i++)
    {
        //FLAPPING CHANGES CONTROL POINTS OF CURVE
        var animated_feather = framework.scene.getObjectByName("onCurveFeather" + i.toString());
        if (animated_feather !== undefined)
        {
            var date2 = new Date();
            //animated_feather.rotateZ(Math.sin(date2.getTime() / 100) * 2 * Math.PI / 180);
            //setting the feathers to be at the changed place of the curve
            animated_feather.position.set(bezierCurveObjectOnUpdate.geometry.vertices[i].x, bezierCurveObjectOnUpdate.geometry.vertices[i].y, bezierCurveObjectOnUpdate.geometry.vertices[i].z);


            animated_feather.scale.set(guiVars.featherSize, guiVars.featherSize, guiVars.featherSize);

            //WIND CHANGES FEATHERS
            //WIND FORCE CALCULATION
            /*
                Add a wind force to your scene, and parameterize its direction and speed.
                You will use this wind force to animate the feathers of your wing by vibrating them slightly.
                Using Dat.GUI, allow the user to modify these wind parameters.
            */
            var time = new Date();
            var windStrength = Math.cos( time.getTime() / 7000 ) * 20;// + 40;
            var windForce = new THREE.Vector3(0, 0, 0);
            windForce.x = Math.sin( time.getTime()  / 2000);
            windForce.y = Math.cos( time.getTime()  / 3000);
            windForce.z = Math.sin( time.getTime()  / 1000);
            windForce.normalize().multiplyScalar(windStrength);


            //cap x to bounds of a and b
            //Math.max(a, Math.min(x, b))
            //Math.max(0.0, Math.min(windForce.y, 40.0));

            //animated_feather.rotateY( Math.max(0, Math.min(windForce.y, 1)) / 5000 );
            // / (featherList.length - 0.9 * i))

            var rotate_X = Math.max(0.0, Math.min(windForce.x, 40.0));
            var rotate_Y = Math.max(0.0, Math.min(windForce.y, 20.0));


            var original_rotation_x = animated_feather.rotation.x;
            var original_rotation_y = animated_feather.rotation.y;
            var original_rotation_z = animated_feather.rotation.z;
            //wind direction --> 5000 is ideal
            animated_feather.rotation.set(original_rotation_x, original_rotation_y + windForce.y / (guiVars.windDirection + i), original_rotation_z)

            //animated_feather.rotateY((90 / 100) * 2 * Math.PI / 180);


            // animated_feather.rotateX(windForce.x /50000);
            // animated_feather.rotateY(windForce.y/ 5000);

            //animated_feather.rotateX(rotate_X /50000);
            //animated_feather.rotateY(rotate_Y/ 50000);
            //animated_feather.rotateZ(windForce.z / 5000);

            //console.log(rotate_X);

            //animated_feather.rotateY(windForce.z / 5000);

            //date.getTime() / 100) * 2 * Math.PI / 180

        }//end if
    }//end for each feather in feather list


}//end on update

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
