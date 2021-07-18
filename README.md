# Polymathic Paint

Canvas painting module component

## [paint.polymathicdesign.com](http:/paint.polymathicdesign.com)

**High Speed Canvas Painting Component** 

Tools include - Paint, Spray, Pen, Bucket Fill, Eraser

To change tool, brush or colour - click the icon and select a new tool, brush or colour from the modal.

Bucket fill uses a custom algorithm that is 100s of times faster than StackOverflow recommended answers

* To use, import createPolymathicPaint from './paint.js';
* create an instance of the component, add at least one Canvas, and add at least one brush (ideally a minimum of 2 brushes).
* set the active tool by passing in one of the following strings - paint, spray, pen, fill, eraser.
* set the active brush by passing in an index of one of the added brushes, at program start index 0 would be suggested.
* Write your own controller app, or use th vanilla app.js as an example.

The paint component uses a modified class architecture to enable private properties and methods within a class using module scope.
Do not pass the created instance to the data context of Vue or other mutating methods that set getters and setter observers.

In the url and code examples the canvas has been set to the entire screen. However, the canvas can be set to any size. Create the canvas as a tag in the markup and pass the node to the addCanvas method. The method will then set the size to the DOM size.

Resizing the canvas will wipe the content.

Note: colour, size and transparency is held within each brush property data similar to Corel Painter. A change of brush can change the current colour, size and transparency. This logic is slightly different to some art software such as Illustrator where the size and transparency are all independent. It was decided that Corel Painter was the better UX as retaining all the properties at a brush level allows more natural painting style and quick change of brush.
