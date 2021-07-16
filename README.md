# Polymathic Paint

Canvas painting module component

## [paint.polymathicdesign.com](http:/paint.polymathicdesign.com)

**High Speed Canvas Painting Component** 

Tools include - Paint, Spray, Pen, Bucket Fill, Eraser

To change tool, brush or colour - click the icon and select a new tool, brush or colour from the modal.

Bucket fill uses a custom algorithm that is 100s of times faster than StackOverflow recommended answers

* To use, import createPolymathicPaint from './paint.js';
* create an instance of the component, add at least one Canvas, and add at least one brush (ideally 2).
* set the active tool by supplying passing in one of the following strings - paint, spray, pen, fill, eraser.
* set the active brush by passing in an idex of one of the added brushes.
* Write your own controller app, or use th vanilla app.js as an example.

The paint component uses a modified class architecture to enable private properties and methods within a class using module scope.
Do not pass the created instance to the data context of Vue or other mutating methods that set getters and setter observers.

In the url and code examples the canvas has been set to the entire screen. However, the canvas can be set to any size. Create the canvas as a tag in the markup and pass the node to the addCanvas method. The method will then set the size to the DOM size.

Resizing the canvas will wipe the content.

