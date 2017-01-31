# [Project 2: ToolBox Functions](https://github.com/MegSesh/Project2-Toolbox-Functions)

## Description

The objective of this assignment is to procedurally model and animate a bird wing. Let's get creative!

## Implementation Details

In this assignment, I decided to focus more on the animation of the wing to make it look more realistic, rather than creating a wing that looks really beautiful (this will be my next focus).

I viewed a couple of examples (one listed below under References), and I noticed that the curve essentially acts like a bone that the feathers could be attached to, and so if the bone moves, the wings would move accordingly. However, the feathers closer to the body change their curvature less the ones at the end, which is what I tried to emulate in the animation.

  - createFeatherCurve: A function that creates a cubic bezier curve based on 4 control points. A number of vertices (changeable by a user) are placed along a line constructed by the curve, and feather obj models are placed at each vertex.

  - toonShader: a MeshToonMaterial created to give the feathers a beautiful toon shader like color, based off a base color, reflectivity, specularity, and shininess

  - onLoad: setting up the scene, reading in the feather obj model, and setting up GUI variables

  - onUpdate: this is where I work more on the animation. I have one section that moves the vertices on the curve (and the feathers along with it), thus creating the flapping motion. Another section in the function tries to emulate a wind force that blows the wings in different directions


## Results

1. Control Panel (these are the ideal values): ![alt text](https://github.com/MegSesh/Project2-Toolbox-Functions/blob/master/results/controls.png "Image 1")


2. Wing 1:
![alt text](https://github.com/MegSesh/Project2-Toolbox-Functions/blob/master/results/wing_down.png "Image 2")


3. Wing 2:
![alt text](https://github.com/MegSesh/Project2-Toolbox-Functions/blob/master/results/wing_up.png "Image 3")



## Lessons

In this homework assignment, I learned a lot about how to analyze a wing, and how you can actually break down into a lot of simplistic mathematical principles. I had a lot of fun creating and animating the wing, and I hope to do more with this soon!


## References

  - I used this [example](https://threejs.org/examples/?q=li#webgl_lights_hemisphere) as a reference for wing flaps.
