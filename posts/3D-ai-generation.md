---
title: '3D AI Asset Generation'
date: '2026-04-19'
description: 'Experimenting with building an AI asset generation pipeline using Tripo and Blender.'
tags: 'AI, 3D, Blender'
author: 'Gentry Demchak'
image: 'content-assets/blender-3d-clean-mesh-facecount.png'
---

I experimented with [Tripo Studio](https://studio.tripo3d.ai/) to generate 3D ship assets for my [Space Commander](/posts/space-commander/) game. 

One of the problems with these 3D asset generators is that they produce a large number of polygons, which can severely impact performance especially for a browser based game.

One of the solutions is to use blender scripting to reduce the face count. 

```python
import bpy

obj = bpy.context.active_object

if obj and obj.type == 'MESH':
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # 1. Smooth the mesh slightly to flatten AI noise
    smooth_mod = obj.modifiers.new(name="Smooth", type='SMOOTH')
    smooth_mod.factor = 0.5
    smooth_mod.iterations = 2
    bpy.ops.object.modifier_apply(modifier=smooth_mod.name)
    
    # 2. More aggressive Planar (10 degree limit)
    planar_mod = obj.modifiers.new(name="Planar", type='DECIMATE')
    planar_mod.decimate_type = 'DISSOLVE'
    planar_mod.angle_limit = 0.174533  # 10 degrees
    bpy.ops.object.modifier_apply(modifier=planar_mod.name)
    
    # 3. Final Collapse to catch curves
    collapse_mod = obj.modifiers.new(name="Collapse", type='DECIMATE')
    collapse_mod.ratio = 0.5 # Cut whatever is left in half
    bpy.ops.object.modifier_apply(modifier=collapse_mod.name)

    print(f"Final Face Count: {len(obj.data.polygons)}")
```

![frigate](content-assets/blender-frigate.png)

Some work still needs to be done to figure out how to automate this 3D mesh cleanup pipeline.

Another alternative I'm considering is to create a parametric ship builder using threejs. 

